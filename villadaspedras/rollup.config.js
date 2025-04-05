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
function getNestedConfigs(projectConfig, env, prefix = '', result = []) {
  const envConfig = projectConfig[env];
  
  if (!envConfig || typeof envConfig !== 'object') {
    return result;
  }
  
  // Se a configuração tem scriptId, é uma configuração final
  if (envConfig.scriptId) {
    result.push({
      path: prefix,
      config: envConfig,
      keys: {}
    });
    return result;
  }
  
  // Caso contrário, percorre as chaves aninhadas
  for (const [key, value] of Object.entries(envConfig)) {
    const newPrefix = prefix ? `${prefix}-${key}` : key;
    const level = prefix.split('-').length;
    const keyName = `key-${level + 1}`;
    
    if (typeof value === 'object' && value !== null) {
      if (value.scriptId) {
        // Configuração final encontrada
        const keys = {};
        keys[keyName] = key;
        
        // Adiciona as chaves anteriores
        if (prefix) {
          prefix.split('-').forEach((k, i) => {
            keys[`key-${i + 1}`] = k;
          });
        }
        
        result.push({
          path: newPrefix,
          config: value,
          keys
        });
      } else {
        // Continua a recursão
        getNestedConfigs({
          [env]: value
        }, env, newPrefix, result);
      }
    }
  }
  
  return result;
}

// Configuração base para todos os projetos
function createConfig(inputPath, outputDir, includes) {
  return {
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
    }
  };
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
  
  // Obtém as configurações aninhadas
  const nestedConfigs = getNestedConfigs(projectConfig, env);
  
  // Configurações básicas do projeto
  const srcDir = projectConfig.src || projectName;
  const baseOutputDir = projectConfig.output || projectName;
  
  // Processa cada configuração aninhada
  nestedConfigs.forEach(({ path, config, keys }) => {
    // Determina o diretório de saída
    let outputDir;
    
    console.log(`Processando configuração para ${projectName}:`);
    console.log(`- Path: ${path}`);
    console.log(`- Keys: ${JSON.stringify(keys)}`);
    
    // Se houver um template de saída, usa-o
    if (projectConfig.outputTemplate) {
      // Adiciona o ambiente como variável
      const variables = {
        ...keys,
        env,
        ambiente: env === 'dev' ? 'dev' : 'prod'
      };
      
      console.log(`- Template: ${projectConfig.outputTemplate}`);
      console.log(`- Variáveis: ${JSON.stringify(variables)}`);
      
      // Verifica se há problemas com as chaves
      // Corrige o problema quando key-2 existe mas key-1 não
      if (keys['key-2'] && !keys['key-1']) {
        // A chave está em key-2 em vez de key-1, vamos corrigir
        keys['key-1'] = keys['key-2'];
        variables['key-1'] = keys['key-2'];
        console.log(`- Corrigindo chaves: key-1 = ${keys['key-1']}`);
      }
      
      // Se ainda não tiver key-1, usa o ano atual como padrão
      if (!keys['key-1']) {
        const currentYear = new Date().getFullYear().toString();
        keys['key-1'] = currentYear;
        variables['key-1'] = currentYear;
        console.log(`- Usando ano atual como padrão: ${keys['key-1']}`);
      }
      
      // Substitui variáveis no formato {{variavel}}
      outputDir = projectConfig.outputTemplate.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
        console.log(`  - Substituindo ${match} por ${variables[variableName] || match}`);
        if (variables[variableName] !== undefined) {
          return variables[variableName];
        }
        return match; // Mantém o placeholder se a variável não for encontrada
      });
    } else {
      // Caso contrário, usa o caminho padrão
      outputDir = path ? `${path}-${baseOutputDir}` : baseOutputDir;
    }
    
    console.log(`- Diretório de saída final: ${outputDir}`);
    
    console.log(`Configurando build para ${projectName} com caminho: ${path}`);
    
    projectConfigs.push(
      createConfig(
        `${paths.src}/${srcDir}/Main.ts`,
        `${paths.dist}/${env}/${outputDir}`,
        [`${paths.src}/${srcDir}/**/*.ts`, `${paths.src}/commons/**/*.ts`]
      )
    );
  });
}

// Se não houver configurações para projetos, verificar se há projetos padrão definidos
if (projectConfigs.length === 0 && config.defaultProjects) {
  const currentYear = new Date().getFullYear().toString();
  console.log(`Nenhuma configuração encontrada para projetos, usando projetos padrão com ano atual: ${currentYear}`);
  
  // Processa cada projeto padrão definido na configuração
  for (const [projectName, projectConfig] of Object.entries(config.defaultProjects)) {
    const srcDir = projectConfig.src || projectName;
    const outputDir = projectConfig.output || projectName;
    const outputTemplate = projectConfig.outputTemplate || `${currentYear}-${outputDir}`;
    
    // Substitui variáveis no template
    const finalOutputDir = outputTemplate.replace(/\{\{year\}\}/g, currentYear);
    
    console.log(`Adicionando projeto padrão: ${projectName} com saída: ${finalOutputDir}`);
    
    // Se o projeto tiver configurações aninhadas (como PDVs)
    if (projectConfig.nested) {
      for (const [nestedKey, nestedValue] of Object.entries(projectConfig.nested)) {
        const nestedOutputTemplate = nestedValue.outputTemplate || `${currentYear}-${nestedKey}-${outputDir}`;
        const nestedFinalOutputDir = nestedOutputTemplate
          .replace(/\{\{year\}\}/g, currentYear)
          .replace(/\{\{key\}\}/g, nestedKey);
        
        console.log(`- Adicionando configuração aninhada: ${nestedKey} com saída: ${nestedFinalOutputDir}`);
        
        projectConfigs.push(
          createConfig(
            `${paths.src}/${srcDir}/Main.ts`,
            `${paths.dist}/${env}/${nestedFinalOutputDir}`,
            [`${paths.src}/${srcDir}/**/*.ts`, `${paths.src}/commons/**/*.ts`]
          )
        );
      }
    } else {
      // Projeto simples sem configurações aninhadas
      projectConfigs.push(
        createConfig(
          `${paths.src}/${srcDir}/Main.ts`,
          `${paths.dist}/${env}/${finalOutputDir}`,
          [`${paths.src}/${srcDir}/**/*.ts`, `${paths.src}/commons/**/*.ts`]
        )
      );
    }
  }
}

// Exporta todas as configurações
module.exports = projectConfigs;
