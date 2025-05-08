# Prompt Final: Modularização do Build (Rollup)

## Cenário

Você está trabalhando em um projeto de migração para uma ferramenta de build genérica para Google Apps Script. O arquivo `rollup.config.js` atual contém uma função monolítica `generateRollupConfig` com cerca de 120 linhas, que concentra várias responsabilidades (parsing de configuração, montagem de entradas, plugins e saídas). Esta função precisa ser refatorada em módulos JavaScript menores, para melhorar testabilidade, manutenção e expansão futura. O código terá documentação no estilo TypeScript para melhor inteligência de código.

## Seu Papel

Você é um Arquiteto de Software especializado em sistemas de build JavaScript, com conhecimento profundo de Rollup, processos de bundling e práticas de Clean Architecture. Seu objetivo é transformar o build atual em uma solução modularizada, testável e com separação clara de responsabilidades, mantendo o sistema implementado em JavaScript com boa documentação.

## Instruções Detalhadas

1. **Análise da Função `generateRollupConfig`**
   - Examine detalhadamente o arquivo `rollup.config.js`, focando na função `generateRollupConfig`
   - Identifique as responsabilidades distintas:
     - Carregamento de configuração
     - Geração de entradas (input)
     - Instanciação de plugins
     - Configuração de saída (output)
     - Externals
   - Documente os parâmetros de entrada e saída
   - Observe padrões de acoplamento e duplicação de código (especialmente na montagem de plugins)

2. **Definição da Nova Estrutura de Arquivos**
   - Crie a seguinte estrutura no diretório `src/rollup/`:

     ```bash
     src/
     └─ rollup/
         ├─ index.js                    # Entry point exportando as funções principais
         ├─ types/
         │   └─ rollup-config.js         # Definições e comentários JSDoc compartilhados
         ├─ builders/
         │   ├─ input-builder.js        # Monta objeto de entradas
         │   ├─ output-builder.js       # Monta configuração de saída
         │   └─ plugin-factory.js       # Factory para instanciação de plugins
         └─ utils/
             └─ config-parser.js        # Funções auxiliares para parsing
     ```

3. **Implementação das Definições JSDoc**
   - Em `rollup-config.js`, defina os seguintes tipos com JSDoc:

     ```javascript
     /**
      * @typedef {Object} RollupPluginConfig
      * @property {string} name - Nome do plugin
      * @property {Object} [config] - Configuração do plugin
      */

     /**
      * @typedef {Object} ProjectRollupConfig
      * @property {string} [main] - Arquivo principal
       name?: string;
       'common-libs'?: Array<{name: string; path: string}>;
       'project-libs'?: Array<{name: string; path: string}>;
       externals?: string[];
       plugins?: IRollupPluginConfig[];
     }
     
     export interface IDefaultRollupConfig {
       output?: {
         format?: string;
         inlineDynamicImports?: boolean;
       };
       plugins?: IRollupPluginConfig[];
     }
     
     export interface IPaths {
       src: string;
       build: string;
       dist: string;
       templates: string;
       scripts: string;
     }
     
     export interface IProjectConfig {
       src: string;
       output: string;
       rollup?: IProjectRollupConfig;
     }
     
     export interface IConfigData {
       defaults: {
         paths: IPaths;
         rollup?: IDefaultRollupConfig;
       };
       projects: Record<string, IProjectConfig>;
     }
     ```

4. **Implementação de `input-builder.ts`**
   - Extraia a lógica de montagem de entradas da função original:

     ```typescript
     import { IConfigData, IProjectConfig, IProjectRollupConfig } from '../types/rollup-config.types';
     
     /**
      * Constrói o objeto de entradas para Rollup com base na configuração
      * @param projectKey Nome do projeto
      * @param projectConfig Configuração do projeto
      * @param configData Configuração global
      * @returns Objeto de entrada para o Rollup
      */
     export function buildInputConfig(
       projectKey: string,
       projectConfig: IProjectConfig,
       configData: IConfigData
     ): Record<string, string> {
       const input: Record<string, string> = {};
       const projectSrc = projectConfig.src;
       const projectRollupConfig = projectConfig.rollup || {};
       
       // Definir arquivo principal
       const mainFile = projectRollupConfig.main || 'main.ts';
       const mainPath = `${configData.defaults.paths.src}/${projectSrc}/${mainFile}`;
       input[projectKey] = mainPath;
       
       // Adicionar bibliotecas comuns
       const commonLibs = projectRollupConfig['common-libs'] || [];
       commonLibs.forEach(lib => {
         input[lib.name] = lib.path;
       });
       
       // Adicionar bibliotecas específicas
       const projectLibs = projectRollupConfig['project-libs'] || [];
       projectLibs.forEach(lib => {
         input[lib.name] = lib.path;
       });
       
       return input;
     }
     ```

