# Implementação Técnica: GAS Builder

Este documento detalha a implementação técnica do sistema GAS Builder, incluindo configurações, estrutura de código e exemplos de implementação.

## 1. Configuração do Projeto

### package.json

```json
{
  "name": "gas-builder",
  "version": "0.1.0",
  "description": "Sistema flexível de build e deploy para projetos Google Apps Script",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "gas-builder": "dist/cli/index.js"
  },
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "lint": "eslint \"src/**/*.ts\"",
    "lint:fix": "eslint \"src/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "prepare": "husky install",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "google-apps-script",
    "clasp",
    "build",
    "deploy",
    "typescript"
  ],
  "author": "Leonardo Puglia",
  "license": "MIT",
  "dependencies": {
    "@google/clasp": "^3.0.3-alpha",
    "chalk": "^5.4.1",
    "fs-extra": "^11.3.0",
    "handlebars": "^4.7.8",
    "js-yaml": "^4.1.0",
    "luxon": "^3.6.1",
    "rimraf": "^6.0.1",
    "rollup": "^4.40.1",
    "yargs": "^17.7.2"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^28.0.3",
    "@rollup/plugin-node-resolve": "^16.0.1",
    "@rollup/plugin-terser": "^0.4.4",
    "@rollup/plugin-typescript": "^12.1.2",
    "@types/fs-extra": "^11.0.4",
    "@types/jest": "^29.5.14",
    "@types/luxon": "^3.6.2",
    "@types/node": "^20.11.16",
    "@types/yargs": "^17.0.32",
    "@typescript-eslint/eslint-plugin": "^6.18.1",
    "@typescript-eslint/parser": "^6.18.1",
    "eslint": "^8.57.1",
    "husky": "^9.0.11",
    "jest": "^29.7.0",
    "prettier": "^3.2.4",
    "ts-jest": "^29.3.2",
    "tslib": "^2.8.1",
    "typescript": "^5.8.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "sourceMap": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### .eslintrc.js

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    es2020: true
  },
  rules: {
    'no-console': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};
```

### .prettierrc

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

## 2. Implementação do CLI

### src/cli/index.ts

```typescript
#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { deploy } from '../deploy/deploy.js';
import { build } from '../rollup/build.js';
import { logger } from '../logger/logger.js';

yargs(hideBin(process.argv))
  .command('build', 'Build the project', (yargs) => {
    return yargs
      .option('config', {
        alias: 'c',
        describe: 'Path to config file',
        default: 'config.yml',
        type: 'string',
      })
      .option('project', {
        alias: 'p',
        describe: 'Project to build',
        type: 'string',
      })
      .option('clean', {
        describe: 'Clean build directories before building',
        type: 'boolean',
        default: false,
      });
  }, (argv) => {
    logger.info('Building project...');
    build(argv.config as string, argv.project as string | undefined, argv.clean);
  })
  .command('deploy', 'Deploy the project', (yargs) => {
    return yargs
      .option('config', {
        alias: 'c',
        describe: 'Path to config file',
        default: 'config.yml',
        type: 'string',
      })
      .option('env', {
        alias: 'e',
        describe: 'Environment to deploy to',
        choices: ['dev', 'prod'],
        type: 'string',
      })
      .option('project', {
        alias: 'p',
        describe: 'Project to deploy',
        type: 'string',
      })
      .option('push', {
        describe: 'Push to Google Apps Script after deploy',
        type: 'boolean',
        default: false,
      })
      .option('clean', {
        describe: 'Clean build directories before deploying',
        type: 'boolean',
        default: false,
      })
      .option('log-level', {
        describe: 'Log level',
        choices: ['verbose', 'debug', 'info', 'warn', 'error', 'none'],
        default: 'info',
        type: 'string',
      });
  }, (argv) => {
    logger.configure({ level: logger.levels[argv['log-level'].toUpperCase()] });
    logger.info('Deploying project...');
    
    const filters: Record<string, string> = {};
    if (argv.project) {
      filters.project = argv.project as string;
    }
    
    // Process additional filters from command line
    Object.keys(argv).forEach(key => {
      if (!['_', 'config', 'env', 'project', 'push', 'clean', 'log-level', '$0'].includes(key)) {
        filters[key] = argv[key] as string;
      }
    });
    
    deploy(
      argv.config as string,
      argv.env as string | undefined,
      filters,
      argv.push as boolean,
      argv.clean as boolean
    );
  })
  .demandCommand(1, 'You need to specify a command')
  .help()
  .argv;
```

