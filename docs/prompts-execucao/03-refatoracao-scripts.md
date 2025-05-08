# Prompt Final: Refatoração e Modularização dos Scripts JavaScript

## Cenário

Você está trabalhando na modernização de um sistema de build para Google Apps Script. Atualmente, os scripts do sistema de build estão em JavaScript e estão localizados em `scripts/build-system/`, com arquivos grandes e de responsabilidades misturadas. Seu objetivo é refatorar esses scripts mantendo-os em JavaScript, mas melhorando sua organização e documentação com JSDoc, seguindo princípios de Clean Architecture, separando a lógica de negócio (core) da interface de linha de comando (CLI) e IO, facilitando testes unitários.

## Seu Papel

Você é um Arquiteto de Software especializado em JavaScript e Node.js, com experiência em refatorações de código legado e implementação de arquiteturas limpas. Seu foco é transformar os scripts atuais em módulos testáveis, com separação clara de responsabilidades e boa documentação usando JSDoc para tipagem e autocompletar.

## Instruções Detalhadas

1. **Análise dos Scripts Existentes**
   - Examine cada arquivo em `scripts/build-system/`, especialmente:
     - `config-helper.js` (carregamento e validação de YAML)
     - `template-helper.js` (processamento de templates)
     - `filesystem-helper.js` (operações de arquivo)
     - `deploy.js` (orquestração, CLI)
     - `logger.js` (logging)
   - Identifique para cada arquivo:
     - Funções exportadas e suas responsabilidades
     - Dependências externas (imports)
     - Acoplamentos (chamadas entre módulos)
     - Operações de IO vs. lógica pura

2. **Definição da Nova Estrutura**
   - Crie a seguinte estrutura de arquivos:

     ```bash
     src/
     ├─ core/
     │   ├─ config/
     │   │   ├─ types.js               # Definições de tipos JSDoc
     │   │   ├─ schema-validator.js    # Validação de schema
     │   │   ├─ yaml-parser.js         # Parsing de YAML
     │   │   └─ index.js               # Exportações e composição
     │   ├─ template/
     │   │   ├─ types.js               # Definições de tipos JSDoc
     │   │   ├─ renderer.js            # Renderização de templates
     │   │   └─ index.js               # Exportações
     │   ├─ filesystem/
     │   │   ├─ types.js               # Definições de tipos JSDoc
     │   │   ├─ operations.js          # Operações básicas (puras quando possível)
     │   │   └─ index.js               # Exportações
     │   └─ deploy/
     │       ├─ types.js               # Definições de tipos JSDoc
     │       ├─ processor.js           # Lógica de processamento
     │       ├─ clasp-client.js        # Interface para clasp
     │       └─ index.js               # Exportações
     ├─ cli/
     │   ├─ commands/
     │   │   ├── build.ts               # Comando de build
     │   │   ├── deploy.ts              # Comando de deploy
     │   │   ├── clean.ts               # Comando de limpeza
     │   │   └── index.ts               # Exportações
     │   ├── options.ts                 # Definição de opções comuns
     │   ├── parser.ts                  # Parser de argumentos com yargs
     │   └── index.ts                   # Entry point da CLI
     └── utils/
         ├── logger.ts                  # Serviço de logging
         ├── paths.ts                   # Resolução de caminhos
         └── errors.ts                  # Classes personalizadas de erro
     ```

