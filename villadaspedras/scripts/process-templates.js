/**
 * Script para processar templates e substituir variáveis
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Carrega a configuração do arquivo YAML
 * @param {string} configFile - Caminho para o arquivo de configuração
 * @returns {Object} - Objeto com a configuração
 */
function loadConfig(configFile) {
  try {
    const configPath = path.resolve(process.cwd(), configFile);
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents);
    
    // Definir valores padrão para caminhos se não estiverem definidos
    config.paths = config.paths || {};
    config.paths.src = config.paths.src || 'src';
    config.paths.dist = config.paths.dist || 'dist';
    config.paths.templates = config.paths.templates || 'templates';
    config.paths.scripts = config.paths.scripts || 'scripts';
    
    return config;
  } catch (error) {
    console.error(`❌ Erro ao carregar arquivo de configuração: ${error.message}`);
    return { 
      projects: {},
      paths: {
        src: 'src',
        dist: 'dist',
        templates: 'templates',
        scripts: 'scripts'
      }
    };
  }
}

/**
 * Processa um template substituindo as variáveis
 * @param {string} templateContent - Conteúdo do template
 * @param {Object} variables - Variáveis para substituição
 * @returns {string} Template processado
 */
function processTemplate(templateContent, variables) {
  let result = templateContent;
  
  // Substitui variáveis no formato {{variavel}}
  result = result.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    if (variables[variableName] !== undefined) {
      return variables[variableName];
    }
    return match; // Mantém o placeholder se a variável não for encontrada
  });
  
  // Substitui dependências
  if (variables.dependencies) {
    // Verifica se dependencies é um array
    if (Array.isArray(variables.dependencies)) {
      // Formata as dependências como JSON
      const dependenciesJson = JSON.stringify(variables.dependencies);
      result = result.replace(/"\{\{dependencies\}\}"/g, dependenciesJson);
    } else {
      // Se não for um array, trata como um objeto único
      const dependencyJson = JSON.stringify([variables.dependencies]);
      result = result.replace(/"\{\{dependencies\}\}"/g, dependencyJson);
    }
  }
  
  // Substitui macros
  if (variables.sheetsMacros) {
    const macrosJson = JSON.stringify(variables.sheetsMacros);
    result = result.replace(/"\{\{sheetsMacros\}\}"/g, macrosJson);
  }
  if (variables.docsMacros) {
    const macrosJson = JSON.stringify(variables.docsMacros);
    result = result.replace(/"\{\{docsMacros\}\}"/g, macrosJson);
  }
  if (variables.formsMacros) {
    const macrosJson = JSON.stringify(variables.formsMacros);
    result = result.replace(/"\{\{formsMacros\}\}"/g, macrosJson);
  }
  if (variables.slidesMacros) {
    const macrosJson = JSON.stringify(variables.slidesMacros);
    result = result.replace(/"\{\{slidesMacros\}\}"/g, macrosJson);
  }
  
  return result;
}

/**
 * Processa um template em uma string usando chaves dinâmicas
 * @param {string} templateString - String contendo o template
 * @param {Object} keys - Objeto com as chaves dinâmicas
 * @param {Object} additionalVars - Variáveis adicionais para substituição
 * @returns {string} String processada
 */
function processStringTemplate(templateString, keys, additionalVars = {}) {
  if (!templateString) return '';
  
  // Combina as chaves dinâmicas com as variáveis adicionais
  const variables = { ...keys, ...additionalVars };
  
  return processTemplate(templateString, variables);
}

/**
 * Processa templates em um objeto, aplicando substituição em todos os valores string
 * @param {Object} obj - Objeto a ser processado
 * @param {Object} keys - Objeto com as chaves dinâmicas
 * @param {Object} additionalVars - Variáveis adicionais para substituição
 * @returns {Object} Objeto com valores processados
 */