## 3. Sistema de Logging

### src/logger/logger.ts

```typescript
import chalk from 'chalk';

export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  VERBOSE = 5
}

interface LogOptions {
  bold?: boolean;
  underline?: boolean;
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  
  public levels = {
    'NONE': LogLevel.NONE,
    'ERROR': LogLevel.ERROR,
    'WARN': LogLevel.WARN,
    'INFO': LogLevel.INFO,
    'DEBUG': LogLevel.DEBUG,
    'VERBOSE': LogLevel.VERBOSE
  };
  
  configure(options: { level?: LogLevel }) {
    if (options.level !== undefined) {
      this.level = options.level;
    }
  }
  
  error(message: string, options: LogOptions = {}) {
    if (this.level >= LogLevel.ERROR) {
      let formattedMessage = chalk.red(message);
      
      if (options.bold) {
        formattedMessage = chalk.bold(formattedMessage);
      }
      
      if (options.underline) {
        formattedMessage = chalk.underline(formattedMessage);
      }
      
      console.error(`❌ ${formattedMessage}`);
    }
  }
  
  warn(message: string, options: LogOptions = {}) {
    if (this.level >= LogLevel.WARN) {
      let formattedMessage = chalk.yellow(message);
      
      if (options.bold) {
        formattedMessage = chalk.bold(formattedMessage);
      }
      
      if (options.underline) {
        formattedMessage = chalk.underline(formattedMessage);
      }
      
      console.warn(`⚠️ ${formattedMessage}`);
    }
  }
  
  info(message: string, options: LogOptions = {}) {
    if (this.level >= LogLevel.INFO) {
      let formattedMessage = message;
      
      if (options.bold) {
        formattedMessage = chalk.bold(formattedMessage);
      }
      
      if (options.underline) {
        formattedMessage = chalk.underline(formattedMessage);
      }
      
      console.info(`ℹ️ ${formattedMessage}`);
    }
  }
  
  success(message: string, options: LogOptions = {}) {
    if (this.level >= LogLevel.INFO) {
      let formattedMessage = chalk.green(message);
      
      if (options.bold) {
        formattedMessage = chalk.bold(formattedMessage);
      }
      
      if (options.underline) {
        formattedMessage = chalk.underline(formattedMessage);
      }
      
      console.info(`✅ ${formattedMessage}`);
    }
  }
  
  debug(message: string, options: LogOptions = {}) {
    if (this.level >= LogLevel.DEBUG) {
      let formattedMessage = chalk.blue(message);
      
      if (options.bold) {
        formattedMessage = chalk.bold(formattedMessage);
      }
      
      if (options.underline) {
        formattedMessage = chalk.underline(formattedMessage);
      }
      
      console.debug(`🔍 ${formattedMessage}`);
    }
  }
  
  verbose(message: string, options: LogOptions = {}) {
    if (this.level >= LogLevel.VERBOSE) {
      let formattedMessage = chalk.gray(message);
      
      if (options.bold) {
        formattedMessage = chalk.bold(formattedMessage);
      }
      
      if (options.underline) {
        formattedMessage = chalk.underline(formattedMessage);
      }
      
      console.debug(`🔬 ${formattedMessage}`);
    }
  }
  
  highlight(message: string, options: LogOptions = {}) {
    if (this.level >= LogLevel.INFO) {
      let formattedMessage = chalk.cyan(message);
      
      if (options.bold) {
        formattedMessage = chalk.bold(formattedMessage);
      }
      
      if (options.underline) {
        formattedMessage = chalk.underline(formattedMessage);
      }
      
      console.info(`🔆 ${formattedMessage}`);
    }
  }
  
  important(message: string, options: LogOptions = {}) {
    if (this.level >= LogLevel.INFO) {
      let formattedMessage = chalk.magenta(message);
      
      if (options.bold) {
        formattedMessage = chalk.bold(formattedMessage);
      }
      
      if (options.underline) {
        formattedMessage = chalk.underline(formattedMessage);
      }
      
      console.info(`⭐ ${formattedMessage}`);
    }
  }
}

export const logger = new Logger();
```

## 4. Sistema de Configuração

### src/config/config-loader.ts

