# Implementação da CLI do GAS Builder

> Última atualização: 06/05/2025

## Resumo

Este documento detalha a implementação da interface de linha de comando (CLI) do GAS Builder, sistema de logging e gerenciamento de configuração. É destinado a desenvolvedores que precisam entender ou estender a funcionalidade da CLI.

## Pré-requisitos

- Conhecimento de TypeScript e ES Modules
- Familiaridade com o pacote `yargs` para CLI
- Leitura prévia de [32-impl-core-sistema.md](./32-impl-core-sistema.md)

## 1. Implementação da CLI

### 1.1 Estrutura Base (src/cli/index.ts)

A CLI é implementada usando o pacote `yargs` para facilitar o parsing de argumentos e a criação de comandos:

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
      });
  }, (argv) => {
    logger.info('Deploying project...');
    deploy(
      argv.config as string,
      argv.env as string | undefined,
      argv.project as string | undefined
    );
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .strict()
  .help()
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .parse();
```

### 1.2 Comandos Principais

A CLI suporta os seguintes comandos principais:

#### 1.2.1 build

O comando `build` compila o projeto TypeScript usando Rollup:

```bash
gas-builder build [--config config.yml] [--project nome-projeto] [--clean]
```

Opções:

- `--config, -c`: Caminho para o arquivo de configuração (padrão: `config.yml`)
- `--project, -p`: Projeto específico a ser compilado (opcional)
- `--clean`: Limpa diretórios de build antes da compilação (padrão: `false`)

#### 1.2.2 deploy

O comando `deploy` envia o código compilado para o Google Apps Script:

```bash
gas-builder deploy [--config config.yml] [--env dev|prod] [--project nome-projeto]
```

Opções:

- `--config, -c`: Caminho para o arquivo de configuração (padrão: `config.yml`)
- `--env, -e`: Ambiente para deploy (`dev` ou `prod`)
- `--project, -p`: Projeto específico a ser enviado (opcional)

### 1.3 Comandos Adicionais

Além dos comandos principais, a CLI suporta:

#### 1.3.1 create (Planejado)

Cria um novo projeto GAS Builder:

```bash
gas-builder create [--name nome-projeto] [--template basic|advanced]
```

#### 1.3.2 watch (Planejado)

Monitora alterações e recompila automaticamente:

```bash
gas-builder watch [--config config.yml] [--project nome-projeto]
```

## 2. Sistema de Logging

### 2.1 Implementação (src/logger/logger.ts)

O sistema de logging fornece uma forma consistente de reportar mensagens em diferentes níveis:

```typescript
enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  
  public levels = {
    'NONE': LogLevel.NONE,
    'ERROR': LogLevel.ERROR,
    'WARN': LogLevel.WARN,
    'INFO': LogLevel.INFO,
    'DEBUG': LogLevel.DEBUG
  };
  
  public setLevel(level: LogLevel | string): void {
    if (typeof level === 'string') {
      const upperLevel = level.toUpperCase();
      if (upperLevel in this.levels) {
        this.level = this.levels[upperLevel as keyof typeof this.levels];
      } else {
        console.warn(`Nível de log inválido: ${level}`);
      }
    } else {
      this.level = level;
    }
  }
  
  public debug(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
  
  public info(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.INFO) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }
  
  public warn(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }
  
  public error(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
```

### 2.2 Uso do Logger

O logger é utilizado em todo o sistema para fornecer feedback consistente:

```typescript
import { logger } from '../logger/logger.js';

function exemplo() {
  logger.debug('Informação detalhada para debug');
  logger.info('Informação geral sobre o processo');
  logger.warn('Aviso sobre possível problema');
  logger.error('Erro encontrado durante a execução');
}
```

### 2.3 Configuração do Nível de Log

O nível de log pode ser configurado através do arquivo de configuração YAML:

```yaml
defaults:
  logging:
    level: DEBUG  # NONE, ERROR, WARN, INFO, DEBUG
```

## 3. Gerenciamento de Configuração

### 3.1 Carregamento de Configuração (src/config/config.ts)

O módulo de configuração carrega e valida o arquivo YAML:

```typescript
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import { logger } from '../logger/logger.js';

const DEFAULT_CONFIG_FILE = 'config.yml';

interface Config {
  defaults?: Record<string, any>;
  projects?: Record<string, any>;
}

export function loadConfig(configFile: string = DEFAULT_CONFIG_FILE): Config {
  try {
    const configPath = path.resolve(process.cwd(), configFile);
    logger.debug(`Carregando configuração de: ${configPath}`);
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Arquivo de configuração não encontrado: ${configPath}`);
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configContent) as Config;
    
    // Validar configuração
    validateConfig(config);
    
    // Configurar logger
    if (config.defaults?.logging?.level) {
      logger.setLevel(config.defaults.logging.level);
    }
    
    return config;
  } catch (error) {
    logger.error(`Erro ao carregar configuração: ${error.message}`);
    throw error;
  }
}

function validateConfig(config: Config): void {
  // Implementação da validação com Ajv
  // ...
}
```

### 3.2 Validação de Configuração

A validação da configuração utiliza um schema JSON para garantir que todos os campos obrigatórios estejam presentes e que os valores estejam no formato correto:

```typescript
function validateConfig(config: Config): void {
  const ajv = new Ajv();
  
  // Carregar schema
  const schemaPath = path.resolve(__dirname, '../../schema/config.schema.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  
  // Validar
  const validate = ajv.compile(schema);
  const valid = validate(config);
  
  if (!valid) {
    const errors = validate.errors;
    logger.error('Erros de validação na configuração:');
    
    for (const error of errors || []) {
      logger.error(`- ${error.instancePath}: ${error.message}`);
    }
    
    throw new Error('Configuração inválida. Verifique os erros acima.');
  }
}
```

### 3.3 Acesso a Configurações de Projeto

Utility functions para acessar configurações específicas de projeto:

```typescript
export function getProjectConfig(config: Config, projectKey: string): any {
  if (!config.projects || !config.projects[projectKey]) {
    throw new Error(`Projeto não encontrado na configuração: ${projectKey}`);
  }
  
  return {
    ...config.defaults,
    ...config.projects[projectKey]
  };
}

export function getEnvironmentConfig(config: Config, projectKey: string, environment: string): any {
  const projectConfig = getProjectConfig(config, projectKey);
  
  if (!projectConfig.environments || !projectConfig.environments[environment]) {
    throw new Error(`Ambiente '${environment}' não encontrado no projeto: ${projectKey}`);
  }
  
  return {
    ...projectConfig,
    ...projectConfig.environments[environment]
  };
}
```

## Próximos Passos

- Consulte [34-impl-plugins-templates.md](./34-impl-plugins-templates.md) para detalhes sobre plugins e templates
- Explore [20-ref-configuracao-yaml.md](./20-ref-configuracao-yaml.md) para entender as opções de configuração
- Veja [11-guia-sistema-build.md](./11-guia-sistema-build.md) para instruções de uso da CLI

## Referências

- [32-impl-core-sistema.md](./32-impl-core-sistema.md): Implementação do core do sistema
- [02-arquitetura-gas-builder.md](./02-arquitetura-gas-builder.md): Visão geral da arquitetura
- [Documentação do Yargs](https://yargs.js.org/): Biblioteca usada para a CLI