3. **Implementação das Definições JSDoc**
   - Defina tipos JSDoc para todas as estruturas de dados, por exemplo:

     ```javascript
     // src/core/config/types.js
     export interface IProjectStructure {
       key: string;
       nested?: Array<{key: string}>;
     }

     export interface IDefaultsConfig {
       templates?: Record<string, {
         'destination-file': string;
         keys?: Array<Record<string, string>>;
       }>;
       paths?: {
         src?: string;
         build?: string;
         dist?: string;
         templates?: string;
         scripts?: string;
       };
       rollup?: {
         output?: {
           format?: string;
           inlineDynamicImports?: boolean;
         };
         plugins?: Array<{
           name: string;
           config?: Record<string, unknown>;
         }>;
       };
       'projects-structure'?: Record<string, IProjectStructure>;
     }

     export interface IProjectConfig {
       src: string;
       output: string;
       outputTemplate?: string;
       nameTemplate?: string;
       nested?: Array<{key: string}>;
       mapping?: {
         'keys-template'?: Array<{
           key: string;
           nameTemplate?: {
             substitutions?: Array<Record<string, string>>;
           };
         }>;
       };
       dependencies?: Array<{
         userSymbol: string;
         version: string;
         serviceId: string;
       }>;
       sheetsMacros?: Array<{
         menuName: string;
         functionName: string;
       }>;
       docsMacros?: Array<{
         menuName: string;
         functionName: string;
       }>;
       formsMacros?: Array<{
         menuName: string;
         functionName: string;
       }>;
       slidesMacros?: Array<{
         menuName: string;
         functionName: string;
       }>;
       rollup?: {
         main?: string;
         name?: string;
         'common-libs'?: Array<{
           name: string;
           path: string;
         }>;
         'project-libs'?: Array<{
           name: string;
           path: string;
         }>;
         externals?: string[];
         plugins?: Array<{
           name: string;
           config?: Record<string, unknown>;
         }>;
       };
       environments?: Record<string, Record<string, {
         templates?: Record<string, {
           'destination-file': string;
           scriptId?: string;
         }>;
         linkedFileId?: string;
       }>>;
     }

     export interface IConfig {
       defaults: IDefaultsConfig;
       projects: Record<string, IProjectConfig>;
     }

     export interface IConfigLoaderOptions {
       configFile?: string;
       verbose?: boolean;
       validate?: boolean;
     }

     export interface IConfigResult {
       config: IConfig;
       paths: {
         src: string;
         build: string;
         dist: string;
         templates: string;
         scripts: string;
       };
     }

     export interface ISchemaValidationResult {
       valid: boolean;
       errors?: Array<{
         instancePath: string;
         message?: string;
       }>;
     }
     ```

4. **Refatoração do Módulo Config**
   - Separe as responsabilidades do `config-helper.js` em funções puras:

     ```typescript
     // src/core/config/yaml-parser.ts
     import yaml from 'js-yaml';
     import { IConfig } from './interfaces';
     
     /**
      * Parseia uma string YAML para objeto
      * @param yamlContent Conteúdo YAML como string
      * @returns Objeto de configuração ou null se inválido
      */
     export function parseYaml(yamlContent: string): IConfig | null {
       try {
         const config = yaml.load(yamlContent) as IConfig;
         return config || null;
       } catch (error) {
         throw new Error(`Erro ao parsear YAML: ${error.message}`);
       }
     }
     ```

     ```typescript
     // src/core/config/schema-validator.ts
     import Ajv from 'ajv';
     import { IConfig, ISchemaValidationResult } from './interfaces';
     
     /**
      * Valida configuração contra schema JSON
      * @param config Configuração a validar
      * @param schema Schema JSON
      * @returns Resultado da validação
      */
     export function validateSchema(
       config: IConfig,
       schema: Record<string, unknown>
     ): ISchemaValidationResult {
       const ajv = new Ajv({ allErrors: true });
       const validate = ajv.compile(schema);
       const valid = validate(config);
       
       if (!valid) {
         return {
           valid: false,
           errors: validate.errors?.map(error => ({
             instancePath: error.instancePath,
             message: error.message
           }))
         };
       }
       
       return { valid: true };
     }
     ```

     ```typescript
     // src/core/config/index.ts
     import fs from 'fs';
     import path from 'path';
     import { parseYaml } from './yaml-parser';
     import { validateSchema } from './schema-validator';
     import { IConfig, IConfigLoaderOptions, IConfigResult } from './interfaces';
     import { resolveProjectPaths } from '../../utils/paths';
     import { ConfigError } from '../../utils/errors';
     import { logger } from '../../utils/logger';
     
     const DEFAULT_CONFIG_FILE = 'config.yml';
     const SCHEMA_FILE = path.resolve('./schema/config.schema.json');
     
     /**
      * Carrega e valida configuração a partir de arquivo YAML
      * @param options Opções de carregamento
      * @returns Configuração e caminhos resolvidos
      */
     export function loadConfig(options: IConfigLoaderOptions = {}): IConfigResult {
       const {
         configFile = DEFAULT_CONFIG_FILE,
         verbose = true,
         validate = true
       } = options;
       
       try {
         // Resolver caminho do arquivo
         const configPath = path.resolve(configFile);
         if (verbose) {
           logger.info(`Carregando configuração de: ${configFile}`);
         }
         
         // Verificar se existe
         if (!fs.existsSync(configPath)) {
           throw new ConfigError(`Arquivo de configuração não encontrado: ${configPath}`);
         }
         
         // Ler conteúdo
         const fileContents = fs.readFileSync(configPath, 'utf8');
         const config = parseYaml(fileContents);
         
         if (!config) {
           throw new ConfigError(`Arquivo de configuração vazio ou inválido: ${configPath}`);
         }
         
         // Validar se solicitado
         if (validate) {
           // Carregar schema se existir
           if (fs.existsSync(SCHEMA_FILE)) {
             const schemaContent = fs.readFileSync(SCHEMA_FILE, 'utf8');
             const schema = JSON.parse(schemaContent);
             
             const validationResult = validateSchema(config, schema);
             if (!validationResult.valid) {
               logger.error('Configuração inválida:');
               validationResult.errors?.forEach(error => {
                 logger.error(`  - ${error.instancePath}: ${error.message}`);
               });
               throw new ConfigError('A configuração não passou na validação de schema.');
             }
           } else {
             logger.warn(`Arquivo de schema não encontrado: ${SCHEMA_FILE}`);
             logger.warn('A validação de configuração será ignorada.');
           }
         }
         
         // Inicializar caminhos
         const paths = resolveProjectPaths(config);
         
         return { config, paths };
       } catch (error) {
         logger.error(`Erro ao carregar configuração: ${error.message}`);
         throw error;
       }
     }
     ```