5. **Implementação de `plugin-factory.ts`**
   - Extraia a lógica de instanciação de plugins, eliminando a duplicação:

     ```typescript
     import typescript from '@rollup/plugin-typescript';
     import nodeResolve from '@rollup/plugin-node-resolve';
     import terser from '@rollup/plugin-terser';
     import { IRollupPluginConfig } from '../types/rollup-config.types';

     /**
      * Factory para criação de plugins Rollup
      * @param pluginConfig Configuração do plugin
      * @param outputDir Diretório de saída (para o plugin TypeScript)
      * @returns Plugin instanciado
      */
     export function createPlugin(pluginConfig: IRollupPluginConfig, outputDir?: string) {
       switch (pluginConfig.name) {
         case 'nodeResolve':
           return nodeResolve(pluginConfig.config || {});
         case 'typescript':
           // Mesclar configurações com outDir especificado
           const tsConfig = {
             ...(pluginConfig.config || {}),
             ...(outputDir ? { outDir: outputDir } : {})
           };
           return typescript(tsConfig);
         case 'removeImports':
           return removeImports(pluginConfig.config || {});
         case 'terser':
           return terser(pluginConfig.config || {});
         default:
           throw new Error(`Plugin desconhecido: ${pluginConfig.name}`);
       }
     }

     /**
      * Plugin para remover todas as linhas de import estático
      * @param config Configuração do plugin
      * @returns Plugin Rollup
      */
     export function removeImports(config?: Record<string, unknown>) {
       return {
         name: 'remove-imports',
         renderChunk(code) {
           // Regex para capturar linhas com imports
           const stripped = code
             .split('\n')
             .filter(line => !/^import\s.*?;/.test(line))
             .filter(line => !/^export\s.*?;/.test(line))
             .join('\n');
           return { code: stripped, map: null };
         }
       };
     }

     /**
      * Cria array de plugins com base nas configurações
      * @param defaultPlugins Configurações de plugins padrão
      * @param projectPlugins Configurações de plugins específicos do projeto
      * @param outputDir Diretório de saída para o plugin TypeScript
      * @returns Array de plugins instanciados
      */
     export function createPlugins(
       defaultPlugins: IRollupPluginConfig[] = [],
       projectPlugins: IRollupPluginConfig[] = [],
       outputDir?: string
     ) {
       const plugins = [];
       
       // Adicionar plugins padrão
       defaultPlugins.forEach(pluginConfig => {
         plugins.push(createPlugin(pluginConfig, outputDir));
       });
       
       // Adicionar plugins específicos do projeto
       projectPlugins.forEach(pluginConfig => {
         plugins.push(createPlugin(pluginConfig, outputDir));
       });
       
       return plugins;
     }
     ```

6. **Implementação de `output-builder.ts`**
   - Extraia a lógica de configuração de saída:

     ```typescript
     import { IDefaultRollupConfig, IProjectRollupConfig } from '../types/rollup-config.types';

     /**
      * Constrói a configuração de saída para o Rollup
      * @param projectKey Nome do projeto
      * @param projectOutput Diretório de saída do projeto
      * @param buildDir Diretório de build base
      * @param defaultConfig Configuração padrão do Rollup
      * @param projectConfig Configuração específica do projeto
      * @returns Configuração de saída
      */
     export function buildOutputConfig(
       projectKey: string,
       projectOutput: string,
       buildDir: string,
       defaultConfig: IDefaultRollupConfig = {},
       projectConfig: IProjectRollupConfig = {}
     ) {
       // Construir configuração de saída com defaults e overrides
       return {
         dir: `${buildDir}/${projectOutput}`,
         format: defaultConfig.output?.format || 'esm',
         inlineDynamicImports: defaultConfig.output?.inlineDynamicImports !== undefined 
           ? defaultConfig.output.inlineDynamicImports 
           : false,
         name: projectConfig.name || `VilladasPedras.${projectKey.charAt(0).toUpperCase() + projectKey.slice(1)}`
       };
     }
     ```

