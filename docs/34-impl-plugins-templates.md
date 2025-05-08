# Implementação de Plugins e Templates do GAS Builder

> Última atualização: 06/05/2025

## Resumo

Este documento detalha a implementação do sistema de plugins e templates do GAS Builder, além da integração com Rollup para empacotamento de código. Essas funcionalidades permitem extensibilidade e personalização avançada do sistema de build.

## Pré-requisitos

- Conhecimento de TypeScript e padrões de plugin
- Familiaridade com Rollup e seus plugins
- Entendimento do template engine Handlebars
- Leitura prévia de [32-impl-core-sistema.md](./32-impl-core-sistema.md) e [33-impl-cli.md](./33-impl-cli.md)

## 1. Sistema de Templates

### 1.1 Implementação (src/templates/processor.ts)

O sistema de templates utiliza o Handlebars para processar arquivos de configuração:

```typescript
import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import { logger } from '../logger/logger.js';

interface TemplateOptions {
  templateFile: string;
  outputFile: string;
  templateVars: Record<string, any>;
}

export async function processTemplate(options: TemplateOptions): Promise<void> {
  const { templateFile, outputFile, templateVars } = options;
  
  try {
    logger.debug(`Processando template: ${templateFile} -> ${outputFile}`);
    
    // Verificar se o arquivo de template existe
    if (!fs.existsSync(templateFile)) {
      throw new Error(`Arquivo de template não encontrado: ${templateFile}`);
    }
    
    // Ler conteúdo do template
    const templateContent = await fs.readFile(templateFile, 'utf8');
    
    // Compilar template
    const template = Handlebars.compile(templateContent);
    
    // Aplicar variáveis ao template
    const processedContent = template(templateVars);
    
    // Criar diretório de saída se não existir
    const outputDir = path.dirname(outputFile);
    await fs.ensureDir(outputDir);
    
    // Salvar arquivo processado
    await fs.writeFile(outputFile, processedContent, 'utf8');
    
    logger.debug(`Template processado com sucesso: ${outputFile}`);
  } catch (error) {
    logger.error(`Erro ao processar template: ${error.message}`);
    throw error;
  }
}
```

### 1.2 Processamento de Templates do Projeto

Função para processar todos os templates de um projeto:

```typescript
export async function processProjectTemplates(
  config: any,
  projectKey: string,
  environment: string,
  filters: Record<string, any> = {}
): Promise<{ outputDir: string } | null> {
  logger.debug(`Processando templates para projeto ${projectKey} no ambiente ${environment}`);
  logger.debug(`Filtros: ${JSON.stringify(filters)}`);
  
  // Obter configuração do projeto
  const projectConfig = config.projects?.[projectKey];
  if (!projectConfig) {
    logger.error(`Projeto não encontrado: ${projectKey}`);
    return null;
  }
  
  // Obter configuração do ambiente
  const envConfig = projectConfig.environments?.[environment];
  if (!envConfig) {
    logger.error(`Ambiente não encontrado: ${environment}`);
    return null;
  }
  
  // Obter scriptId
  const scriptId = envConfig.scriptId;
  if (!scriptId) {
    logger.error(`ScriptId não definido para ambiente ${environment} do projeto ${projectKey}`);
    return null;
  }
  
  // Diretório de build
  const outputDir = path.resolve(
    process.cwd(),
    projectConfig.output || projectConfig.src || projectKey
  );
  
  // Caminhos para templates
  const templatesDir = path.resolve(
    process.cwd(),
    config.defaults?.paths?.templates || 'templates'
  );
  
  // Processar cada template
  for (const [templateKey, templateConfig] of Object.entries(config.defaults?.templates || {})) {
    // Verificar filtros
    if (filters.template && filters.template !== templateKey) {
      continue;
    }
    
    const templateFile = path.join(templatesDir, templateKey);
    const destFile = path.join(
      outputDir,
      templateConfig.destinationFile || templateKey.replace('-template', '')
    );
    
    // Variáveis para o template
    const templateVars = {
      projectKey,
      environment,
      scriptId,
      ...templateConfig.keys,
      ...projectConfig
    };
    
    // Processar o template
    await processTemplate({
      templateFile,
      outputFile: destFile,
      templateVars
    });
  }
  
  return { outputDir };
}
```