5. **Implementação da CLI**
   - Crie um parser de argumentos com yargs:

     ```typescript
     // src/cli/options.ts
     import { Options } from 'yargs';
     
     export const globalOptions = {
       env: {
         alias: 'e',
         type: 'string',
         choices: ['dev', 'prod'],
         describe: 'Ambiente de deploy (dev ou prod)',
         default: 'dev'
       } as Options,
       
       config: {
         alias: 'c',
         type: 'string',
         describe: 'Arquivo de configuração alternativo',
         default: 'config.yml'
       } as Options,
       
       project: {
         alias: 'p',
         type: 'string',
         describe: 'Processar apenas um projeto específico'
       } as Options,
       
       'log-level': {
         alias: 'l',
         type: 'string',
         choices: ['verbose', 'debug', 'info', 'warn', 'error', 'none'],
         describe: 'Nível de log',
         default: 'info'
       } as Options
     };
     
     export const buildOptions = {
       clean: {
         type: 'boolean',
         describe: 'Limpar diretórios antes de processar',
         default: false
       } as Options
     };
     
     export const deployOptions = {
       ...buildOptions,
       
       push: {
         type: 'boolean',
         describe: 'Fazer push para o Google Apps Script após processamento',
         default: false
       } as Options
     };
     ```

     ```typescript
     // src/cli/parser.ts
     import yargs from 'yargs';
     import { hideBin } from 'yargs/helpers';
     import { globalOptions, buildOptions, deployOptions } from './options';
     
     export interface ICliArgs {
       [key: string]: unknown;
       env?: string;
       config?: string;
       project?: string;
       'log-level'?: string;
       clean?: boolean;
       push?: boolean;
       _: (string | number)[];
       $0: string;
     }
     
     /**
      * Configuração do parser de linha de comando
      */
     export function setupParser() {
       return yargs(hideBin(process.argv))
         .usage('Uso: $0 <comando> [opcoes]')
         .command('build', 'Compila os projetos', (yargs) => {
           return yargs.options({
             ...globalOptions,
             ...buildOptions
           });
         })
         .command('deploy', 'Implanta os projetos', (yargs) => {
           return yargs.options({
             ...globalOptions,
             ...deployOptions
           });
         })
         .command('clean', 'Limpa diretórios de build e dist', (yargs) => {
           return yargs.options({
             ...globalOptions
           });
         })
         .demandCommand(1, 'Especifique um comando')
         .help()
         .alias('h', 'help')
         .version()
         .alias('v', 'version');
     }
     
     /**
      * Processa os argumentos da linha de comando
      * @returns Argumentos processados
      */
     export function parseArgs(): ICliArgs {
       const parser = setupParser();
       return parser.parseSync() as ICliArgs;
     }
     ```

     ```typescript
     // src/cli/index.ts
     import { parseArgs } from './parser';
     import * as buildCommand from './commands/build';
     import * as deployCommand from './commands/deploy';
     import * as cleanCommand from './commands/clean';
     import { logger, setLogLevel } from '../utils/logger';
     
     /**
      * Entry point para a CLI
      */
     export async function run() {
       try {
         const args = parseArgs();
         
         // Configurar nível de log
         if (args['log-level']) {
           setLogLevel(args['log-level'] as string);
         }
         
         logger.info(`Executando comando: ${args._[0]}`);
         
         // Executar comando apropriado
         switch (args._[0]) {
           case 'build':
             await buildCommand.execute(args);
             break;
           case 'deploy':
             await deployCommand.execute(args);
             break;
           case 'clean':
             await cleanCommand.execute(args);
             break;
           default:
             logger.error(`Comando desconhecido: ${args._[0]}`);
             process.exit(1);
         }
         
         logger.info('Comando concluído com sucesso.');
       } catch (error) {
         logger.error(`Erro ao executar comando: ${error.message}`);
         process.exit(1);
       }
     }
     ```

