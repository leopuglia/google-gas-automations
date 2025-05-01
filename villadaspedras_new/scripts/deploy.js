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

import fs from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import { execSync } from 'child_process';

// Importar o módulo de carregamento de configuração
import * as configLoader from './config-loader.js';
import { cleanDirectories, ensureBuildBeforeDeploy } from './utils.js';

/**
 * Processa um template com Handlebars
 * @param {string} templatePath Caminho do template
 * @param {string} outputPath Caminho de saída
 * @param {Object} context Contexto para substituição
 */
function processTemplate(templatePath, outputPath, context) {
  try {
    if (!fs.existsSync(templatePath)) {
      console.error(`Template não encontrado: ${templatePath}`);
      return;
    }

    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Registrar helper para verificar se é o último item de um array
    Handlebars.registerHelper('unless', function(conditional, options) {
      if (!conditional) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });
    
    // Registrar helper para verificar se é o último item de um array
    Handlebars.registerHelper('last', function(array, options) {
      if (array && array.length > 0) {
        return options.fn(array[array.length - 1]);
      } else {
        return options.inverse(this);
      }
    });
    
    const template = Handlebars.compile(templateContent);
    const result = template(context);
    
    // Garantir que o diretório de saída existe
    fsExtra.ensureDirSync(path.dirname(outputPath));
    
    fs.writeFileSync(outputPath, result);
    console.log(`Template processado: ${outputPath}`);
  } catch (error) {
    console.error(`Erro ao processar template ${templatePath}: ${error.message}`);
  }
}

/**
 * Processa os templates para um projeto específico
 * @param {Object} config Configuração completa
 * @param {string} projectKey Chave do projeto
 * @param {string} environment Ambiente (dev/prod)
 * @param {Object} keys Chaves adicionais para substituição
 */
