/**
 * Script para preparar e fazer deploy de projetos Google Apps Script
 * 
 * Este script lê o arquivo de configuração YAML, processa os templates
 * e copia os arquivos compilados para as pastas de destino.
 * 
 * O script é projetado para ser genérico e lidar com qualquer estrutura de projeto
 * definida no arquivo de configuração YAML. Ele também cria pastas separadas para
 * ambientes de desenvolvimento e produção.
 * 
 * Uso:
 * - Sem parâmetros: processa todos os projetos em ambos ambientes (dev/prod)
 * - --env=dev|prod: processa apenas projetos do ambiente especificado
 * - --config=arquivo.yml: usa um arquivo de configuração alternativo
 * - --project=nome: processa apenas o projeto especificado
 * - --<chave>=<valor>: filtra projetos com a chave/valor especificados (ex: --year=2025)
 * - --clean: limpa os diretórios de build e dist antes de processar
 * - --push: faz push para o Google Apps Script após o processamento
 */


// Importar o módulo de carregamento de configuração
import * as configHelper from './config-helper.js';
import * as filesystemHelper from './filesystem-helper.js';
import * as claspHelper from './clasp-helper.js';
import * as templateHelper from './template-helper.js';

/**
 * Processa todos os projetos definidos na configuração
 * @param {Object} config Configuração completa
 * @param {string} environment Ambiente (dev/prod)
 * @param {Object} filters Filtros adicionais (ex: {year: '2024'})
 * @param {boolean} doPush Executar push após processamento
 * @param {Object} paths Caminhos dos diretórios
 * @returns {Array} Lista de diretórios de saída processados
 */
function processAllProjects(config, environment, filters = {}, doPush = false, paths) {
  const outputDirs = [];
  const projects = config.projects || {};
  
  console.log(`Processando todos os projetos para ambiente: ${environment}`);
  console.log(`Filtros aplicados: ${JSON.stringify(filters)}`);
  
  for (const projectKey in projects) {
    // Se um filtro de projeto foi especificado e não corresponde, pular
    if (filters.project && filters.project !== projectKey) {
      continue;
    }
    
    // Verificar se o projeto tem configuração para o ambiente atual
    const projectConfig = projects[projectKey] || {};
    const nestedStructure = projectConfig.nested || [];
    
    if (nestedStructure.length > 0) {
      // Processar projeto com estrutura aninhada
      processNestedProject(config, projectKey, environment, nestedStructure, filters, doPush, outputDirs, paths);
    } else {
      // Processar projeto sem estrutura aninhada
      const result = templateHelper.processProjectTemplates(config, projectKey, environment, filters, paths);
      if (result && result.outputDir) {
        outputDirs.push(result.outputDir);
        
        // Executar push se solicitado
        if (doPush) {
          claspHelper.pushProject(result.outputDir);
        }
      }
    }
  }
  
  console.log(`Processados ${outputDirs.length} projetos para ambiente de ${environment === 'dev' ? 'desenvolvimento' : 'produção'}`);
  return outputDirs;
}

/**
 * Processa um projeto com estrutura aninhada
 * @param {Object} config Configuração completa
 * @param {string} projectKey Chave do projeto
 * @param {string} environment Ambiente (dev/prod)
 * @param {Array} nestedStructure Estrutura aninhada do projeto
 * @param {Object} filters Filtros adicionais
 * @param {boolean} doPush Executar push após processamento
 * @param {Array} outputDirs Lista de diretórios de saída
 * @param {Object} paths Caminhos dos diretórios
 */
function processNestedProject(config, projectKey, environment, nestedStructure, filters, doPush, outputDirs, paths) {
  // Obter as configurações específicas do ambiente
  // const envConfig = config.environments && config.environments[environment] || {};
  
  // Processar o primeiro nível da estrutura aninhada
  const firstLevel = nestedStructure[0];
  const firstLevelKey = firstLevel.key;
  
  // Se um filtro para este nível foi especificado, usar apenas esse valor
  if (filters[firstLevelKey]) {
    processNestedLevel(config, projectKey, environment, nestedStructure, 0, { ...filters }, doPush, outputDirs);
    return;
  }
  
  // Caso contrário, procurar todos os valores disponíveis para este nível no arquivo de configuração
  const availableValues = getAvailableValuesForKey(config, environment, projectKey, firstLevelKey);
  
  if (availableValues.length === 0) {
    console.log(`Nenhum valor encontrado para a chave ${firstLevelKey} no projeto ${projectKey}`);
    return;
  }
  
  console.log(`Processando projeto ${projectKey} para ${availableValues.length} valores de ${firstLevelKey}...`);
  
  for (const value of availableValues) {
    const levelFilters = { ...filters, [firstLevelKey]: value };
    processNestedLevel(config, projectKey, environment, nestedStructure, 0, levelFilters, doPush, outputDirs, paths);
  }
}