function processObjectTemplates(obj, keys, additionalVars = {}) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Processa strings como templates
      result[key] = processStringTemplate(value, keys, additionalVars);
    } else if (typeof value === 'object' && value !== null) {
      // Recursivamente processa objetos aninhados
      result[key] = processObjectTemplates(value, keys, additionalVars);
    } else {
      // Mantém outros tipos de valores inalterados
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Processa os templates para um projeto específico
 * @param {string} env - Ambiente (dev ou prod)
 * @param {string} projectDir - Diretório do projeto
 * @param {Object} projectConfig - Configuração do projeto
 * @param {Object} defaults - Configurações padrão
 * @param {Object} paths - Configurações de caminhos
 * @param {Object} dynamicKeys - Chaves dinâmicas para substituição em templates
 */
function processProjectTemplates(env, projectDir, projectConfig, defaults, paths, dynamicKeys = {}) {
  console.log(`📝 Processando templates para projeto: ${projectDir} no ambiente: ${env}`);
  
  // Cria o diretório de destino se não existir
  const outputDir = path.resolve(process.cwd(), paths.dist, env, projectDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`💾 Diretório criado: ${outputDir}`);
  }
  
  // Processa o template appsscript.json
  const templatePath = path.resolve(process.cwd(), paths.templates, 'appsscript-template.json');
  if (fs.existsSync(templatePath)) {
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Variáveis adicionais para substituição
    const additionalVars = {
      ...defaults,
      projectName: projectDir,
      env: env,
      ambiente: env === 'dev' ? 'dev' : 'prod'
    };
    
    // Adiciona as dependências do projeto
    if (projectConfig.dependencies) {
      additionalVars.dependencies = projectConfig.dependencies;
    }
    
    // Adiciona os macros do projeto
    if (projectConfig.sheetsMacros) {
      additionalVars.sheetsMacros = projectConfig.sheetsMacros;
    } else if (projectConfig.docsMacros) {
      additionalVars.docsMacros = projectConfig.docsMacros;
    } else if (projectConfig.formsMacros) {
      additionalVars.formsMacros = projectConfig.formsMacros;
    } else if (projectConfig.slidesMacros) {
      additionalVars.slidesMacros = projectConfig.slidesMacros;
    }
    
    // Processa o template com as chaves dinâmicas
    const processedContent = processStringTemplate(templateContent, dynamicKeys, additionalVars);
    
    // Salva o arquivo processado
    const outputPath = path.resolve(outputDir, 'appsscript.json');
    fs.writeFileSync(outputPath, processedContent);
    console.log(`✅ Template processado: ${outputPath}`);
  } else {
    console.warn(`⚠️ Template não encontrado: ${templatePath}`);
  }
  
  // Processa o template do .clasp.json
  processClaspTemplate(env, projectDir, projectConfig, paths, dynamicKeys);
}

/**
 * Processa o template do .clasp.json para um projeto
 * @param {string} env - Ambiente (dev ou prod)
 * @param {string} projectDir - Diretório do projeto
 * @param {Object} projectConfig - Configuração do projeto
 * @param {Object} paths - Configurações de caminhos
 * @param {Object} dynamicKeys - Chaves dinâmicas para substituição em templates
 */