### 1.3 Helpers do Handlebars

Helpers personalizados para expandir as capacidades do sistema de templates:

```typescript
// Registrar helpers personalizados
export function registerTemplateHelpers(): void {
  // Helper para formatação de data
  Handlebars.registerHelper('formatDate', function(format) {
    const now = new Date();
    // Implementação da formatação...
    return formattedDate;
  });
  
  // Helper para condicionais avançadas
  Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return arg1 === arg2 ? options.fn(this) : options.inverse(this);
  });
  
  // Helper para conversão JSON
  Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context, null, 2);
  });
}
```

## 2. Integração com Rollup

### 2.1 Configuração do Rollup (src/rollup/config.ts)

Geração dinâmica da configuração do Rollup com base no projeto:

```typescript
import path from 'path';
import { RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { logger } from '../logger/logger.js';

function buildRollupConfig(config: any, projectKey: string, paths: any): RollupOptions | null {
  try {
    // Obter configuração do projeto
    const projectConfig = config.projects?.[projectKey];
    if (!projectConfig) {
      logger.error(`Projeto não encontrado: ${projectKey}`);
      return null;
    }
    
    // Diretórios de entrada e saída
    const srcDir = path.resolve(process.cwd(), projectConfig.src || projectKey);
    const outputDir = path.resolve(process.cwd(), projectConfig.output || projectConfig.src || projectKey);
    
    // Arquivos de entrada
    const entryFiles = projectConfig.entryFiles || ['index.ts'];
    const entries = entryFiles.map((file: string) => path.join(srcDir, file));
    
    // Transformar formato de entrada para Rollup
    const input = entries.reduce((acc: Record<string, string>, file: string) => {
      const basename = path.basename(file, path.extname(file));
      acc[basename] = file;
      return acc;
    }, {});
    
    // Plugins do Rollup
    const plugins = [
      // Resolução de módulos node
      resolve({
        extensions: ['.ts', '.js']
      }),
      // Suporte a CommonJS
      commonjs(),
      // Compilação de TypeScript
      typescript({
        tsconfig: path.resolve(process.cwd(), 'tsconfig.json'),
        sourceMap: false
      })
    ];
    
    // Adicionar minificação se configurado
    if (projectConfig.minify) {
      plugins.push(terser());
    }
    
    // Configuração final do Rollup
    const rollupConfig: RollupOptions = {
      input,
      output: {
        dir: outputDir,
        format: 'esm',
        exports: 'named'
      },
      plugins,
      // Evitar bundling de dependências externas
      external: projectConfig.externals || []
    };
    
    return rollupConfig;
  } catch (error) {
    logger.error(`Erro ao criar configuração do Rollup: ${error.message}`);
    return null;
  }
}
```

### 2.2 Processo de Build (src/rollup/build.ts)

Execução do processo de build com Rollup:

```typescript
import { rollup, watch, RollupOptions } from 'rollup';
import { loadConfig } from '../config/config.js';
import { logger } from '../logger/logger.js';
import { buildRollupConfig } from './config.js';

export async function build(
  configFile: string,
  projectKey: string | undefined,
  clean: boolean = false
): Promise<void> {
  try {
    // Carregar configuração
    const config = loadConfig(configFile);
    
    // Determinar projetos a serem compilados
    const projectKeys = projectKey 
      ? [projectKey]
      : Object.keys(config.projects || {});
    
    if (projectKeys.length === 0) {
      logger.error('Nenhum projeto encontrado para build');
      return;
    }
    
    // Compilar cada projeto
    for (const key of projectKeys) {
      logger.info(`Compilando projeto: ${key}`);
      
      // Limpar diretório se solicitado
      if (clean) {
        const outputDir = config.projects?.[key]?.output || key;
        logger.info(`Limpando diretório: ${outputDir}`);
        // Implementação da limpeza...
      }
      
      // Gerar configuração do Rollup
      const rollupConfig = buildRollupConfig(config, key, config.defaults?.paths || {});
      
      if (!rollupConfig) {
        logger.error(`Falha ao gerar configuração para projeto: ${key}`);
        continue;
      }
      
      // Executar build com Rollup
      const bundle = await rollup(rollupConfig);
      
      // Gerar output
      if (rollupConfig.output) {
        if (Array.isArray(rollupConfig.output)) {
          for (const output of rollupConfig.output) {
            await bundle.write(output);
          }
        } else {
          await bundle.write(rollupConfig.output);
        }
      }
      
      // Fechar bundle
      await bundle.close();
      
      logger.info(`Compilação concluída: ${key}`);
    }
  } catch (error) {
    logger.error(`Erro durante o build: ${error.message}`);
    throw error;
  }
}
```