/**
 * Processa um nível da estrutura aninhada
 * @param {Object} config Configuração completa
 * @param {string} projectKey Chave do projeto
 * @param {string} environment Ambiente (dev/prod)
 * @param {Array} nestedStructure Estrutura aninhada do projeto
 * @param {number} level Nível atual
 * @param {Object} filters Filtros acumulados
 * @param {boolean} doPush Executar push após processamento
 * @param {Array} outputDirs Lista de diretórios de saída
 * @param {Object} paths Caminhos dos diretórios
 */
function processNestedLevel(config, projectKey, environment, nestedStructure, level, filters, doPush, outputDirs, paths) {
  // Se chegamos ao final da estrutura aninhada, processar o projeto
  if (level >= nestedStructure.length) {
    const result = templateHelper.processProjectTemplates(config, projectKey, environment, filters, paths);
    if (result && result.outputDir) {
      outputDirs.push(result.outputDir);
      
      // Executar push se solicitado
      if (doPush) {
        claspHelper.pushProject(result.outputDir);
      }
    }
    return;
  }
  
  const currentLevel = nestedStructure[level];
  const currentKey = currentLevel.key;
  
  // Se já temos um filtro para este nível, processar o próximo nível
  if (filters[currentKey]) {
    processNestedLevel(config, projectKey, environment, nestedStructure, level + 1, filters, doPush, outputDirs);
    return;
  }
  
  // Caso contrário, procurar todos os valores disponíveis para este nível
  const availableValues = getAvailableValuesForKey(config, environment, projectKey, currentKey, filters);
  
  if (availableValues.length === 0) {
    console.log(`Nenhum valor encontrado para a chave ${currentKey} no projeto ${projectKey}`);
    return;
  }
  
  console.log(`Processando nível ${level} (${currentKey}) com ${availableValues.length} valores...`);
  
  for (const value of availableValues) {
    const levelFilters = { ...filters, [currentKey]: value };
    processNestedLevel(config, projectKey, environment, nestedStructure, level + 1, levelFilters, doPush, outputDirs);
  }
}

/**
 * Obtém os valores disponíveis para uma chave em um projeto
 * @param {Object} config Configuração completa
 * @param {string} environment Ambiente (dev/prod)
 * @param {string} projectKey Chave do projeto
 * @param {string} key Chave a ser procurada
 * @param {Object} filters Filtros já aplicados
 * @returns {Array} Lista de valores disponíveis
 */
function getAvailableValuesForKey(config, environment, projectKey, key, filters = {}) {
  // Obter a configuração do projeto
  const projectConfig = config.projects && config.projects[projectKey] || {};
  
  // Obter a estrutura aninhada do projeto usando projects-structure
  const projectStructure = config.defaults && config.defaults['projects-structure'] && 
                          config.defaults['projects-structure'][projectKey] || {};
  const nestedStructure = projectStructure.nested || projectConfig.nested || [];
  const nestedKeys = nestedStructure.map(item => item.key);
  
  // Verificar se a chave solicitada está na estrutura aninhada
  if (!nestedKeys.includes(key)) {
    return [];
  }
  
  // Obter a configuração de ambientes
  const envConfig = config.projects[projectKey].environments && 
                   config.projects[projectKey].environments[environment] || {};
  
  // Determinar o nível da chave na estrutura aninhada
  const keyLevel = nestedKeys.indexOf(key);
  
  // Processar de acordo com o nível da chave
  if (keyLevel === 0) {
    // Primeiro nível: retornar todas as chaves no nível do ambiente
    return Object.keys(envConfig);
  } else if (keyLevel > 0) {
    // Níveis subsequentes: verificar chaves anteriores nos filtros
    const prevKey = nestedKeys[keyLevel - 1];
    const prevValue = filters[prevKey];
    
    if (prevValue && envConfig[prevValue]) {
      return Object.keys(envConfig[prevValue]);
    }
  }
  
  // Verificar se há valores disponíveis na configuração do projeto via mapping
  const mapping = projectConfig.mapping || {};
  const keysTemplate = mapping['keys-template'] || [];
  
  for (const template of keysTemplate) {
    if (template.key === key && template.nameTemplate && template.nameTemplate.substitutions) {
      const substitutions = template.nameTemplate.substitutions || [];
      return substitutions.map(sub => Object.keys(sub)[0]);
    }
  }
  
  return [];
}

