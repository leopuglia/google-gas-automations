import fs from 'fs';
import fsExtra from 'fs-extra';
import Handlebars from 'handlebars';
import path from 'path';
import logger from './logger.js';

// Caminho para o arquivo de versão
const versionFilePath = path.resolve(process.cwd(), 'version.json');

/**
 * Carrega informações de versão do arquivo version.json
 * @returns {Object} Objeto com dados da versão ou objeto vazio se não encontrado
 */
export function loadVersionInfo() {
  try {
    if (fs.existsSync(versionFilePath)) {
      const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
      return versionData;
    }
  } catch (error) {
    logger.warn(`Não foi possível carregar informações de versão: ${error.message}`);
  }
  return { version: 'desconhecida', date: new Date().toISOString().split('T')[0] };
}

/**
 * Processa um template com Handlebars
 * @param {string} templatePath Caminho do template
 * @param {string} outputPath Caminho de saída
 * @param {Object} context Contexto para substituição
 */
export function processTemplate(templatePath, outputPath, context) {
  try {
    if (!fs.existsSync(templatePath)) {
      logger.error(`Template não encontrado: ${templatePath}`);
      return;
    }

    // Carregar informações de versão e adicionar ao contexto
    const versionInfo = loadVersionInfo();
    const contextWithVersion = {
      ...context,
      version: versionInfo.version,
      versionDate: versionInfo.date,
      versionInfo: versionInfo,
      buildDate: new Date().toISOString().split('T')[0],
      buildTimestamp: new Date().toISOString(),
    };

    const templateContent = fs.readFileSync(templatePath, 'utf8');

    // Registrar helper para verificar se é o último item de um array
    Handlebars.registerHelper('unless', function (conditional, options) {
      if (!conditional) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });

    // Registrar helper para verificar se é o último item de um array
    Handlebars.registerHelper('last', function (array, options) {
      if (array && array.length > 0) {
        return options.fn(array[array.length - 1]);
      } else {
        return options.inverse(this);
      }
    });

    const template = Handlebars.compile(templateContent);
    const result = template(contextWithVersion);

    // Garantir que o diretório de saída existe
    fsExtra.ensureDirSync(path.dirname(outputPath));

    fs.writeFileSync(outputPath, result);
    logger.verbose(`Template processado em ${outputPath}`);
  } catch (error) {
    logger.error(`Erro ao processar template ${templatePath}: ${error.message}`, error);
  }
}
/**
 * Processa os templates para um projeto específico
 * @param {Object} config Configuração completa
 * @param {string} projectKey Chave do projeto
 * @param {string} environment Ambiente (dev/prod)
 * @param {Object} keys Chaves adicionais para substituição
 */