```typescript
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { logger } from '../logger/logger.js';

export const DEFAULT_CONFIG_FILE = 'config.yml';

export interface Paths {
  src: string;
  build: string;
  dist: string;
  templates: string;
  scripts: string;
}

export interface Config {
  defaults?: {
    paths?: Partial<Paths>;
    templates?: Record<string, any>;
    rollup?: {
      output?: Record<string, any>;
      plugins?: Array<{
        name: string;
        config?: Record<string, any>;
      }>;
    };
    'projects-structure'?: Record<string, any>;
  };
  projects?: Record<string, any>;
  paths?: Paths; // Adicionado após inicialização
}

/**
 * Carrega a configuração do arquivo YAML
 * @param configFile Caminho para o arquivo de configuração
 * @returns Configuração carregada
 */
export function loadConfig(configFile: string = DEFAULT_CONFIG_FILE): Config {
  try {
    const configPath = path.resolve(process.cwd(), configFile);
    logger.debug(`Carregando configuração de: ${configPath}`);
    
    if (!fs.existsSync(configPath)) {
      logger.error(`Arquivo de configuração não encontrado: ${configPath}`);
      process.exit(1);
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configContent) as Config;
    
    logger.debug(`Configuração carregada com sucesso`);
    return config;
  } catch (error) {
    logger.error(`Erro ao carregar configuração: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

/**
 * Inicializa os caminhos globais com base na configuração
 * @param config Configuração carregada
 * @returns Caminhos inicializados
 */
export function initializePaths(config: Config): Paths {
  const defaultPaths: Paths = {
    src: './src',
    build: './build',
    dist: './dist',
    templates: './templates',
    scripts: './scripts'
  };
  
  // Obter caminhos da configuração ou usar padrões
  const configPaths = config.defaults?.paths || {};
  
  const paths: Paths = {
    src: configPaths.src || defaultPaths.src,
    build: configPaths.build || defaultPaths.build,
    dist: configPaths.dist || defaultPaths.dist,
    templates: configPaths.templates || defaultPaths.templates,
    scripts: configPaths.scripts || defaultPaths.scripts
  };
  
  logger.debug(`Caminhos inicializados:`);
  logger.debug(`  src: ${paths.src}`);
  logger.debug(`  build: ${paths.build}`);
  logger.debug(`  dist: ${paths.dist}`);
  logger.debug(`  templates: ${paths.templates}`);
  logger.debug(`  scripts: ${paths.scripts}`);
  
  return paths;
}

/**
 * Valida a configuração com base no schema JSON
 * @param config Configuração a ser validada
 * @param schemaPath Caminho para o schema JSON
 * @returns true se a configuração é válida, false caso contrário
 */