7. **Atualização de `rollup.config.ts`**
   - Crie uma nova versão que utiliza os módulos refatorados:

     ```typescript
     import { RollupOptions } from 'rollup';
     import * as configHelper from './scripts/build-system/config-helper.js';
     import logger from './scripts/build-system/logger.js';
     import { buildInputConfig } from './src/rollup/builders/input-builder';
     import { buildOutputConfig } from './src/rollup/builders/output-builder';
     import { createPlugins } from './src/rollup/builders/plugin-factory';

     /**
      * Gera a configuração do Rollup com base no arquivo YAML
      * @param configData Objeto com a configuração
      * @returns Array com as configurações do Rollup
      */
     function generateRollupConfig(configData) {
       const rollupConfig: RollupOptions[] = [];
       const defaultRollupConfig = configData.defaults?.rollup || {};
       
       // Para cada projeto definido na configuração
       for (const projectKey in configData.projects) {
         const projectConfig = configData.projects[projectKey];
         
         // Pular projetos sem configuração de Rollup
         if (!projectConfig.src) continue;
         
         const projectRollupConfig = projectConfig.rollup || {};
         const projectOutput = projectConfig.output || projectKey;
         
         // Gerar configuração de entrada (input)
         const input = buildInputConfig(projectKey, projectConfig, configData);
         
         // Gerar plugins
         const outputDir = `${configData.defaults.paths.build}/${projectOutput}`;
         const plugins = createPlugins(
           defaultRollupConfig.plugins,
           projectRollupConfig.plugins,
           outputDir
         );
         
         // Gerar configuração de saída
         const output = buildOutputConfig(
           projectKey,
           projectOutput,
           configData.defaults.paths.build,
           defaultRollupConfig,
           projectRollupConfig
         );
         
         // Criar configuração completa do projeto
         const projectRollupConf: RollupOptions = {
           input,
           output,
           plugins
         };
         
         // Adicionar externals se existirem
         const externals = projectRollupConfig.externals || [];
         if (externals.length > 0) {
           projectRollupConf.external = externals;
         }
         
         rollupConfig.push(projectRollupConf);
       }
       
       return rollupConfig;
     }

     // Carregar a configuração usando o módulo compartilhado
     const config = configHelper.loadConfig();

     // Gerar a configuração do Rollup
     const rollupConfig = generateRollupConfig(config);

     // Exibir informações sobre a configuração gerada
     logger.info(`Configuração do Rollup gerada para ${rollupConfig.length} projetos:`);
     rollupConfig.forEach((config, index) => {
       logger.info(`  Projeto ${index + 1}: ${Object.keys(config.input).join(', ')}`);
     });

     export default rollupConfig;
     ```

8. **Testes Unitários para os Novos Módulos**
   - Crie testes para cada função refatorada, focando em:
     - Construção correta do objeto input
     - Instanciação adequada de plugins
     - Configuração de saída com valores padrão e específicos
     - Testes de integração que garantam equivalência com a versão original

## Fontes de Referência

- [Documentação do Rollup](https://rollupjs.org/guide/en/)
- [Rollup Plugin Development](https://rollupjs.org/plugin-development/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Clean Architecture em JavaScript](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

## Formato de Saída

Forneça sua implementação modularizada do Rollup em formato markdown, destacando:

1. Análise da função original e suas responsabilidades
2. Estrutura detalhada dos módulos propostos
3. Implementação das interfaces e tipos TypeScript
4. Códigos refatorados para cada módulo
5. Versão atualizada do arquivo `rollup.config.ts`
6. Exemplos de testes unitários para os novos módulos
7. Recomendações para melhorias futuras

**Atenção**: Mantenha a compatibilidade total com o comportamento atual do sistema. A refatoração deve ser transparente para os usuários da ferramenta, mudando apenas a arquitetura interna.
