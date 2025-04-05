const typescript = require('@rollup/plugin-typescript');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

// Obter o ambiente a partir dos argumentos da linha de comando
function getEnvironment() {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--env' && i + 1 < args.length) {
      return args[i + 1];
    }
  }
  return 'dev'; // Valor padrão
}

// Carregar a configuração do arquivo YAML
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

const env = getEnvironment();
console.log(`Ambiente de build: ${env}`);

// Carregar a configuração
const config = loadConfig('config.yml');

// Obter os caminhos configurados
const paths = config.paths || {
  src: 'src',
  dist: 'dist',
  templates: 'templates',
  scripts: 'scripts'
};

console.log(`Caminhos configurados: ${JSON.stringify(paths, null, 2)}`);


// Função para processar templates em strings
function processTemplate(template, variables) {
  if (!template) return '';
  
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

// Função para obter configurações aninhadas de forma recursiva
/**
 * Obtém configurações aninhadas recursivamente
 * @param {Object} projectConfig - Configuração do projeto
 * @param {string} env - Ambiente (dev/prod)
 * @param {string} prefix - Prefixo para o nome da configuração
 * @param {Array} result - Array de resultados
 * @param {number} depth - Profundidade da recursão para evitar loops infinitos
 * @returns {Array} Array de configurações
 */
function getNestedConfigs(projectConfig, env, prefix = '', result = [], depth = 0) {
  if (depth > 10) {
    console.warn(`Aviso: Profundidade máxima de recursão atingida para ${prefix}`);
    return result;
  }

  // Se não tiver configuração para o ambiente, retorna array vazio
  if (!projectConfig[env]) {
    return result;
  }

  // Para cada chave no ambiente
  for (const key in projectConfig[env]) {
    const value = projectConfig[env][key];
    const newPrefix = prefix ? `${prefix}-${key}` : key;

    // Se for um objeto com scriptId, adiciona ao resultado
    if (value && typeof value === 'object' && value.scriptId) {
      // Obter as chaves dinâmicas da estrutura
      const keys = {};
      
      // Extrair o tipo de projeto e as chaves específicas
      const projectType = prefix.split('-')[0]; // Ex: salario, consumo
      
      // Adicionar as chaves da estrutura definida
      if (config.structure && config.structure[projectType] && config.structure[projectType].nested) {
        const nestedKeys = config.structure[projectType].nested;
        
        // Extrair valores das chaves do prefixo
        const prefixParts = prefix.split('-');
        
        // Mapear cada chave definida na estrutura com seu valor correspondente
        nestedKeys.forEach((keyObj, index) => {
          if (keyObj.key && prefixParts[index + 1]) {
            keys[keyObj.key] = prefixParts[index + 1];
          }
        });
      }
      
      result.push({
        path: newPrefix,
        config: value,
        keys
      });
    } else if (value && typeof value === 'object') {
      // Continua a recursão com incremento de profundidade
      getNestedConfigs({
        [env]: value
      }, env, newPrefix, result, depth + 1);
    }
  }
  
  return result;
}

// Configuração base para todos os projetos
function createConfig(inputPath, outputDir, includes, scriptId = null) {
  // Verificar se o arquivo de entrada existe
  if (!fs.existsSync(inputPath)) {
    console.warn(`Aviso: Arquivo de entrada não encontrado: ${inputPath}`);
    console.warn(`Tentando usar o arquivo index.ts como alternativa`);
    // Tentar usar o arquivo index.ts como alternativa
    const alternativeInput = path.resolve(process.cwd(), 'src/index.ts');
    if (fs.existsSync(alternativeInput)) {
      inputPath = alternativeInput;
    }
  }
  
  const config = {
    input: inputPath,
    output: {
      dir: outputDir,
      format: 'cjs',
      exports: 'named'
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        include: includes,
        exclude: [`${paths.scripts}/**/*`, 'node_modules/**/*'],
        outDir: outputDir,
        target: 'es2019',
        module: 'esnext',
        noEmitOnError: false,
        skipLibCheck: true,
        sourceMap: false
      })
    ],
    onwarn(warning, warn) {
      if (warning.code === 'THIS_IS_UNDEFINED' ||
          warning.code === 'CIRCULAR_DEPENDENCY' ||
          warning.code === 'EMPTY_BUNDLE') {
        return;
      }
      warn(warning);
    },
    // Metadados adicionais que podem ser usados por scripts de deploy
    meta: {
      scriptId: scriptId
    }
  };
  
  return config;
}