export function processProjectTemplates(config, projectKey, environment, keys = {}) {
  try {
    const projectConfig = config.projects[projectKey];
    if (!projectConfig) {
      logger.error(`Projeto "${projectKey}" não encontrado na configuração.`);

      throw new Error(`Projeto "${projectKey}" não encontrado na configuração.`);
    }

    // Verificar se há configurações de ambiente
    let envConfig;

    // Primeiro, verificar na nova estrutura recomendada: projects.{project}.environments.{env}
    if (projectConfig.environments && projectConfig.environments[environment]) {
      envConfig = projectConfig.environments[environment];
    }

    // Segundo, verificar na estrutura environments.{env}.{project}
    else if (
      config.environments &&
      config.environments[environment] &&
      config.environments[environment][projectKey]
    ) {
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
        logger.warn(
          `Ambiente "${environment}" não encontrado para o projeto "${projectKey}". Pulando.`,
        );
        return null;
      }
      // Para o ambiente padrão, usar um objeto vazio
      logger.warn(
        `Ambiente "${environment}" não encontrado para o projeto "${projectKey}". Usando configurações padrão.`,
      );
      envConfig = {};
    }

    // Verificar a estrutura do projeto
    const projectStructure = config.defaults['projects-structure']?.[projectKey];
    if (!projectStructure) {
      logger.warn(
        `Estrutura do projeto "${projectKey}" não encontrada na configuração. Usando estrutura padrão.`,
      );
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

    // Identificar os arquivos para cada categoria
    const mainFile = 'main.js';
    const externalLibs = [];
    const commonLibs = [];
    const projectLibs = [];

    // Obter configurações do Rollup do projeto
    const rollupConfig = projectConfig.rollup || {};

    // Processar bibliotecas externas
    if (rollupConfig.externals && Array.isArray(rollupConfig.externals)) {
      rollupConfig.externals.forEach((external) => {
        if (typeof external === 'string') {
          externalLibs.push(`${external}.js`);
        } else if (external.name) {
          externalLibs.push(`${external.name}.js`);
        }
      });
    }

    // Processar bibliotecas comuns
    if (rollupConfig['common-libs'] && Array.isArray(rollupConfig['common-libs'])) {
      rollupConfig['common-libs'].forEach((lib) => {
        if (typeof lib === 'string') {
          commonLibs.push(`${lib}.js`);
        } else if (lib.name) {
          commonLibs.push(`${lib.name}.js`);
        }
      });
    }

    // Processar bibliotecas específicas do projeto
    if (rollupConfig['project-libs'] && Array.isArray(rollupConfig['project-libs'])) {
      rollupConfig['project-libs'].forEach((lib) => {
        if (typeof lib === 'string') {
          projectLibs.push(`${lib}.js`);
        } else if (lib.name) {
          projectLibs.push(`${lib.name}.js`);
        }
      });
    }

    // Criar a lista de arquivos na ordem correta para o push
    const filePushOrder = [
      ...externalLibs,
      ...commonLibs,
      ...projectLibs,
      mainFile,
      'appsscript.json',
    ];

    // Construir contexto para substituição
    const context = {
      ...config.defaults,
      ...projectConfig,
      ...nestedConfig,
      ...keys,
      env: environment,
      timeZone: config.defaults.keys?.find((k) => k.timeZone)?.timeZone || 'America/Sao_Paulo',
      runtimeVersion: config.defaults.keys?.find((k) => k.runtimeVersion)?.runtimeVersion || 'V8',
      scriptId:
        (nestedConfig.templates && nestedConfig.templates['.clasp-template.json']?.scriptId) || '',
      dependencies: projectConfig.dependencies || [],
      sheetsMacros: projectConfig.sheetsMacros || [],
      docsMacros: projectConfig.docsMacros || [],
      formsMacros: projectConfig.formsMacros || [],
      slidesMacros: projectConfig.slidesMacros || [],
      // Arquivos para o template .clasp-template.json na ordem correta
      file_push_order: filePushOrder,
      // Manter categorias separadas para possível uso futuro
      external_libs: externalLibs,
      common_libs: commonLibs,
      project_libs: projectLibs,
      main_file: mainFile,
    };

    // logger.verbose('Contexto para substituição: ' + JSON.stringify(context, null, 2));
    // logger.verbose('Contexto para substituição: ' + JSON.stringify(context));

    // Verificar se existem templates específicos no nestedConfig
    const templatesParaProcessar = new Map();

    // Adicionar templates padrão do config.defaults.templates (nova estrutura)
    if (config.defaults.templates) {
      for (const templateKey in config.defaults.templates) {
        const templateConfig = config.defaults.templates[templateKey];
        templatesParaProcessar.set(templateKey, {
          config: templateConfig,
          destinationFile: templateConfig['destination-file'],
        });
      }
    }

    // Adicionar ou sobrescrever com templates específicos do nestedConfig
    for (const templateKey in nestedConfig) {
      if (templateKey.endsWith('-template') || templateKey.endsWith('-template.json')) {
        const templateConfig = nestedConfig[templateKey];
        templatesParaProcessar.set(templateKey, {
          config: templateConfig,
          destinationFile: templateConfig['destination-file'],
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
      logger.debug(`Processando template ${templatePath} -> ${destinationFileName}`);

      // Criar caminho de saída com pasta separada para o ambiente
      const outputDir = path.join(config.defaults.paths.dist, environment, resolvedOutput);

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
        logger.warn(`Diretório de origem não encontrado: ${srcDir}`);
        logger.warn('Tentando alternativas...');

        // Tentar com o nome no src do projeto
        const srcAltDir = path.join(config.defaults.paths.build, projectConfig.src || projectKey);
        if (fs.existsSync(srcAltDir)) {
          srcDir = srcAltDir;
          logger.info(`Usando diretório alternativo: ${srcDir}`);
        } else {
          logger.error(
            `Não foi possível encontrar um diretório de origem válido para o projeto ${projectKey}`,
          );
          logger.error(`Diretórios verificados: ${srcDir}, ${srcAltDir}`);
          logger.error('Execute o comando "pnpm run build" antes de fazer o deploy');
        }
      }

      logger.debug(`Copiando arquivos de ${srcDir} para ${outputDir}`);
      fsExtra.copySync(srcDir, outputDir);
      logger.verbose(`Arquivos copiados de ${srcDir} para ${outputDir}`);
    }

    return {
      outputDir: path.join(config.defaults.paths.dist, environment, resolvedOutput),
    };
  } catch (error) {
    logger.error(
      `Erro ao processar templates para o projeto ${projectKey}: ${error.message}`,
      error,
    );
    return null;
  }
}