### 2.3 Modo Watch (src/rollup/watch.ts)

Implementação do modo watch para recompilação automática:

```typescript
export function watchProjects(
  configFile: string,
  projectKey: string | undefined
): void {
  try {
    // Carregar configuração
    const config = loadConfig(configFile);
    
    // Determinar projetos a serem observados
    const projectKeys = projectKey 
      ? [projectKey]
      : Object.keys(config.projects || {});
    
    if (projectKeys.length === 0) {
      logger.error('Nenhum projeto encontrado para watch');
      return;
    }
    
    const watchOptions = [];
    
    // Configurar watch para cada projeto
    for (const key of projectKeys) {
      logger.info(`Configurando watch para projeto: ${key}`);
      
      // Gerar configuração do Rollup
      const rollupConfig = buildRollupConfig(config, key, config.defaults?.paths || {});
      
      if (!rollupConfig) {
        logger.error(`Falha ao gerar configuração para projeto: ${key}`);
        continue;
      }
      
      watchOptions.push({
        ...rollupConfig,
        watch: {
          clearScreen: false,
          include: `src/${key}/**/*`
        }
      });
    }
    
    // Iniciar watch
    const watcher = watch(watchOptions);
    
    // Eventos do watcher
    watcher.on('event', (event) => {
      switch (event.code) {
        case 'START':
          logger.info('Compilação iniciada...');
          break;
        case 'BUNDLE_START':
          logger.debug(`Bundling começou: ${event.input}`);
          break;
        case 'BUNDLE_END':
          logger.debug(`Bundling concluído: ${event.duration}ms`);
          break;
        case 'END':
          logger.info('Compilação concluída');
          break;
        case 'ERROR':
          logger.error(`Erro: ${event.error}`);
          break;
      }
    });
    
    logger.info('Modo watch iniciado. Pressione Ctrl+C para sair.');
  } catch (error) {
    logger.error(`Erro ao iniciar watch: ${error.message}`);
    throw error;
  }
}
```

## 3. Sistema de Plugins

### 3.1 Estrutura de Plugins (src/plugins/types.ts)

Definição da interface de plugins para extensibilidade:

```typescript
export interface Plugin {
  name: string;
  hooks: {
    beforeBuild?: (config: any, projectKey: string) => Promise<void> | void;
    afterBuild?: (config: any, projectKey: string, outputDir: string) => Promise<void> | void;
    beforeDeploy?: (config: any, projectKey: string, environment: string) => Promise<void> | void;
    afterDeploy?: (config: any, projectKey: string, environment: string) => Promise<void> | void;
  };
}
```

### 3.2 Gerenciador de Plugins (src/plugins/manager.ts)

Sistema para carregar e executar plugins:

```typescript
import path from 'path';
import fs from 'fs-extra';
import { logger } from '../logger/logger.js';
import { Plugin } from './types.js';

class PluginManager {
  private plugins: Plugin[] = [];
  
  async loadPlugins(pluginsDir: string): Promise<void> {
    try {
      if (!fs.existsSync(pluginsDir)) {
        logger.debug(`Diretório de plugins não encontrado: ${pluginsDir}`);
        return;
      }
      
      const files = await fs.readdir(pluginsDir);
      
      for (const file of files) {
        if (file.endsWith('.js') || file.endsWith('.mjs')) {
          const pluginPath = path.join(pluginsDir, file);
          
          try {
            // Importar plugin dinamicamente
            const module = await import(pluginPath);
            const plugin = module.default as Plugin;
            
            if (!plugin || !plugin.name || !plugin.hooks) {
              logger.warn(`Plugin inválido em ${pluginPath}`);
              continue;
            }
            
            this.plugins.push(plugin);
            logger.debug(`Plugin carregado: ${plugin.name}`);
          } catch (error) {
            logger.error(`Erro ao carregar plugin ${file}: ${error.message}`);
          }
        }
      }
      
      logger.info(`${this.plugins.length} plugins carregados`);
    } catch (error) {
      logger.error(`Erro ao carregar plugins: ${error.message}`);
    }
  }
  
  async runHook(
    hookName: keyof Plugin['hooks'],
    config: any,
    projectKey: string,
    extraArg?: string
  ): Promise<void> {
    for (const plugin of this.plugins) {
      const hook = plugin.hooks[hookName];
      
      if (hook) {
        try {
          logger.debug(`Executando hook ${hookName} do plugin ${plugin.name}`);
          await hook(config, projectKey, extraArg as any);
        } catch (error) {
          logger.error(`Erro no hook ${hookName} do plugin ${plugin.name}: ${error.message}`);
        }
      }
    }
  }
}

export const pluginManager = new PluginManager();
```

### 3.3 Plugins Padrão

O sistema vem com alguns plugins padrão que demonstram a extensibilidade:

#### 3.3.1 Plugin de Validação (plugins/validation.ts)

```typescript
import { Plugin } from '../src/plugins/types.js';
import { logger } from '../src/logger/logger.js';

const validationPlugin: Plugin = {
  name: 'ValidationPlugin',
  hooks: {
    beforeBuild: (config, projectKey) => {
      logger.info(`Validando configuração do projeto ${projectKey}...`);
      
      const projectConfig = config.projects?.[projectKey];
      
      if (!projectConfig) {
        throw new Error(`Projeto não encontrado: ${projectKey}`);
      }
      
      // Validar campos obrigatórios
      if (!projectConfig.src) {
        throw new Error(`Campo 'src' não definido para projeto ${projectKey}`);
      }
      
      logger.info(`Validação concluída para projeto ${projectKey}`);
    },
    
    beforeDeploy: (config, projectKey, environment) => {
      logger.info(`Validando deploy para ${projectKey} no ambiente ${environment}...`);
      
      const projectConfig = config.projects?.[projectKey];
      
      if (!projectConfig) {
        throw new Error(`Projeto não encontrado: ${projectKey}`);
      }
      
      const envConfig = projectConfig.environments?.[environment];
      
      if (!envConfig) {
        throw new Error(`Ambiente ${environment} não definido para projeto ${projectKey}`);
      }
      
      if (!envConfig.scriptId) {
        throw new Error(`ScriptId não definido para ambiente ${environment} do projeto ${projectKey}`);
      }
      
      logger.info(`Validação de deploy concluída para ${projectKey}/${environment}`);
    }
  }
};

export default validationPlugin;
```

## Próximos Passos

- Consulte [20-ref-configuracao-yaml.md](./20-ref-configuracao-yaml.md) para entender as opções de configuração
- Explore [22-ref-plugins.md](./22-ref-plugins.md) para referência completa dos plugins disponíveis
- Veja [11-guia-sistema-build.md](./11-guia-sistema-build.md) para instruções práticas de uso

## Referências

- [32-impl-core-sistema.md](./32-impl-core-sistema.md): Implementação do core do sistema
- [33-impl-cli.md](./33-impl-cli.md): Implementação da CLI
- [Documentação do Rollup](https://rollupjs.org/): Referência do empacotador usado
- [Documentação do Handlebars](https://handlebarsjs.com/): Template engine utilizado