// Configurações para todos os projetos usando chaves dinâmicas
const projectConfigs = [];

// Itera sobre todos os projetos na configuração
for (const [projectName, projectConfig] of Object.entries(config.projects)) {
  
  // Verifica se o projeto tem configuração para o ambiente atual
  if (!projectConfig[env]) {
    console.warn(`Projeto ${projectName} não tem configuração para o ambiente ${env}`);
    continue;
  }
  
  // Referência à configuração principal do projeto (comum a todos os ambientes)
  const mainProjectConfig = projectConfig;
  
  // Obtém o caminho para as fontes do projeto
  const srcDir = mainProjectConfig.src || projectName;
  
  // Diretório de saída base (padrão: nome do projeto)
  let baseOutputDir = mainProjectConfig.output || projectName;
  
  // Template de saída (se definido)
  const outputTemplate = mainProjectConfig.outputTemplate || null;
  
  // Obtém a estrutura do projeto para mapeamento de chaves
  const projectStructure = config.structure && config.structure[projectName] ? 
                          config.structure[projectName] : { nested: [] };
  
  // Processa os caminhos específicos para o ambiente atual
  // Exemplo: dev: { 2024: { ... }, 2023: { ... } }
  const envPaths = projectConfig[env] || {};
  
  // Para projetos com múltiplas chaves aninhadas (como consumo com year e pdv)
  if (projectName === 'consumo' && mainProjectConfig.pdv_mapping) {
    // Itera sobre cada ano configurado
    for (const [year, yearConfig] of Object.entries(envPaths)) {
      // Itera sobre cada PDV configurado para este ano
      for (const [pdv, pdvConfig] of Object.entries(yearConfig)) {
        console.log(`Processando configuração para ${projectName}:`);  
        console.log(`- Path: ${year}-${pdv}`);  
        
        // Diretório de saída (usa o template)
        let outputDir = baseOutputDir;
        
        // Se houver um template de saída, usa-o
        if (outputTemplate) {
          // Adiciona o ambiente e as variáveis específicas
          const variables = { 
            env,
            year,
            pdv
          };
          
          console.log(`- Template: ${outputTemplate}`);  
          console.log(`- Variáveis: ${JSON.stringify(variables)}`);  
          
          // Substitui variáveis no formato {{variavel}}
          outputDir = processTemplate(outputTemplate, variables);
          
          console.log(`- Diretório de saída final: ${outputDir}`);  
        } else {
          // Caso contrário, usa o caminho padrão
          outputDir = `${year}-${pdv}-${baseOutputDir}`;
        }
        
        console.log(`Configurando build para ${projectName} com caminho: ${year}-${pdv}`);
        
        // Cria a configuração de build para este projeto
        const scriptId = pdvConfig && pdvConfig.scriptId ? pdvConfig.scriptId : null;
        
        projectConfigs.push(
          createConfig(
            `${paths.src}/${srcDir}/Main.ts`,
            `${paths.dist}/${env}/${outputDir}`,
            [`${paths.src}/${srcDir}/**/*.ts`, `${paths.src}/commons/**/*.ts`, `${paths.src}/index.ts`],
            scriptId
          )
        );
      }
    }
  } else {
    // Processamento normal para outros projetos
    for (const [path, pathConfig] of Object.entries(envPaths)) {
    console.log(`Processando configuração para ${projectName}:`);
    console.log(`- Path: ${path}`);
    
    // Diretório de saída (usa o base ou override)
    let outputDir = baseOutputDir;
    
    // Verifica se o projeto tem chaves aninhadas definidas
    const hasNestedKeys = projectStructure && projectStructure.nested && projectStructure.nested.length > 0;
    
    // Se não houver chaves aninhadas e não houver template, usa apenas o nome base do projeto
    if (!hasNestedKeys && !outputTemplate) {
      // Usa o diretório de saída base sem adicionar o path como prefixo
      console.log(`[DEBUG] Projeto sem chaves aninhadas e sem template, usando nome base: ${baseOutputDir}`);
    }
    // Se houver um template de saída, usa-o
    else if (outputTemplate) {
      // Adiciona o ambiente como variável (usar apenas 'env' para padronizar)
      const variables = { env };
      
      // O caminho já contém os valores das chaves
      // Por exemplo: em salario, o path é algo como "2024"
      // Em consumo, o path é algo como "2024-cafeteria"
      
      // Extrai as partes do caminho para mapear com as chaves da estrutura
      const pathParts = path.split('-');
      
      // Obtém as chaves definidas na estrutura do projeto
      if (projectStructure && projectStructure.nested) {
        const nestedKeys = projectStructure.nested;
        console.log(`[DEBUG] Chaves aninhadas encontradas: ${JSON.stringify(nestedKeys)}`);
        
        // Mapear cada chave definida na estrutura com seu valor correspondente do path
        nestedKeys.forEach((keyObj, index) => {
          if (keyObj.key) {
            // Obtém o valor da parte correspondente no path
            // IMPORTANTE: em alguns projetos o path pode ser uma string simples sem hífens
            const keyValue = pathParts.length > index ? pathParts[index] : '';
            console.log(`[DEBUG] Mapeando chave ${keyObj.key} (posição ${index}) com valor '${keyValue}' do path '${path}'`);
            
            // Adiciona a chave ao objeto de variáveis para substituição no template
            variables[keyObj.key] = keyValue;
            console.log(`  - Definindo variável ${keyObj.key}=${keyValue}`);
          } else {
            console.log(`[AVISO] Objeto de chave sem propriedade 'key' na posição ${index}`);
          }
        });
      } else {
        console.log(`[DEBUG] Nenhuma chave aninhada encontrada para o projeto ${projectName}`);
      }
      
      console.log(`- Template: ${outputTemplate}`);
      console.log(`- Variáveis: ${JSON.stringify(variables)}`);
      
      // Substitui variáveis no formato {{variavel}}
      console.log(`[DEBUG] Iniciando substituição de variáveis no template: ${outputTemplate}`);
      console.log(`[DEBUG] Variáveis disponíveis: ${JSON.stringify(variables)}`);
      
      // Encontra todas as variáveis no template para verificar se temos todas
      const templateVars = [];
      let templateVarMatch;
      const templateVarRegex = /\{\{([^}]+)\}\}/g;
      while ((templateVarMatch = templateVarRegex.exec(outputTemplate)) !== null) {
        templateVars.push(templateVarMatch[1]);
      }
      console.log(`[DEBUG] Variáveis encontradas no template: ${JSON.stringify(templateVars)}`);
      
      // Verifica se temos todas as variáveis necessárias
      templateVars.forEach(varName => {
        if (variables[varName] === undefined || variables[varName] === '') {
          console.log(`[AVISO] Variável ${varName} necessária no template mas não definida`);
        }
      });
      
      // Faz a substituição
      outputDir = outputTemplate.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
        // Verifica se temos o valor para esta variável
        if (variables[variableName] !== undefined && variables[variableName] !== '') {
          console.log(`  - Substituindo ${match} por ${variables[variableName]}`);
          return variables[variableName];
        } else {
          // Para debugging, indicamos quais variáveis não foram encontradas
          console.log(`  - [AVISO] Variável ${variableName} não encontrada ou vazia`);
          // Aqui, como estamos fazendo um sistema genérico, podemos retornar o nome da variável
          // para facilitar a identificação de problemas
          return variableName; 
        }
      });
      
      console.log(`[DEBUG] Resultado final após substituição: ${outputDir}`);
    } else if (hasNestedKeys) {
      // Para projetos com chaves aninhadas, adiciona o path como prefixo
      outputDir = path ? `${path}-${baseOutputDir}` : baseOutputDir;
    } else {
      // Para projetos sem chaves aninhadas e sem template, usa apenas o nome base
      outputDir = baseOutputDir;
    }
    
    console.log(`- Diretório de saída final: ${outputDir}`);
    
    console.log(`Configurando build para ${projectName} com caminho: ${path}`);
    
    // Cria a configuração de build para este projeto
    // Usando o ID do script definido em pathConfig (se existir)
    const scriptId = pathConfig && pathConfig.scriptId ? pathConfig.scriptId : null;
    
    projectConfigs.push(
      createConfig(
        `${paths.src}/${srcDir}/Main.ts`,
        `${paths.dist}/${env}/${outputDir}`,
        [`${paths.src}/${srcDir}/**/*.ts`, `${paths.src}/commons/**/*.ts`, `${paths.src}/index.ts`],
        scriptId
      )
    );
    }
  }