/**
 * Função principal
 */
function main() {
  // Obter argumentos da linha de comando
  const args = process.argv.slice(2);
  let projectKey = null;
  let environment = null; // Processar ambos os ambientes por padrão
  let configFile = configHelper.DEFAULT_CONFIG_FILE;
  let doPush = false;
  let doClean = false;
  const filters = {};

  // Processar argumentos
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--project=')) {
      projectKey = arg.split('=')[1];
      filters.project = projectKey;
    } else if (arg.startsWith('--env=')) {
      environment = arg.split('=')[1];
    } else if (arg.startsWith('--config=')) {
      configFile = arg.split('=')[1];
    } else if (arg === '--push') {
      doPush = true;
    } else if (arg === '--clean') {
      doClean = true;
    } else if (arg.includes('=')) {
      const [key, value] = arg.replace('--', '').split('=');
      filters[key] = value;
    }
  }
  
  // Não definimos valores padrão para os filtros
  // O script deve processar apenas as configurações existentes no arquivo YAML
  
  // Carregar configuração usando o módulo compartilhado
  const config = configHelper.loadConfig(configFile);
  
  // Inicializar caminhos globais
  const paths = configHelper.initializePaths(config);
  
  // Adicionar os caminhos ao objeto config para uso nas funções
  config.paths = paths;
  
  // Limpar diretórios se solicitado
  if (doClean) {
    filesystemHelper.cleanDirectories(paths.build, paths.dist, false, true);
  }

  // Verificar se os diretórios de build existem e executar o build se necessário
  const selectedProject = filters.project || null;
  const buildSuccess = filesystemHelper.ensureBuildBeforeDeploy(config, paths, selectedProject, false);
  
  // Se o build falhou, interromper o deploy
  if (!buildSuccess) {
    console.error('Build falhou, interrompendo o deploy.');
    process.exit(1);
  }

  // Se não foi especificado um ambiente, processar ambos
  if (!environment) {
    console.log('Nenhum ambiente especificado, processando ambos (dev e prod)');
    
    // Processar ambiente de desenvolvimento
    const devOutputDirs = processAllProjects(config, 'dev', filters, doPush);
    console.log(`Processados ${devOutputDirs.length} projetos para ambiente de desenvolvimento`);
    
    // Processar ambiente de produção
    const prodOutputDirs = processAllProjects(config, 'prod', filters, doPush);
    console.log(`Processados ${prodOutputDirs.length} projetos para ambiente de produção`);
  } else {
    // Validar o ambiente
    if (environment !== 'dev' && environment !== 'prod') {
      console.warn(`Ambiente "${environment}" não reconhecido. Usando "dev" como padrão.`);
      environment = 'dev';
    }
    
    // Se um projeto específico foi solicitado
    if (projectKey) {
      console.log(`Processando projeto específico: ${projectKey} (${environment})`);
      console.log(`Filtros adicionais: ${JSON.stringify(filters)}`);
      
      // Processar templates para o projeto específico
      const result = templateHelper.processProjectTemplates(config, projectKey, environment, filters);
      
      // Executar push se solicitado
      if (doPush && result && result.outputDir) {
        claspHelper.pushProject(result.outputDir);
      }
    } else {
      // Processar todos os projetos para o ambiente especificado
      const outputDirs = processAllProjects(config, environment, filters, doPush);
      console.log(`Processados ${outputDirs.length} projetos para ambiente ${environment}`);
    }
  }
  
  console.log('Deploy concluído com sucesso!');
}

// Executar a função principal
main();