6. **Refatoração do Módulo Template**
   - Separe a lógica de processamento de templates:

     ```typescript
     // src/core/template/interfaces.ts
     export interface ITemplateData {
       [key: string]: string | number | boolean | ITemplateData;
     }
     
     export interface IRenderOptions {
       templatePath: string;
       outputPath: string;
       data: ITemplateData;
     }
     ```

     ```typescript
     // src/core/template/renderer.ts
     import { ITemplateData } from './interfaces';
     
     /**
      * Renderiza um template com dados
      * @param template String do template com placeholders {{var}}
      * @param data Dados para substituição
      * @returns Template renderizado
      */
     export function renderTemplate(template: string, data: ITemplateData): string {
       let result = template;
       
       // Função recursiva para processar valores aninhados
       const processValue = (key: string, value: string | number | boolean | ITemplateData): void => {
         const placeholder = `{{${key}}}`;
         
         if (typeof value === 'object') {
           // Processar objeto aninhado
           for (const [nestedKey, nestedValue] of Object.entries(value)) {
             processValue(`${key}.${nestedKey}`, nestedValue);
           }
         } else {
           // Substituir placeholder pelo valor
           const stringValue = String(value);
           result = result.replace(new RegExp(placeholder, 'g'), stringValue);
         }
       };
       
       // Processar todos os dados
       for (const [key, value] of Object.entries(data)) {
         processValue(key, value);
       }
       
       return result;
     }
     ```

     ```typescript
     // src/core/template/index.ts
     import fs from 'fs';
     import path from 'path';
     import { renderTemplate } from './renderer';
     import { IRenderOptions } from './interfaces';
     import { logger } from '../../utils/logger';
     import { ensureDirectoryExists } from '../filesystem/operations';
     
     /**
      * Renderiza um template de arquivo e salva no destino
      * @param options Opções de renderização
      * @returns Caminho do arquivo gerado
      */
     export function renderTemplateFile(options: IRenderOptions): string {
       const { templatePath, outputPath, data } = options;
       
       try {
         // Verificar se o template existe
         if (!fs.existsSync(templatePath)) {
           throw new Error(`Template não encontrado: ${templatePath}`);
         }
         
         // Ler template
         const templateContent = fs.readFileSync(templatePath, 'utf8');
         
         // Renderizar template
         const renderedContent = renderTemplate(templateContent, data);
         
         // Criar diretório de saída se não existir
         const outputDir = path.dirname(outputPath);
         ensureDirectoryExists(outputDir);
         
         // Salvar arquivo renderizado
         fs.writeFileSync(outputPath, renderedContent);
         
         logger.debug(`Template renderizado: ${templatePath} -> ${outputPath}`);
         
         return outputPath;
       } catch (error) {
         logger.error(`Erro ao renderizar template: ${error.message}`);
         throw error;
       }
     }
     ```

