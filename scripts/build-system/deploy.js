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
 * - --log-level=<level>: define o nível de log (verbose, debug, info, warn, error, none)
 */


// Importar o módulo de carregamento de configuração
import * as configHelper from './config-helper.js';
import * as filesystemHelper from './filesystem-helper.js';
import * as claspHelper from './clasp-helper.js';
import * as templateHelper from './template-helper.js';
import logger from './logger.js';

/**
 * Processa todos os projetos definidos na configuração
 * @param {Object} config Configuração completa
 * @param {string} environment Ambiente (dev/prod)
 * @param {Object} filters Filtros adicionais (ex: {year: '2024'})
 * @param {boolean} doPush Executar push após processamento
 * @param {Object} paths Caminhos dos diretórios
 * @returns {Array} Lista de diretórios de saída processados
 */
export function processAllProjects(config, environment, filters = {}, doPush = false, paths) {
  const outputDirs = [];
  const projects = config.projects || {};

  logger.highlight(`Processando todos os projetos para ambiente: ${environment}`);
  logger.debug(`Filtros aplicados: ${JSON.stringify(filters)}`);

  for (const projectKey in projects) {
    // Se um filtro de projeto foi especificado e não corresponde, pular
    if (filters.project && filters.project !== projectKey) {
      logger.debug(`Pulando projeto ${projectKey} que não corresponde ao filtro`);
      continue;
    }

    // Verificar se o projeto tem configuração para o ambiente atual
    const projectConfig = projects[projectKey] || {};
    const nestedStructure = projectConfig.nested || [];

    logger.verbose(`Configuração do projeto: ${JSON.stringify(projectConfig)}`);
    // logger.verbose(`Configuração do projeto: ${JSON.stringify(projectConfig, null, 2)}`);

    if (nestedStructure.length > 0) {
      logger.debug(`Processando projeto ${projectKey} com estrutura aninhada`);
      logger.debug(`Estrutura aninhada: ${JSON.stringify(nestedStructure)}`);

      // Processar projeto com estrutura aninhada
      processNestedProject(config, projectKey, environment, nestedStructure, filters, doPush, outputDirs, paths);
    } else {
      logger.debug(`Processando projeto ${projectKey} sem estrutura aninhada`);

      // Processar projeto sem estrutura aninhada
      const result = templateHelper.processProjectTemplates(config, projectKey, environment, filters, paths);

      logger.verbose(`Resultados do processamento: ${JSON.stringify(result)}`);

      if (result && result.outputDir) {
        // logger.debug(`Diretório de saída: ${result.outputDir}`);
        logger.success(`Projeto ${projectKey} processado com sucesso`);

        // Adicionar diretório de saída à lista
        outputDirs.push(result.outputDir);

        // Executar push se solicitado
        if (doPush) {
          logger.highlight(`Executando push para projeto ${projectKey}`, { bold: true });

          claspHelper.pushProject(result.outputDir);
        }
      }
      else {
        logger.warn(`Projeto ${projectKey} não processado`);
      }
    }
  }

  logger.success(`Processados ${outputDirs.length} projetos para ambiente de ${environment === 'dev' ? 'desenvolvimento' : 'produção'}`);
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
export function processNestedProject(config, projectKey, environment, nestedStructure, filters, doPush, outputDirs, paths) {
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
    logger.warn(`Nenhum valor encontrado para a chave ${firstLevelKey} no projeto ${projectKey}`);
    return;
  }

  let nestedKeys = '';
  for (const key in nestedStructure) {
    const nestedStructureKeyAndValues = `${nestedStructure[key].key}=${getAvailableValuesForKey(config, environment, projectKey, nestedStructure[key].key).join(`, ${nestedStructure[key].key}=`)}`;
    logger.verbose(nestedStructureKeyAndValues);
    nestedKeys += `${key > 0 ? ', ' : ''}${nestedStructureKeyAndValues}`;
  }
  // logger.debug(`Processando projeto ${projectKey} com a chave ${firstLevelKey}=${availableValues.join(', ')}...`);
  logger.info(`Processando projeto ${projectKey} com as chaves ${nestedKeys}...`);

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
export function processNestedLevel(config, projectKey, environment, nestedStructure, level, filters, doPush, outputDirs, paths) {
  logger.debug(`Processando nível ${level} do projeto ${projectKey} com filtros: ${JSON.stringify(filters)}`);
  logger.verbose(`Estrutura aninhada: ${JSON.stringify(nestedStructure)}`);
  logger.verbose(`Filtros acumulados: ${JSON.stringify(filters)}`);
  logger.verbose(`Nível atual: ${level}`);
  // logger.verbose(`Diretórios de saída: ${JSON.stringify(outputDirs)}`)
  logger.verbose(`Diretório de saída: ${outputDirs[outputDirs.length - 1]}`);

  // Se chegamos ao final da estrutura aninhada, processar o projeto
  if (level >= nestedStructure.length) {
    logger.debug(`Processando projeto ${projectKey} com filtros: ${JSON.stringify(filters)}`);

    const result = templateHelper.processProjectTemplates(config, projectKey, environment, filters, paths);

    logger.verbose(`Resultados do processamento: ${JSON.stringify(result)}`);

    if (result && result.outputDir) {
      outputDirs.push(result.outputDir);

      let projectIdentifier = projectKey;
      for (const key in filters) {
        projectIdentifier += `-${filters[key]}`;
      }
      // logger.success(`Projeto ${projectIdentifier} em ${result.outputDir} processado com sucesso`);
      logger.success(`Projeto ${projectIdentifier} processado com sucesso`);
      logger.debug(`Diretório de saída: ${result.outputDir}`);

      // Executar push se solicitado
      if (doPush) {
        logger.highlight(`Executando push para projeto ${projectIdentifier}`, { bold: true });

        claspHelper.pushProject(result.outputDir);
      }
    }
    else {
      logger.warn(`Projeto ${projectKey} não processado`);
    }

    return;
  }

  const currentLevel = nestedStructure[level];
  const currentKey = currentLevel.key;

  // logger.verbose(`Processando nível ${level} (${currentKey})`);

  // Se já temos um filtro para este nível, processar o próximo nível
  if (filters[currentKey]) {
    processNestedLevel(config, projectKey, environment, nestedStructure, level + 1, filters, doPush, outputDirs);
    return;
  }

  // Caso contrário, procurar todos os valores disponíveis para este nível
  const availableValues = getAvailableValuesForKey(config, environment, projectKey, currentKey, filters);

  if (availableValues.length === 0) {
    logger.warn(`Nenhum valor encontrado para a chave ${currentKey} no projeto ${projectKey}`);
    return;
  }

  logger.debug(`Processando nível ${level} (${currentKey}) com ${availableValues.length} valores...`);

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
export function getAvailableValuesForKey(config, environment, projectKey, key, filters = {}) {
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
  try {
    // Obter argumentos da linha de comando
    const args = process.argv.slice(2);
    let projectKey = null;
    let environment = null; // Processar ambos os ambientes por padrão
    let configFile = configHelper.DEFAULT_CONFIG_FILE;
    let doPush = false;
    let doClean = false;
    let logLevel = null;
    const filters = {};

    // Processar argumentos
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      try {
        if (arg.startsWith('--project=')) {
          projectKey = arg.split('=')[1];
          if (!projectKey) throw new Error('Valor de projeto não especificado');
          filters.project = projectKey;
        } else if (arg.startsWith('--env=')) {
          environment = arg.split('=')[1];
          if (!environment) throw new Error('Valor de ambiente não especificado');
        } else if (arg.startsWith('--config=')) {
          configFile = arg.split('=')[1];
          if (!configFile) throw new Error('Arquivo de configuração não especificado');
        } else if (arg.startsWith('--log-level=')) {
          logLevel = arg.split('=')[1].toUpperCase();
          if (!logLevel) throw new Error('Nível de log não especificado');
        } else if (arg === '--push') {
          doPush = true;
        } else if (arg === '--clean') {
          doClean = true;
        } else if (arg.includes('=')) {
          const parts = arg.replace('--', '').split('=');
          if (parts.length !== 2) throw new Error(`Argumento inválido: ${arg}`);
          const [key, value] = parts;
          if (!key || !value) throw new Error(`Chave ou valor inválido no argumento: ${arg}`);
          filters[key] = value;
        }
      } catch (argError) {
        logger.error(`Erro ao processar argumento '${arg}': ${argError.message}`);
        process.exit(1);
      }
    }

    // Configurar o nível de log se especificado
    if (logLevel) {
      const levels = logger.levels;
      if (levels[logLevel] !== undefined) {
        logger.configure({ level: levels[logLevel] });
        logger.debug(`Nível de log configurado para: ${logLevel}`);
      } else {
        logger.warn(`Nível de log inválido: ${logLevel}. Usando padrão.`);
      }
    }

    // Não definimos valores padrão para os filtros
    // O script deve processar apenas as configurações existentes no arquivo YAML

    // Carregar configuração usando o módulo compartilhado
    let config;
    try {
      config = configHelper.loadConfig(configFile);
      if (!config) throw new Error('Configuração vazia ou inválida');
    } catch (configError) {
      logger.error(`Erro ao carregar configuração de '${configFile}': ${configError.message}`);
      process.exit(1);
    }

    // Inicializar caminhos globais
    let paths;
    try {
      paths = configHelper.initializePaths(config);
      if (!paths) throw new Error('Falha ao inicializar caminhos');

      // Adicionar os caminhos ao objeto config para uso nas funções
      config.paths = paths;
    } catch (pathError) {
      logger.error(`Erro ao inicializar caminhos: ${pathError.message}`);
      process.exit(1);
    }

    // Limpar diretórios se solicitado
    if (doClean) {
      try {
        filesystemHelper.cleanDirectories(paths.build, paths.dist, false, true);
        logger.info('Diretórios limpos com sucesso');
      } catch (cleanError) {
        logger.error(`Erro ao limpar diretórios: ${cleanError.message}`);
        process.exit(1);
      }
    }

    // Verificar se os diretórios de build existem e executar o build se necessário
    const selectedProject = filters.project || null;
    let buildSuccess;
    try {
      buildSuccess = filesystemHelper.ensureBuildBeforeDeploy(config, paths, selectedProject, false);
    } catch (buildError) {
      logger.error(`Erro ao verificar diretórios de build: ${buildError.message}`);
      process.exit(1);
    }

    // Se o build falhou, interromper o deploy
    if (!buildSuccess) {
      logger.error('Build falhou, interrompendo o deploy.');
      process.exit(1);
    }

    // Se não foi especificado um ambiente, processar ambos
    if (!environment) {
      logger.important('Nenhum ambiente especificado, processando ambos (dev e prod)');

      let devOutputDirs = [], prodOutputDirs = [];

      // Processar ambiente de desenvolvimento
      try {
        devOutputDirs = processAllProjects(config, 'dev', filters, doPush, paths);
        logger.debug(`Processados ${devOutputDirs.length} projetos para ambiente de desenvolvimento`);
      } catch (devError) {
        logger.error(`Erro ao processar projetos para ambiente de desenvolvimento: ${devError.message}`);
      }

      // Processar ambiente de produção
      try {
        prodOutputDirs = processAllProjects(config, 'prod', filters, doPush, paths);
        logger.debug(`Processados ${prodOutputDirs.length} projetos para ambiente de produção`);
      } catch (prodError) {
        logger.error(`Erro ao processar projetos para ambiente de produção: ${prodError.message}`);
      }

      if (devOutputDirs.length === 0 && prodOutputDirs.length === 0) {
        logger.error('Nenhum projeto foi processado com sucesso');
        process.exit(1);
      }
    } else {
      // Validar o ambiente
      if (environment !== 'dev' && environment !== 'prod') {
        logger.warn(`Ambiente "${environment}" não reconhecido. Usando "dev" como padrão.`);
        environment = 'dev';
      }

      // Se um projeto específico foi solicitado
      if (projectKey) {
        logger.highlight(`Processando projeto específico: ${projectKey} (${environment})`, { bold: true });
        logger.debug(`Filtros adicionais: ${JSON.stringify(filters)}`);

        // Verificar se o projeto existe na configuração
        if (!config.projects || !config.projects[projectKey]) {
          logger.error(`Projeto '${projectKey}' não encontrado na configuração`);
          process.exit(1);
        }

        // Processar templates para o projeto específico
        let result;
        try {
          result = templateHelper.processProjectTemplates(config, projectKey, environment, filters);
          logger.verbose(`Resultados do processamento: ${JSON.stringify(result)}`);
        } catch (templateError) {
          logger.error(`Erro ao processar templates para o projeto '${projectKey}': ${templateError.message}`);
          process.exit(1);
        }

        // Executar push se solicitado
        if (doPush && result && result.outputDir) {
          try {
            claspHelper.pushProject(result.outputDir);
          } catch (pushError) {
            logger.error(`Erro ao fazer push do projeto '${projectKey}': ${pushError.message}`);
            process.exit(1);
          }
        }
      } else {
        // Processar todos os projetos para o ambiente especificado
        let outputDirs = [];
        try {
          outputDirs = processAllProjects(config, environment, filters, doPush, paths);
          logger.debug(`Processados ${outputDirs.length} projetos para ambiente ${environment}`);

          if (outputDirs.length === 0) {
            logger.warn('Nenhum projeto foi processado. Verifique os filtros aplicados.');
          }
        } catch (processError) {
          logger.error(`Erro ao processar projetos para ambiente ${environment}: ${processError.message}`);
          process.exit(1);
        }
      }
    }

    logger.success('Deploy concluído com sucesso!', { bold: true });
  } catch (error) {
    logger.error(`Erro fatal durante o deploy: ${error.message}`);
    if (error.stack) {
      logger.debug(`Stack trace: ${error.stack}`);
    }
    process.exit(1);
  }
}

// Executar a função principal
main();