export function validateConfig(config: Config, schemaPath: string = 'config.schema.json'): boolean {
  try {
    // Implementação da validação de schema
    // Pode usar bibliotecas como ajv para validação
    
    // Exemplo simplificado:
    if (!config.projects) {
      logger.error('Configuração inválida: seção "projects" não encontrada');
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error(`Erro ao validar configuração: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}
```

## 5. Sistema de Templates

### src/templates/template-processor.ts

```typescript
import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import { logger } from '../logger/logger.js';
import { Config, Paths } from '../config/config-loader.js';

// Cache para templates compilados
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

/**
 * Processa um template com Handlebars
 * @param templateContent Conteúdo do template
 * @param context Contexto para substituição de variáveis
 * @returns Conteúdo processado
 */
export function processTemplate(templateContent: string, context: Record<string, any>): string {
  try {
    // Compilar template
    const template = Handlebars.compile(templateContent);
    
    // Processar template com contexto
    return template(context);
  } catch (error) {
    logger.error(`Erro ao processar template: ${error instanceof Error ? error.message : String(error)}`);
    return templateContent;
  }
}

/**
 * Processa templates para um projeto específico
 * @param config Configuração completa
 * @param projectKey Chave do projeto
 * @param environment Ambiente (dev/prod)
 * @param filters Filtros adicionais
 * @param paths Caminhos dos diretórios
 * @returns Resultado do processamento
 */
export function processProjectTemplates(
  config: Config,
  projectKey: string,
  environment: string,
  filters: Record<string, string> = {},
  paths?: Paths
): { outputDir: string } | null {
  logger.debug(`Processando templates para projeto ${projectKey} no ambiente ${environment}`);
  logger.debug(`Filtros: ${JSON.stringify(filters)}`);
  
  // Obter configuração do projeto
  const projectConfig = config.projects?.[projectKey];
  if (!projectConfig) {
    logger.error(`Projeto ${projectKey} não encontrado na configuração`);
    return null;
  }
  
  // Obter configuração de ambiente
  const envConfig = projectConfig.environments?.[environment];
  if (!envConfig) {
    logger.warn(`Ambiente ${environment} não encontrado para projeto ${projectKey}`);
    return null;
  }
  
  // Aplicar filtros para projetos aninhados
  let targetConfig = envConfig;
  const nestedStructure = projectConfig.nested || [];
  
  for (const nestedItem of nestedStructure) {
    const key = nestedItem.key;
    const value = filters[key];
    
    if (!value) {
      logger.warn(`Valor para chave ${key} não especificado nos filtros`);
      return null;
    }
    
    targetConfig = targetConfig[value];
    if (!targetConfig) {
      logger.warn(`Configuração não encontrada para ${key}=${value}`);
      return null;
    }
  }
  
  // Preparar contexto para templates
  const context = {
    ...filters,
    env: environment,
    output: projectConfig.output,
    project: projectKey
  };
  
  // Processar template de saída
  const outputTemplate = projectConfig.outputTemplate || '{{output}}';
  const outputName = processTemplate(outputTemplate, context);
  
  // Determinar diretório de saída
  const distDir = paths?.dist || './dist';
  const outputDir = path.join(distDir, environment, outputName);
  
  // Criar diretório de saída
  fs.ensureDirSync(outputDir);
  
  // Processar templates
  const templates = targetConfig.templates || {};
  
  for (const [templateKey, templateConfig] of Object.entries(templates)) {
    const templatePath = path.join(paths?.templates || './templates', templateKey);
    const destinationFile = templateConfig.destination-file || templateKey;
    const destinationPath = path.join(outputDir, destinationFile);
    
    // Verificar se o template existe
    if (!fs.existsSync(templatePath)) {
      logger.warn(`Template ${templatePath} não encontrado`);
      continue;
    }
    
    // Ler conteúdo do template
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Preparar contexto específico do template
    const templateContext = {
      ...context,
      ...templateConfig
    };
    
    // Processar template
    const processedContent = processTemplate(templateContent, templateContext);
    
    // Escrever arquivo processado
    fs.writeFileSync(destinationPath, processedContent);
    logger.debug(`Template ${templateKey} processado para ${destinationPath}`);
  }
  
  // Copiar arquivos de build
  const buildDir = path.join(paths?.build || './build', projectConfig.src);
  if (fs.existsSync(buildDir)) {
    fs.copySync(buildDir, outputDir);
    logger.debug(`Arquivos de build copiados de ${buildDir} para ${outputDir}`);
  } else {
    logger.warn(`Diretório de build ${buildDir} não encontrado`);
  }
  
  logger.success(`Templates processados para ${projectKey} (${outputDir})`);
  return { outputDir };
}
```

## 6. Integração com Rollup

### src/rollup/build.ts

```typescript
import { rollup, RollupOptions } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { logger } from '../logger/logger.js';
import { loadConfig, initializePaths } from '../config/config-loader.js';
import fs from 'fs-extra';
import path from 'path';

/**
 * Carrega um plugin do Rollup dinamicamente
 * @param name Nome do plugin
 * @param config Configuração do plugin
 * @returns Plugin instanciado
 */
function loadPlugin(name: string, config: Record<string, any> = {}) {
  switch (name) {
    case 'nodeResolve':
      return nodeResolve(config);
    case 'typescript':
      return typescript(config);
    case 'terser':
      return terser(config);
    default:
      logger.warn(`Plugin desconhecido: ${name}`);
      return null;
  }
}

/**
 * Constrói a configuração do Rollup para um projeto
 * @param config Configuração completa
 * @param projectKey Chave do projeto
 * @param paths Caminhos dos diretórios
 * @returns Configuração do Rollup
 */
function buildRollupConfig(config: any, projectKey: string, paths: any): RollupOptions | null {
  try {
    // Obter configuração do projeto
    const projectConfig = config.projects?.[projectKey];
    if (!projectConfig) {
      logger.error(`Projeto ${projectKey} não encontrado na configuração`);
      return null;
    }
    
    // Obter configuração do Rollup
    const defaultRollupConfig = config.defaults?.rollup || {};
    const projectRollupConfig = projectConfig.rollup || {};
    
    // Arquivo de entrada
    const input = path.join(paths.src, projectConfig.src, projectRollupConfig.main || 'main.ts');
    
    if (!fs.existsSync(input)) {
      logger.error(`Arquivo de entrada não encontrado: ${input}`);
      return null;
    }
    
    // Configuração de saída
    const output = {
      ...(defaultRollupConfig.output || {}),
      file: path.join(paths.build, projectConfig.src, 'index.js'),
      name: projectRollupConfig.name || projectKey
    };
    
    // Plugins
    const plugins = [];
    
    // Adicionar plugins padrão
    for (const pluginConfig of (defaultRollupConfig.plugins || [])) {
      const plugin = loadPlugin(pluginConfig.name, pluginConfig.config);
      if (plugin) {
        plugins.push(plugin);
      }
    }
    
    // Adicionar plugins específicos do projeto
    for (const pluginConfig of (projectRollupConfig.plugins || [])) {
      const plugin = loadPlugin(pluginConfig.name, pluginConfig.config);
      if (plugin) {
        plugins.push(plugin);
      }
    }
    
    return {
      input,
      output,
      plugins
    };
  } catch (error) {
    logger.error(`Erro ao construir configuração do Rollup: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * Executa o build de um projeto com Rollup
 * @param configFile Caminho para o arquivo de configuração
 * @param projectKey Projeto específico para build
 * @param clean Limpar diretórios antes do build
 */
export async function build(configFile: string, projectKey?: string, clean: boolean = false) {
  try {
    // Carregar configuração
    const config = loadConfig(configFile);
    
    // Inicializar caminhos
    const paths = initializePaths(config);
    
    // Limpar diretórios se solicitado
    if (clean) {
      logger.info('Limpando diretórios de build...');
      fs.emptyDirSync(paths.build);
    }
    
    // Se um projeto específico foi solicitado
    if (projectKey) {
      logger.info(`Executando build para projeto ${projectKey}...`);
      
      const rollupConfig = buildRollupConfig(config, projectKey, paths);
      if (!rollupConfig) {
        logger.error(`Não foi possível construir configuração do Rollup para ${projectKey}`);
        return;
      }
      
      const bundle = await rollup(rollupConfig);
      await bundle.write(rollupConfig.output);
      await bundle.close();
      
      logger.success(`Build concluído para projeto ${projectKey}`);
    } else {
      // Executar build para todos os projetos
      logger.info('Executando build para todos os projetos...');
      
      const projects = config.projects || {};
      
      for (const projectKey of Object.keys(projects)) {
        logger.info(`Executando build para projeto ${projectKey}...`);
        
        const rollupConfig = buildRollupConfig(config, projectKey, paths);
        if (!rollupConfig) {
          logger.error(`Não foi possível construir configuração do Rollup para ${projectKey}`);
          continue;
        }
        
        const bundle = await rollup(rollupConfig);
        await bundle.write(rollupConfig.output);
        await bundle.close();
        
        logger.success(`Build concluído para projeto ${projectKey}`);
      }
    }
    
    logger.success('Processo de build concluído!');
  } catch (error) {
    logger.error(`Erro durante o build: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
```

## 7. Exemplos de Uso

### Exemplo Básico

```bash
# Build de todos os projetos
gas-builder build

# Build de um projeto específico
gas-builder build --project=example

# Deploy para ambiente de desenvolvimento
gas-builder deploy --env=dev

# Deploy e push para ambiente de produção
gas-builder deploy --env=prod --push

# Deploy de um projeto específico com estrutura aninhada
gas-builder deploy --project=advanced --year=2024 --category=reports --env=prod --push
```

### Exemplo de Script npm

```json
"scripts": {
  "build": "gas-builder build",
  "build:clean": "gas-builder build --clean",
  "deploy:dev": "gas-builder deploy --env=dev",
  "deploy:prod": "gas-builder deploy --env=prod",
  "push:dev": "gas-builder deploy --env=dev --push",
  "push:prod": "gas-builder deploy --env=prod --push",
  "deploy:reports": "gas-builder deploy --project=advanced --year=2024 --category=reports --env=dev --push"
}
```

## 8. Próximos Passos

1. **Implementar validação de schema JSON**
   - Adicionar biblioteca ajv para validação
   - Implementar função completa de validação

2. **Expandir sistema de plugins do Rollup**
   - Adicionar suporte para mais plugins
   - Implementar carregamento dinâmico de plugins de terceiros

3. **Melhorar sistema de cache de templates**
   - Implementar cache persistente
   - Adicionar invalidação de cache inteligente

4. **Implementar testes automatizados**
   - Adicionar testes unitários para cada módulo
   - Implementar testes de integração

5. **Criar exemplos completos**
   - Adicionar exemplos para diferentes cenários
   - Documentar cada exemplo detalhadamente