7. **Implementação do Módulo Deploy**
   - Crie uma interface para orquestrar o processo de deploy:

     ```typescript
     // src/cli/commands/deploy.ts
     import { ICliArgs } from '../parser';
     import { loadConfig } from '../../core/config';
     import { processProjects } from '../../core/deploy';
     import { logger } from '../../utils/logger';
     import { cleanDirectories } from '../../core/filesystem/operations';
     
     /**
      * Executa o comando de deploy
      * @param args Argumentos da linha de comando
      */
     export async function execute(args: ICliArgs): Promise<void> {
       try {
         logger.info('Iniciando processo de deploy...');
         
         // Carregar configuração
         const { config, paths } = loadConfig({
           configFile: args.config as string,
           verbose: true
         });
         
         // Limpar diretórios se solicitado
         if (args.clean) {
           logger.info('Limpando diretórios...');
           await cleanDirectories([paths.build, paths.dist]);
         }
         
         // Filtrar projetos com base nos argumentos
         const filters: Record<string, string> = {};
         for (const [key, value] of Object.entries(args)) {
           // Ignorar argumentos especiais
           if (!['_', '$0', 'env', 'config', 'project', 'log-level', 'clean', 'push'].includes(key)) {
             filters[key] = value as string;
           }
         }
         
         // Processar projetos
         await processProjects({
           config,
           paths,
           projectName: args.project as string,
           filters,
           environment: args.env as string,
           doPush: args.push as boolean
         });
         
         logger.info('Deploy concluído com sucesso.');
       } catch (error) {
         logger.error(`Erro ao executar deploy: ${error.message}`);
         throw error;
       }
     }
     ```

8. **Testes Unitários**
   - Crie testes para cada módulo refatorado, por exemplo:

     ```typescript
     // tests/core/config/yaml-parser.test.ts
     import { parseYaml } from '../../../src/core/config/yaml-parser';
     
     describe('YAML Parser', () => {
       test('deve parsear YAML válido', () => {
         const yaml = `
           defaults:
             paths:
               src: ./src
           projects:
             example:
               src: example
               output: example
         `;
         
         const result = parseYaml(yaml);
         
         expect(result).toEqual({
           defaults: {
             paths: {
               src: './src'
             }
           },
           projects: {
             example: {
               src: 'example',
               output: 'example'
             }
           }
         });
       });
       
       test('deve retornar null para YAML vazio', () => {
         const result = parseYaml('');
         expect(result).toBeNull();
       });
       
       test('deve lançar erro para YAML inválido', () => {
         const yaml = `
           defaults:
             paths:
               src: ./src
             - invalid: yaml
         `;
         
         expect(() => parseYaml(yaml)).toThrow('Erro ao parsear YAML');
       });
     });
     ```

## Fontes de Referência

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [yargs Documentation](https://github.com/yargs/yargs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [fs-extra Documentation](https://github.com/jprichardson/node-fs-extra)

## Formato de Saída

Forneça sua implementação de refatoração em formato markdown, incluindo:

1. Análise detalhada dos scripts atuais e suas responsabilidades
2. Estrutura proposta dos módulos em TypeScript
3. Implementação das interfaces e tipos
4. Código para cada módulo refatorado
5. Exemplos de testes unitários
6. Guia de migração dos scripts existentes para a nova estrutura
7. Recomendações para melhorias futuras

**Atenção**: Mantenha a compatibilidade com o comportamento atual. A refatoração deve preservar a funcionalidade existente, apenas melhorando a estrutura interna, adicionando tipagem e facilitando testes.