function processProjectTemplates(config, projectKey, environment, keys = {}) {
  try {
    const projectConfig = config.projects[projectKey];
    if (!projectConfig) {
      throw new Error(`Projeto "${projectKey}" não encontrado na configuração.`);
    }
    
    // Verificar se há configurações de ambiente
    let envConfig;
    
    // Primeiro, verificar na nova estrutura recomendada: projects.{project}.environments.{env}
    if (projectConfig.environments && projectConfig.environments[environment]) {
      envConfig = projectConfig.environments[environment];
    }
    // Segundo, verificar na estrutura environments.{env}.{project}
    else if (config.environments && config.environments[environment] && config.environments[environment][projectKey]) {
      envConfig = config.environments[environment][projectKey];
    }
    // Terceiro, verificar na estrutura antiga (configurações de ambiente no próprio projeto)
    else if (projectConfig[environment]) {
      envConfig = projectConfig[environment];
    }
    // Se não houver configurações de ambiente
    else {
      // Se não é o ambiente padrão (dev), retornar null
      if (environment !== 'dev') {
        console.warn(`Ambiente "${environment}" não encontrado para o projeto "${projectKey}". Pulando.`);
        return null;
      }
      // Para o ambiente padrão, usar um objeto vazio
      console.warn(`Ambiente "${environment}" não encontrado para o projeto "${projectKey}". Usando configurações padrão.`);
      envConfig = {};
    }

    // Verificar a estrutura do projeto
    const projectStructure = config.defaults['projects-structure']?.[projectKey];
    if (!projectStructure) {
      console.warn(`Estrutura do projeto "${projectKey}" não encontrada na configuração. Usando estrutura padrão.`);
    }
    
    // Processar estrutura aninhada se existir
    let nestedConfig = envConfig;
    let nestedKeys = {};
    
    if (projectStructure?.nested) {
      // Para cada chave aninhada definida na estrutura do projeto
      for (const nestedItem of projectStructure.nested) {
        const keyName = nestedItem.key;
        if (keys[keyName]) {
          // Se a chave foi fornecida nos argumentos
          if (nestedConfig[keys[keyName]]) {
            nestedConfig = nestedConfig[keys[keyName]];
            nestedKeys[keyName] = keys[keyName];
          }
        }
      }
    } else {
      // Se não há estrutura aninhada definida, usar as chaves diretamente
      for (const key in keys) {
        if (keys[key] && nestedConfig[keys[key]]) {
          nestedConfig = nestedConfig[keys[key]];
          nestedKeys[key] = keys[key];
        }
      }
    }
    
    // Construir contexto para substituição
    const context = {
      ...config.defaults,
      ...projectConfig,
      ...nestedConfig,
      ...keys,
      env: environment,
      timeZone: config.defaults.keys?.find(k => k.timeZone)?.timeZone || 'America/Sao_Paulo',
      runtimeVersion: config.defaults.keys?.find(k => k.runtimeVersion)?.runtimeVersion || 'V8',
      scriptId: nestedConfig.templates && nestedConfig.templates['.clasp-template.json']?.scriptId || '',
      dependencies: projectConfig.dependencies || [],
      sheetsMacros: projectConfig.sheetsMacros || [],
      docsMacros: projectConfig.docsMacros || [],
      formsMacros: projectConfig.formsMacros || [],
      slidesMacros: projectConfig.slidesMacros || [],
      // main_files: ['salarios.js', 'utils.js'],
      main_files: [],
      utils_files: []
    };
    
    console.log('Contexto para substituição:', JSON.stringify(context, null, 2));
    
    // Verificar se existem templates específicos no nestedConfig
    const templatesParaProcessar = new Map();
    
    // Adicionar templates padrão do config.defaults.templates (nova estrutura)
    if (config.defaults.templates) {
      for (const templateKey in config.defaults.templates) {
        const templateConfig = config.defaults.templates[templateKey];
        templatesParaProcessar.set(templateKey, {
          config: templateConfig,
          destinationFile: templateConfig['destination-file']
        });
      }
    }

    // Adicionar ou sobrescrever com templates específicos do nestedConfig
    for (const templateKey in nestedConfig) {
      if (templateKey.endsWith('-template') || templateKey.endsWith('-template.json')) {
        const templateConfig = nestedConfig[templateKey];
        templatesParaProcessar.set(templateKey, {
          config: templateConfig,
          destinationFile: templateConfig['destination-file']
        });
      }
    }
    
    // Resolver o template de saída para o caminho do diretório
    let outputTemplate = projectConfig.outputTemplate || '{{output}}';
    
    // Substituir todas as variáveis no template
    const resolvedOutput = outputTemplate.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      // Verificar primeiro nas chaves aninhadas
      if (nestedKeys[key]) {
        return nestedKeys[key];
      }
      // Depois nas chaves fornecidas
      if (keys[key]) {
        return keys[key];
      }
      // Depois nas propriedades do projeto
      if (projectConfig[key]) {
        return projectConfig[key];
      }
      // Se não encontrar, manter o placeholder
      return match;
    });
    
    // Processar cada template
    for (const [templateKey, templateInfo] of templatesParaProcessar) {
      const templateConfig = templateInfo.config;
      let destinationFileName = templateInfo.destinationFile;
      
      // Mapear o nome do template no arquivo de configuração para o nome real do arquivo
      let templateFileName = templateKey;
      
      // Mapeamento específico para o arquivo .claspignore
      if (templateKey === '.claspignore-template.json') {
        if (fs.existsSync(path.join(config.defaults.paths.templates, '.claspignore-template'))) {
          templateFileName = '.claspignore-template';
        } else {
          templateFileName = '.claspignore-template';
          if (!fs.existsSync(path.join(config.defaults.paths.templates, templateFileName))) {
            templateFileName = '.clasp-template.json';
            destinationFileName = '.clasp.json';
          }
        }
      } 
      // Mapeamento específico para o arquivo .clasp.json
      else if (templateKey === '.clasp-template.json') {
        templateFileName = '.clasp-template.json';
        destinationFileName = '.clasp.json';
      }
      // Mapeamento específico para o arquivo appsscript.json
      else if (templateKey === 'appsscript-template') {
        templateFileName = 'appsscript-template.json';
      }
      
      const templatePath = path.join(config.defaults.paths.templates, templateFileName);
      console.log(`Processando template: ${templatePath} -> ${destinationFileName}`);
      
      // Criar caminho de saída com pasta separada para o ambiente
      const outputDir = path.join(
        config.defaults.paths.dist,
        environment,
        resolvedOutput
      );
      
      const outputPath = path.join(outputDir, destinationFileName);
      
      // Processar o template
      processTemplate(templatePath, outputPath, context);
      
      // Copiar arquivos compilados para a pasta de destino
      // Determinar o diretório de origem correto com base no tipo de projeto
      let srcDir;
      
      // Mapear o nome do projeto para o nome da pasta de build
      // if (projectKey === 'salario') {
      //   srcDir = path.join(config.defaults.paths.build, 'salario');
      // } else if (projectKey === 'consumo') {
      //   srcDir = path.join(config.defaults.paths.build, 'consumo');
      // } else if (projectKey === 'example') {
      //   srcDir = path.join(config.defaults.paths.build, 'example');
      // } else {
      //   // Tentar usar o nome do projeto como diretório
      //   srcDir = path.join(config.defaults.paths.build, projectKey);
      // }
      srcDir = path.join(config.defaults.paths.build, projectKey);
      
      // Verificar se o diretório existe
      if (!fs.existsSync(srcDir)) {
        console.warn(`Diretório de origem não encontrado: ${srcDir}`);
        console.warn('Tentando alternativas...');
        
        // Tentar com o nome no src do projeto
        const srcAltDir = path.join(config.defaults.paths.build, projectConfig.src || projectKey);
        if (fs.existsSync(srcAltDir)) {
          srcDir = srcAltDir;
          console.log(`Usando diretório alternativo: ${srcDir}`);
        } else {
          console.error(`Não foi possível encontrar um diretório de origem válido para o projeto ${projectKey}`);
          console.error(`Diretórios verificados: ${srcDir}, ${srcAltDir}`);
          console.error('Execute o comando "pnpm run build" antes de fazer o deploy');
        }
      }
      
      console.log(`Copiando arquivos de ${srcDir} para ${outputDir}`);
      fsExtra.copySync(srcDir, outputDir);
      console.log(`Arquivos copiados de ${srcDir} para ${outputDir}`);
    }

    return {
      outputDir: path.join(
        config.defaults.paths.dist,
        environment,
        resolvedOutput
      )
    };
  } catch (error) {
    console.error(`Erro ao processar templates para o projeto ${projectKey}: ${error.message}`);
    return null;
  }
}

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
      const result = processProjectTemplates(config, projectKey, environment, filters, paths);
      if (result && result.outputDir) {
        outputDirs.push(result.outputDir);
        
        // Executar push se solicitado
        if (doPush) {
          pushProject(result.outputDir);
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
    const result = processProjectTemplates(config, projectKey, environment, filters, paths);
    if (result && result.outputDir) {
      outputDirs.push(result.outputDir);
      
      // Executar push se solicitado
      if (doPush) {
        pushProject(result.outputDir);
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
 * Executa o comando clasp push para um projeto
 * @param {string} projectDir Diretório do projeto
 */
function pushProject(projectDir) {
  try {
    console.log(`Executando clasp push para: ${projectDir}`);
    execSync('clasp push', { cwd: projectDir, stdio: 'inherit' });
    console.log(`Push concluído com sucesso para: ${projectDir}`);
    return true;
  } catch (error) {
    console.error(`Erro ao executar clasp push para ${projectDir}: ${error.message}`);
    return false;
  }
}

/**
 * Função principal
 */
function main() {
  // Obter argumentos da linha de comando
  const args = process.argv.slice(2);
  let projectKey = null;
  let environment = null; // Processar ambos os ambientes por padrão
  let configFile = configLoader.DEFAULT_CONFIG_FILE;
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
  const config = configLoader.loadConfig(configFile);
  
  // Inicializar caminhos globais
  const paths = configLoader.initializePaths(config);
  
  // Adicionar os caminhos ao objeto config para uso nas funções
  config.paths = paths;
  
  // Limpar diretórios se solicitado
  if (doClean) {
    cleanDirectories(paths.build, paths.dist, false, true);
  }

  // Verificar se os diretórios de build existem e executar o build se necessário
  const selectedProject = filters.project || null;
  const buildSuccess = ensureBuildBeforeDeploy(config, paths, selectedProject, false);
  
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
      const result = processProjectTemplates(config, projectKey, environment, filters);
      
      // Executar push se solicitado
      if (doPush && result && result.outputDir) {
        pushProject(result.outputDir);
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