function processClaspTemplate(env, projectDir, projectConfig, paths, dynamicKeys = {}) {
  const outputDir = path.resolve(process.cwd(), paths.dist, env, projectDir);
  const outputPath = path.resolve(outputDir, '.clasp.json');
  
  // Extrai o scriptId do projeto
  let scriptId = '';
  let projectName = '';
  let configObj = null;
  
  try {
    // Navega na configuração usando as chaves dinâmicas
    configObj = projectConfig[env];
    
    // Percorre as chaves dinâmicas para encontrar a configuração correta
    if (configObj) {
      // Para projetos simples sem chaves aninhadas
      if (configObj.scriptId) {
        scriptId = configObj.scriptId;
        projectName = configObj.name || projectDir;
        console.log(`Projeto ${projectDir}, scriptId: ${scriptId}`);
      } else {
        // Para projetos com chaves aninhadas
        let currentConfig = configObj;
        let keysPath = [];
        
        // Percorre as chaves dinâmicas na ordem em que aparecem no objeto dynamicKeys
        for (const [key, value] of Object.entries(dynamicKeys)) {
          if (currentConfig[value]) {
            currentConfig = currentConfig[value];
            keysPath.push(value);
          } else {
            console.warn(`Chave ${value} não encontrada na configuração para ${projectDir}`);
            break;
          }
        }
        
        // Se encontrou uma configuração válida
        if (currentConfig && currentConfig.scriptId) {
          scriptId = currentConfig.scriptId;
          
          // Coleta propriedades específicas do projeto atual
          const projectSpecificProps = {};
          
          // Adiciona propriedades específicas do nível atual
          for (const [propKey, propValue] of Object.entries(currentConfig)) {
            if (typeof propValue !== 'object' || propValue === null) {
              projectSpecificProps[propKey] = propValue;
            }
          }
          
          // Adiciona mapeamentos do projeto, se existirem
          if (projectConfig.pdv_mapping && dynamicKeys['key-2']) {
            const pdvKey = dynamicKeys['key-2'];
            if (projectConfig.pdv_mapping[pdvKey]) {
              projectSpecificProps.pdv_nome = projectConfig.pdv_mapping[pdvKey];
            }
          }
          
          // Variáveis para substituição
          const templateVars = {
            ...dynamicKeys,
            ...projectSpecificProps,
            env: env,
            ambiente: env === 'dev' ? 'dev' : 'prod'
          };
          
          // Usa o template de nome se existir, ou o nome direto
          if (projectConfig.nameTemplate) {
            projectName = processStringTemplate(projectConfig.nameTemplate, templateVars);
          } else {
            projectName = currentConfig.name || projectDir;
          }
          
          console.log(`Encontrado scriptId para ${keysPath.join('/')} no ambiente ${env}: ${scriptId}`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao extrair scriptId para ${projectDir}: ${error.message}`);
    console.error(error.stack);
  }
  
  if (!scriptId) {
    console.warn(`⚠️ ScriptId não encontrado para o projeto: ${projectDir} no ambiente: ${env}`);
  }
  
  // Cria o conteúdo do .clasp.json
  const claspConfig = {
    scriptId,
    rootDir: '.', // Relativo ao diretório dist/env/projectDir
    fileExtension: 'js',
    filePushOrder: ['Main.js']
  };
  
  // Salva o arquivo
  fs.writeFileSync(outputPath, JSON.stringify(claspConfig, null, 2));
  console.log(`✅ Arquivo .clasp.json criado para ${projectName || projectDir}: ${outputPath}`);
}

/**
 * Processa os templates para todos os projetos na configuração
 * @param {string} configFile - Caminho para o arquivo de configuração
 * @param {string} env - Ambiente (dev ou prod)
 */
function processAllTemplates(configFile, env = 'dev') {
  console.log(`🔍 Carregando configuração: ${configFile} para ambiente: ${env}`);
  const config = loadConfig(configFile);
  
  // Verifica se a configuração foi carregada corretamente
  if (!config || !config.projects) {
    console.error('❌ Configuração inválida ou não contém projetos');
    return;
  }
  
  // Configurações padrão
  const defaults = config.defaults || {};
  
  // Configurações de caminhos
  const paths = config.paths || {
    src: 'src',
    dist: 'dist',
    templates: 'templates',
    scripts: 'scripts'
  };
  
  // Itera sobre os projetos
  for (const [projectName, projectConfig] of Object.entries(config.projects)) {
    // Verifica se o projeto tem configuração para o ambiente especificado
    if (!projectConfig[env]) {
      console.warn(`⚠️ Projeto ${projectName} não tem configuração para o ambiente ${env}`);
      continue;
    }
    
    // Processa o projeto de forma genérica, independente do tipo
    processProjectWithDynamicKeys(projectName, projectConfig, env, defaults, paths);
  }
  
  console.log('✅ Todos os templates foram processados com sucesso!');
}

/**
 * Processa um projeto com chaves dinâmicas
 * @param {string} projectName - Nome do projeto
 * @param {Object} projectConfig - Configuração do projeto
 * @param {string} env - Ambiente (dev ou prod)
 * @param {Object} defaults - Configurações padrão
 * @param {Object} paths - Configurações de caminhos
 */
function processProjectWithDynamicKeys(projectName, projectConfig, env, defaults, paths) {
  // Obtém a configuração do ambiente
  const envConfig = projectConfig[env];
  
  // Se não houver chaves aninhadas, processa o projeto diretamente
  if (typeof envConfig !== 'object' || Object.keys(envConfig).length === 0 || envConfig.scriptId) {
    const outputDir = projectConfig.output || projectName;
    processProjectTemplates(env, outputDir, projectConfig, defaults, paths, {});
    return;
  }
  
  // Processa projetos com chaves aninhadas recursivamente
  processNestedKeys(projectName, projectConfig, env, defaults, paths, envConfig, {});
}

/**
 * Processa chaves aninhadas recursivamente
 * @param {string} projectName - Nome do projeto
 * @param {Object} projectConfig - Configuração do projeto
 * @param {string} env - Ambiente (dev ou prod)
 * @param {Object} defaults - Configurações padrão
 * @param {Object} paths - Configurações de caminhos
 * @param {Object} currentLevel - Nível atual da configuração
 * @param {Object} currentKeys - Chaves acumuladas até o momento
 * @param {Array} keyNames - Nomes das chaves na ordem de aninhamento
 */
function processNestedKeys(projectName, projectConfig, env, defaults, paths, currentLevel, currentKeys, keyNames = []) {
  // Se chegamos a um objeto com scriptId, é hora de processar o template
  if (currentLevel.scriptId) {
    // Determina o nome do diretório de saída
    let outputDir;
    
    // Coleta propriedades específicas do projeto atual
    const projectSpecificProps = {};
    
    // Adiciona propriedades específicas do nível atual
    for (const [propKey, propValue] of Object.entries(currentLevel)) {
      if (typeof propValue !== 'object' || propValue === null) {
        projectSpecificProps[propKey] = propValue;
      }
    }
    
    // Adiciona mapeamentos do projeto, se existirem
    if (projectConfig.pdv_mapping && currentKeys['key-2']) {
      const pdvKey = currentKeys['key-2'];
      if (projectConfig.pdv_mapping[pdvKey]) {
        projectSpecificProps.pdv_nome = projectConfig.pdv_mapping[pdvKey];
      }
    }
    
    // Variáveis para substituição
    const templateVars = {
      ...currentKeys,
      ...projectSpecificProps,
      env: env,
      ambiente: env === 'dev' ? 'dev' : 'prod'
    };
    
    console.log(`Variáveis para template: ${JSON.stringify(templateVars, null, 2)}`);
    
    // Se houver um template de saída, usa-o
    if (projectConfig.outputTemplate) {
      outputDir = processStringTemplate(projectConfig.outputTemplate, templateVars);
    } else {
      // Caso contrário, constrói o nome do diretório com as chaves
      const keyParts = Object.values(currentKeys);
      outputDir = keyParts.length > 0 ? 
        `${keyParts.join('-')}-${projectConfig.output || projectName}` : 
        (projectConfig.output || projectName);
    }
    
    // Propriedades específicas já foram coletadas acima e estão em templateVars
    
    // Usa as variáveis de template já combinadas
    
    // Processa os templates com as variáveis de template
    processProjectTemplates(env, outputDir, projectConfig, defaults, paths, templateVars);
    return;
  }
  
  // Caso contrário, continua percorrendo as chaves aninhadas
  for (const [key, value] of Object.entries(currentLevel)) {
    const newKeyNames = [...keyNames, key];
    const newKeys = { ...currentKeys };
    
    // Adiciona a chave atual ao objeto de chaves
    // Se não houver um nome de chave definido, usa o índice
    const keyIndex = keyNames.length;
    const keyName = `key-${keyIndex + 1}`;
    newKeys[keyName] = key;
    
    // Continua a recursão
    processNestedKeys(projectName, projectConfig, env, defaults, paths, value, newKeys, newKeyNames);
  }
}

// Executa o script se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  const configFile = args[0] || 'config.yml';
  const env = args[1] || 'dev';
  
  processAllTemplates(configFile, env);
}

module.exports = {
  loadConfig,
  processTemplate,
  processProjectTemplates,
  processAllTemplates
};