// Se não houver configurações para projetos, verificar se há projetos padrão definidos
if (projectConfigs.length === 0 && config.structure) {
  console.log(`[DEBUG] Nenhuma configuração de projeto encontrada, usando estrutura padrão`);
  
  // Processa cada projeto na estrutura definida
  for (const [projectName, projectStructure] of Object.entries(config.structure)) {
    console.log(`[DEBUG] Processando projeto padrão: ${projectName}`);
    console.log(`[DEBUG] Estrutura: ${JSON.stringify(projectStructure)}`);
    
    // Verifica se o projeto existe na configuração principal
    const projectConfig = config.projects[projectName];
    
    if (!projectConfig) {
      console.warn(`Projeto ${projectName} não encontrado na configuração principal, ignorando...`);
      continue;
    }
    
    const srcDir = projectConfig.src || projectName;
    const outputDir = projectConfig.output || projectName;
    const outputTemplate = projectConfig.outputTemplate || outputDir;
    
    console.log(`[DEBUG] Diretório fonte: ${srcDir}`);
    console.log(`[DEBUG] Diretório saída: ${outputDir}`);
    console.log(`[DEBUG] Template de saída: ${outputTemplate}`);
    
    // Se o projeto não tiver configurações aninhadas
    if (!projectStructure.nested || projectStructure.nested.length === 0) {
      // Cria um objeto de variáveis padrão
      const variables = { env };
      
      // Processa o template de saída
      let finalOutputDir = outputTemplate;
      for (const [key, value] of Object.entries(variables)) {
        finalOutputDir = finalOutputDir.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      }
      
      console.log(`Adicionando projeto: ${projectName} com saída: ${finalOutputDir}`);
      
      projectConfigs.push(
        createConfig(
          `${paths.src}/${srcDir}/Main.ts`,
          `${paths.dist}/${env}/${finalOutputDir}`,
          [`${paths.src}/${srcDir}/**/*.ts`, `${paths.src}/commons/**/*.ts`, `${paths.src}/index.ts`]
        )
      );
    } else {
      // Projeto com configurações aninhadas
      let nestedKeys = {};
      
      // Inicializa arrays para armazenar as configurações de chaves definidas na estrutura
      const keyConfigs = [];
      
      // Obtém informações sobre as chaves disponíveis na estrutura
      if (projectStructure.nested) {
        projectStructure.nested.forEach((nestedConfig) => {
          if (nestedConfig.key) {
            // Armazena a configuração da chave para uso posterior
            keyConfigs.push(nestedConfig.key);
          }
        });
      }
      
      // Verifica se existem chaves múltiplas definidas na estrutura
      const hasMultipleKeys = keyConfigs.length > 1;
      const secondKeyName = keyConfigs[1]; // Nome da segunda chave (se existir)
      
      // Verifica se existe um mapeamento para a segunda chave na configuração
      const mappingKey = secondKeyName ? secondKeyName + '_mapping' : '';
      console.log(`[DEBUG] Verificando mapeamento para chave secundária: ${secondKeyName}`);
      console.log(`[DEBUG] Nome da chave de mapeamento: ${mappingKey}`);
      console.log(`[DEBUG] Mapeamento existe: ${Boolean(projectConfig[mappingKey])}`);
      
      if (hasMultipleKeys && secondKeyName && projectConfig[mappingKey]) {
        console.log(`[DEBUG] Processando projeto com múltiplas chaves e mapeamento`);
        console.log(`[DEBUG] Valores de mapeamento: ${JSON.stringify(projectConfig[mappingKey])}`);
        
        // Processa cada valor do mapeamento
        for (const [mapKey, mapValue] of Object.entries(projectConfig[mappingKey])) {
          console.log(`[DEBUG] Processando entrada de mapeamento: ${mapKey} -> ${mapValue}`);
          
          // Extrai o identificador sem o prefixo numérico (se houver)
          const keyValue = mapKey.split('-').length > 1 ? mapKey.split('-')[1] : mapKey;
          console.log(`[DEBUG] Valor extraído da chave: ${keyValue}`);
          
          // Prepara as variáveis para substituição
          const variables = { env };
          
          // Adiciona as chaves da estrutura
          keyConfigs.forEach((keyName, index) => {
            // Para a primeira chave, usamos a primeira parte do path
            if (index === 0) {
              const pathParts = path.split('-');
              variables[keyName] = pathParts[index + 1] || '';
            }
            // Para a segunda chave, usamos o valor do mapeamento
            else if (index === 1) {
              variables[keyName] = keyValue;
              // Adiciona também o nome descritivo da chave, se disponível
              variables[keyName + '_nome'] = mapValue;
            }
          });
          
          console.log(`- Processando configuração aninhada: ${mapKey}`);
          console.log(`- Template: ${outputTemplate}`);
          console.log(`- Variáveis: ${JSON.stringify(variables)}`);
          
          // Processa o template de saída
          let finalOutputDir = outputTemplate;
          
          // Substituição de todas as variáveis no template
          finalOutputDir = finalOutputDir.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
            // Verifica se temos o valor para esta variável
            if (variables[variableName] !== undefined && variables[variableName] !== '') {
              console.log(`  - Substituindo ${match} por ${variables[variableName]}`);
              return variables[variableName];
            } else {
              // Para debugging, indicamos quais variáveis não foram encontradas
              console.log(`  - [AVISO] Variável ${variableName} não encontrada ou vazia`);
              // Retorna apenas o nome da variável sem as chaves
              return variableName; 
            }
          });
          
          console.log(`- Diretório de saída final: ${finalOutputDir}`);
          
          projectConfigs.push(
            createConfig(
              `${paths.src}/${srcDir}/Main.ts`,
              `${paths.dist}/${env}/${finalOutputDir}`,
              [`${paths.src}/${srcDir}/**/*.ts`, `${paths.src}/commons/**/*.ts`, `${paths.src}/index.ts`]
            )
          );
        }
      } else {
        // Projeto com apenas a primeira chave dinâmica
        const variables = { env };
        
        // Adiciona as chaves da estrutura com seus valores
        const pathParts = path.split('-');
        keyConfigs.forEach((keyName, index) => {
          if (index === 0) { // Primeira chave
            // O índice no path deve ser index+1 porque a posição 0 é o nome do projeto
            // Ex: salario-2024 => index 0 -> pathParts[1] = 2024
            const keyIndex = index + 1;
            const keyValue = pathParts.length > keyIndex ? pathParts[keyIndex] : '';
            
            // Adiciona a chave ao objeto de variáveis com seu valor real
            variables[keyName] = keyValue;
            console.log(`  - Definindo variável ${keyName}=${keyValue}`);
          }
        });
        
        // Processa o template de saída
        let finalOutputDir = outputTemplate;
        finalOutputDir = finalOutputDir.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
          // Verifica se temos o valor para esta variável
          if (variables[variableName] !== undefined && variables[variableName] !== '') {
            console.log(`  - Substituindo ${match} por ${variables[variableName]}`);
            return variables[variableName];
          } else {
            // Para debugging, indicamos quais variáveis não foram encontradas
            console.log(`  - [AVISO] Variável ${variableName} não encontrada ou vazia`);
            // Retorna apenas o nome da variável sem as chaves
            return variableName; 
          }
        });
        
        console.log(`Adicionando projeto: ${projectName} com saída: ${finalOutputDir}`);
        
        projectConfigs.push(
          createConfig(
            `${paths.src}/${srcDir}/Main.ts`,
            `${paths.dist}/${env}/${finalOutputDir}`,
            [`${paths.src}/${srcDir}/**/*.ts`, `${paths.src}/commons/**/*.ts`, `${paths.src}/index.ts`]
          )
        );
      }
    }
  }
}

// Exporta todas as configurações
module.exports = projectConfigs;
}
