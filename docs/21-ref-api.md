# Referência da API do GAS Builder

> Última atualização: 08/05/2025

## Resumo

Este documento fornece uma referência detalhada da API do GAS Builder, incluindo APIs de núcleo, utilitários, plugins e interfaces específicas. É destinado a desenvolvedores que precisam entender a API para estender ou integrar com o sistema.

## Pré-requisitos

- Conhecimento de [TypeScript](https://www.typescriptlang.org/docs/)
- Familiaridade com o [GAS Builder](./00-introducao-gas-builder.md)
- Compreensão básica de [API design patterns](https://learning.oreilly.com/library/view/api-design-patterns/9781617295850/)

## 1. API Core

### 1.1. ConfigManager

Interface para gerenciamento de configurações.

```typescript
interface ConfigManager {
  /**
   * Carrega uma configuração a partir de um arquivo
   * @param path Caminho para o arquivo de configuração
   */
  loadConfig(path: string): Promise<Config>;
  
  /**
   * Valida uma configuração
   * @param config Configuração a ser validada
   */
  validateConfig(config: unknown): ValidationResult;
  
  /**
   * Obtém configuração de um projeto específico
   * @param projectId ID do projeto
   */
  getProjectConfig(projectId: string): ProjectConfig | null;
  
  /**
   * Mescla a configuração de ambiente com a configuração base
   * @param baseConfig Configuração base
   * @param environment Nome do ambiente
   */
  mergeEnvironmentConfig(baseConfig: Config, environment: string): Config;
}
```

#### 1.1.1. Exemplo de Uso

```typescript
import { ConfigManager } from '@gas-builder/core';

const configManager = new ConfigManager();
const config = await configManager.loadConfig('./config.yml');

const projectConfig = configManager.getProjectConfig('my-project');
console.log(`Building project: ${projectConfig.name}`);
```

### 1.2. ProjectManager

Interface para gerenciamento de projetos.

```typescript
interface ProjectManager {
  /**
   * Cria um novo projeto
   * @param name Nome do projeto
   * @param templateId ID do template a ser usado
   * @param options Opções adicionais
   */
  createProject(name: string, templateId: string, options?: CreateProjectOptions): Promise<Project>;
  
  /**
   * Lista todos os projetos
   */
  listProjects(): Project[];
  
  /**
   * Obtém um projeto específico
   * @param id ID do projeto
   */
  getProject(id: string): Project | null;
  
  /**
   * Compila um projeto
   * @param id ID do projeto
   * @param options Opções de compilação
   */
  buildProject(id: string, options?: BuildOptions): Promise<BuildResult>;
  
  /**
   * Faz deploy de um projeto
   * @param id ID do projeto
   * @param options Opções de deploy
   */
  deployProject(id: string, options?: DeployOptions): Promise<DeployResult>;
}
```

#### 1.2.1. Exemplo de Uso

```typescript
import { ProjectManager } from '@gas-builder/core';

const projectManager = new ProjectManager(configManager);

// Listar projetos
const projects = projectManager.listProjects();
console.log(`Found ${projects.length} projects`);

// Compilar um projeto
const buildResult = await projectManager.buildProject('my-project', {
  production: true,
  watch: false
});

if (buildResult.success) {
  console.log('Build concluído com sucesso!');
} else {
  console.error('Falha no build:', buildResult.errors);
}
```

### 1.3. PluginManager

Interface para gerenciamento de plugins.

```typescript
interface PluginManager {
  /**
   * Registra um plugin
   * @param plugin Plugin a ser registrado
   */
  registerPlugin(plugin: Plugin): void;
  
  /**
   * Inicializa todos os plugins
   * @param context Contexto de inicialização
   */
  initializePlugins(context: PluginContext): Promise<void>;
  
  /**
   * Executa hooks para um evento específico
   * @param event Nome do evento
   * @param context Contexto do evento
   */
  runHooks(event: HookEvent, context: EventContext): Promise<void>;
  
  /**
   * Obtém um plugin pelo ID
   * @param id ID do plugin
   */
  getPlugin(id: string): Plugin | null;
  
  /**
   * Lista todos os plugins registrados
   */
  listPlugins(): Plugin[];
}
```

#### 1.3.1. Exemplo de Uso

```typescript
import { PluginManager } from '@gas-builder/core';
import { GoogleSheetsPlugin } from '@gas-builder/plugin-sheets';

const pluginManager = new PluginManager();

// Registrar um plugin
pluginManager.registerPlugin(new GoogleSheetsPlugin());

// Inicializar plugins
await pluginManager.initializePlugins({
  config: configManager.getConfig(),
  logger: console
});

// Executar hooks
await pluginManager.runHooks('beforeBuild', {
  project: projectManager.getProject('my-project'),
  buildOptions: { production: true }
});
```

### 1.4. TemplateManager

Interface para gerenciamento de templates.

```typescript
interface TemplateManager {
  /**
   * Registra um template
   * @param template Template a ser registrado
   */
  registerTemplate(template: Template): void;
  
  /**
   * Obtém um template pelo ID
   * @param id ID do template
   */
  getTemplate(id: string): Template | null;
  
  /**
   * Lista todos os templates disponíveis
   */
  listTemplates(): Template[];
  
  /**
   * Gera um projeto a partir de um template
   * @param templateId ID do template
   * @param destination Caminho de destino
   * @param options Opções para o template
   */
  generateFromTemplate(
    templateId: string, 
    destination: string, 
    options: TemplateOptions
  ): Promise<void>;
}
```

#### 1.4.1. Exemplo de Uso

```typescript
import { TemplateManager } from '@gas-builder/core';
import { BasicTemplate } from '@gas-builder/templates';

const templateManager = new TemplateManager();

// Registrar um template
templateManager.registerTemplate(new BasicTemplate());

// Listar templates
const templates = templateManager.listTemplates();
console.log('Templates disponíveis:', templates.map(t => t.id));

// Gerar a partir de um template
await templateManager.generateFromTemplate('basic', './new-project', {
  name: 'Meu Novo Projeto',
  description: 'Descrição do projeto',
  author: 'Seu Nome'
});
```

## 2. Interfaces Principais

### 2.1. Config

Interface para configuração principal.

```typescript
interface Config {
  /**
   * Versão da configuração
   */
  version: string;
  
  /**
   * Configurações padrão
   */
  defaults: DefaultConfig;
  
  /**
   * Ambientes (dev, staging, prod, etc.)
   */
  environments: Record<string, EnvironmentConfig>;
  
  /**
   * Projetos configurados
   */
  projects: Record<string, ProjectConfig>;
}

interface DefaultConfig {
  build: BuildConfig;
  clasp: ClaspConfig;
  plugins: PluginConfig[];
}

interface EnvironmentConfig {
  build?: Partial<BuildConfig>;
  clasp?: Partial<ClaspConfig>;
  variables?: Record<string, string>;
}

interface ProjectConfig {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  rootDir: string;
  sourceDir: string;
  outDir: string;
  scriptId?: string;
  clasp: ClaspConfig;
  build: BuildConfig;
  plugins: PluginConfig[];
}
```

### 2.2. Plugin

Interface para plugins.

```typescript
interface Plugin {
  /**
   * ID do plugin
   */
  id: string;
  
  /**
   * Nome amigável
   */
  name: string;
  
  /**
   * Descrição
   */
  description: string;
  
  /**
   * Versão
   */
  version: string;
  
  /**
   * Inicializa o plugin
   * @param context Contexto do plugin
   */
  initialize(context: PluginContext): Promise<void>;
  
  /**
   * Hook executado antes do build
   * @param context Contexto do build
   */
  onBeforeBuild?(context: BuildContext): Promise<void>;
  
  /**
   * Hook executado após o build
   * @param context Contexto do build
   */
  onAfterBuild?(context: BuildContext): Promise<void>;
  
  /**
   * Hook executado antes do deploy
   * @param context Contexto do deploy
   */
  onBeforeDeploy?(context: DeployContext): Promise<void>;
  
  /**
   * Hook executado após o deploy
   * @param context Contexto do deploy
   */
  onAfterDeploy?(context: DeployContext): Promise<void>;
  
  /**
   * Comandos fornecidos pelo plugin
   */
  commands?: Record<string, Command>;
}
```

### 2.3. Template

Interface para templates.

```typescript
interface Template {
  /**
   * ID do template
   */
  id: string;
  
  /**
   * Nome amigável
   */
  name: string;
  
  /**
   * Descrição
   */
  description: string;
  
  /**
   * Versão
   */
  version: string;
  
  /**
   * Obtém variáveis suportadas pelo template
   */
  getVariables(): TemplateVariable[];
  
  /**
   * Valida opções para o template
   * @param options Opções a serem validadas
   */
  validateOptions(options: TemplateOptions): ValidationResult;
  
  /**
   * Gera um projeto baseado no template
   * @param destination Caminho de destino
   * @param options Opções do template
   */
  generate(destination: string, options: TemplateOptions): Promise<void>;
}
```

## 3. API de CLI

### 3.1. CLIManager

Interface para gerenciamento da CLI.

```typescript
interface CLIManager {
  /**
   * Registra um comando
   * @param name Nome do comando
   * @param handler Manipulador do comando
   */
  registerCommand(name: string, handler: CommandHandler): void;
  
  /**
   * Registra opções globais
   * @param options Opções globais
   */
  registerGlobalOptions(options: CLIOption[]): void;
  
  /**
   * Parseia argumentos e executa o comando
   * @param args Argumentos da linha de comando
   */
  parse(args: string[]): Promise<void>;
  
  /**
   * Executa um comando específico
   * @param command Nome do comando
   * @param options Opções para o comando
   */
  run(command: string, options?: any): Promise<void>;
}
```

### 3.2. Exemplo de Comando Personalizado

```typescript
import { CLIManager, CommandHandler } from '@gas-builder/cli';

const buildHandler: CommandHandler = async (options, cliContext) => {
  const { projectId, production } = options;
  
  console.log(`Building project ${projectId}...`);
  
  const projectManager = cliContext.getProjectManager();
  const result = await projectManager.buildProject(projectId, {
    production: production === true
  });
  
  if (result.success) {
    console.log('Build concluído com sucesso!');
  } else {
    console.error('Falha no build:', result.errors);
    process.exit(1);
  }
};

const cliManager = new CLIManager();
cliManager.registerCommand('build', buildHandler);
```

## 4. API de Utilitários

### 4.1. FileSystem

Interface para operações de sistema de arquivos.

```typescript
interface FileSystem {
  /**
   * Lê um arquivo
   * @param path Caminho do arquivo
   */
  readFile(path: string): Promise<string>;
  
  /**
   * Escreve um arquivo
   * @param path Caminho do arquivo
   * @param content Conteúdo a ser escrito
   */
  writeFile(path: string, content: string): Promise<void>;
  
  /**
   * Verifica se um arquivo existe
   * @param path Caminho do arquivo
   */
  exists(path: string): Promise<boolean>;
  
  /**
   * Cria um diretório
   * @param path Caminho do diretório
   */
  mkdir(path: string, recursive?: boolean): Promise<void>;
  
  /**
   * Copia arquivos
   * @param source Fonte
   * @param destination Destino
   */
  copy(source: string, destination: string): Promise<void>;
  
  /**
   * Remove arquivos ou diretórios
   * @param path Caminho a ser removido
   */
  remove(path: string): Promise<void>;
}
```

### 4.2. Logger

Interface para logging.

```typescript
interface Logger {
  /**
   * Loga uma mensagem de debug
   * @param message Mensagem
   * @param context Contexto opcional
   */
  debug(message: string, context?: any): void;
  
  /**
   * Loga uma mensagem informativa
   * @param message Mensagem
   * @param context Contexto opcional
   */
  info(message: string, context?: any): void;
  
  /**
   * Loga um aviso
   * @param message Mensagem
   * @param context Contexto opcional
   */
  warn(message: string, context?: any): void;
  
  /**
   * Loga um erro
   * @param message Mensagem
   * @param context Contexto opcional
   */
  error(message: string, context?: any): void;
}
```

### 4.3. Validator

Interface para validação.

```typescript
interface Validator {
  /**
   * Valida um objeto contra um schema
   * @param obj Objeto a ser validado
   * @param schema Schema para validação
   */
  validate(obj: unknown, schema: any): ValidationResult;
  
  /**
   * Valida um arquivo de configuração
   * @param configPath Caminho do arquivo de configuração
   */
  validateConfigFile(configPath: string): Promise<ValidationResult>;
}
```

## 5. API de Plugins Principais

### 5.1. Google Sheets Plugin

API do plugin para Google Sheets.

```typescript
interface GoogleSheetsPlugin extends Plugin {
  /**
   * Gera código específico para Sheets
   * @param context Contexto de geração
   */
  generateSheetsSpecificCode(context: GenerationContext): Promise<string>;
  
  /**
   * Cria funções personalizadas para Sheets
   * @param context Contexto de geração
   */
  createCustomFunctions(context: GenerationContext): Promise<CustomFunction[]>;
}

interface CustomFunction {
  name: string;
  description: string;
  parameters: CustomFunctionParameter[];
  returnType: string;
  code: string;
}
```

### 5.2. Google Docs Plugin

API do plugin para Google Docs.

```typescript
interface GoogleDocsPlugin extends Plugin {
  /**
   * Gera código específico para Docs
   * @param context Contexto de geração
   */
  generateDocsSpecificCode(context: GenerationContext): Promise<string>;
  
  /**
   * Cria manipuladores de documento
   * @param context Contexto de geração
   */
  createDocumentHandlers(context: GenerationContext): Promise<DocumentHandler[]>;
}

interface DocumentHandler {
  event: 'open' | 'edit' | 'change';
  name: string;
  code: string;
}
```

### 5.3. Drive Plugin

API do plugin para Google Drive.

```typescript
interface DrivePlugin extends Plugin {
  /**
   * Gera código específico para Drive
   * @param context Contexto de geração
   */
  generateDriveSpecificCode(context: GenerationContext): Promise<string>;
  
  /**
   * Cria manipuladores de arquivos
   * @param context Contexto de geração
   */
  createFileHandlers(context: GenerationContext): Promise<FileHandler[]>;
}

interface FileHandler {
  event: 'create' | 'change' | 'delete';
  mimeTypes: string[];
  name: string;
  code: string;
}
```

## 6. API de Contextos

### 6.1. PluginContext

Contexto passado para plugins.

```typescript
interface PluginContext {
  /**
   * Configuração
   */
  config: Config;
  
  /**
   * Logger
   */
  logger: Logger;
  
  /**
   * Sistema de arquivos
   */
  fs: FileSystem;
  
  /**
   * Gerenciador de projetos
   */
  projectManager: ProjectManager;
}
```

### 6.2. BuildContext

Contexto usado durante o build.

```typescript
interface BuildContext extends PluginContext {
  /**
   * Projeto sendo compilado
   */
  project: ProjectConfig;
  
  /**
   * Configuração de build
   */
  buildConfig: BuildConfig;
  
  /**
   * Diretório de saída
   */
  outDir: string;
  
  /**
   * Modo de produção?
   */
  production: boolean;
  
  /**
   * Configuração do Rollup (se aplicável)
   */
  rollupConfig?: any;
}
```

### 6.3. DeployContext

Contexto usado durante o deploy.

```typescript
interface DeployContext extends PluginContext {
  /**
   * Projeto sendo implantado
   */
  project: ProjectConfig;
  
  /**
   * Ambiente alvo
   */
  environment: string;
  
  /**
   * Configuração do Clasp
   */
  claspConfig: ClaspConfig;
  
  /**
   * Diretório de build
   */
  buildDir: string;
}
```

## 7. Eventos e Hooks

### 7.1. Eventos do Ciclo de Vida

```typescript
type HookEvent = 
  | 'beforeBuild'
  | 'afterBuild'
  | 'beforeDeploy'
  | 'afterDeploy'
  | 'beforeInit'
  | 'afterInit'
  | 'beforeClean'
  | 'afterClean';
```

### 7.2. Implementação de Hooks

```typescript
import { Plugin, PluginContext, BuildContext } from '@gas-builder/core';

class MyPlugin implements Plugin {
  id = 'my-plugin';
  name = 'My Custom Plugin';
  description = 'Adds custom functionality';
  version = '1.0.0';
  
  async initialize(context: PluginContext): Promise<void> {
    context.logger.info('Inicializando My Plugin');
  }
  
  async onBeforeBuild(context: BuildContext): Promise<void> {
    context.logger.info(`Preparando build para ${context.project.name}`);
    
    // Adicionar arquivo de configuração personalizado
    await context.fs.writeFile(
      `${context.project.rootDir}/custom-config.json`,
      JSON.stringify({ generated: new Date().toISOString() })
    );
  }
  
  async onAfterBuild(context: BuildContext): Promise<void> {
    context.logger.info(`Build concluído para ${context.project.name}`);
    
    // Fazer algo com os arquivos compilados
    const files = await listFiles(context.outDir);
    context.logger.debug(`Arquivos gerados: ${files.length}`);
  }
}
```

## 8. Extensão da API

### 8.1. Criando um Plugin Personalizado

```typescript
import { Plugin, PluginContext, BuildContext } from '@gas-builder/core';

export class CustomWorkflowPlugin implements Plugin {
  id = 'custom-workflow';
  name = 'Custom Workflow Plugin';
  description = 'Implements custom workflow steps';
  version = '1.0.0';
  
  async initialize(context: PluginContext): Promise<void> {
    // Inicialização
  }
  
  async onBeforeBuild(context: BuildContext): Promise<void> {
    // Implementar lógica pré-build
  }
  
  async onAfterBuild(context: BuildContext): Promise<void> {
    // Implementar lógica pós-build
  }
  
  // Comandos personalizados
  commands = {
    'run-workflow': async (args: any, cliContext: any) => {
      // Implementar comando personalizado
    }
  };
}
```

### 8.2. Criando um Template Personalizado

```typescript
import { Template, TemplateVariable, TemplateOptions, ValidationResult } from '@gas-builder/core';
import * as fs from 'fs-extra';
import * as path from 'path';

export class CustomTemplate implements Template {
  id = 'custom-template';
  name = 'Custom Template';
  description = 'Template personalizado para casos específicos';
  version = '1.0.0';
  
  getVariables(): TemplateVariable[] {
    return [
      {
        name: 'projectName',
        description: 'Nome do projeto',
        type: 'string',
        required: true
      },
      {
        name: 'author',
        description: 'Autor do projeto',
        type: 'string',
        required: false,
        default: 'Unknown'
      },
      {
        name: 'includeTests',
        description: 'Incluir testes',
        type: 'boolean',
        default: true
      }
    ];
  }
  
  validateOptions(options: TemplateOptions): ValidationResult {
    // Validação personalizada
    const errors = [];
    
    if (!options.projectName || options.projectName.length < 3) {
      errors.push('Project name must be at least 3 characters');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  async generate(destination: string, options: TemplateOptions): Promise<void> {
    // Copiar arquivos base
    const templateDir = path.resolve(__dirname, '../templates/custom');
    await fs.copy(templateDir, destination);
    
    // Processar arquivos template
    await this.processTemplateFiles(destination, options);
    
    // Condicional: incluir testes?
    if (!options.includeTests) {
      await fs.remove(path.join(destination, 'tests'));
    }
  }
  
  private async processTemplateFiles(dir: string, options: TemplateOptions): Promise<void> {
    // Processa arquivos .template, substituindo variáveis
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        await this.processTemplateFiles(filePath, options);
      } else if (file.endsWith('.template')) {
        let content = await fs.readFile(filePath, 'utf8');
        
        // Substituir variáveis
        Object.entries(options).forEach(([key, value]) => {
          content = content.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), String(value));
        });
        
        const newFilePath = filePath.replace('.template', '');
        await fs.writeFile(newFilePath, content);
        await fs.remove(filePath);
      }
    }
  }
}
```

## 9. API de Testes

### 9.1. TestRunner

Interface para execução de testes.

```typescript
interface TestRunner {
  /**
   * Executa testes para um projeto
   * @param projectId ID do projeto
   * @param options Opções de teste
   */
  runTests(projectId: string, options?: TestOptions): Promise<TestResult>;
  
  /**
   * Verifica cobertura de código
   * @param projectId ID do projeto
   */
  checkCoverage(projectId: string): Promise<CoverageResult>;
}

interface TestOptions {
  files?: string[];
  watch?: boolean;
  coverage?: boolean;
  verbose?: boolean;
}

interface TestResult {
  success: boolean;
  stats: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  duration: number;
  coverage?: CoverageResult;
}

interface CoverageResult {
  lines: CoverageData;
  statements: CoverageData;
  functions: CoverageData;
  branches: CoverageData;
}

interface CoverageData {
  total: number;
  covered: number;
  percentage: number;
}
```

### 9.2. MockFactory

Interface para criação de mocks para Google APIs.

```typescript
interface MockFactory {
  /**
   * Cria mocks para SpreadsheetApp
   */
  createSpreadsheetAppMock(): any;
  
  /**
   * Cria mocks para DriveApp
   */
  createDriveAppMock(): any;
  
  /**
   * Cria mocks para DocumentApp
   */
  createDocumentAppMock(): any;
  
  /**
   * Cria mocks para FormApp
   */
  createFormAppMock(): any;
  
  /**
   * Cria mocks para UrlFetchApp
   */
  createUrlFetchAppMock(): any;
  
  /**
   * Registra todos os mocks no objeto global
   */
  registerAllMocks(): void;
}
```

## 10. Próximos Passos

Para trabalhar efetivamente com as APIs do GAS Builder:

1. Consulte a [implementação do Core](./32-impl-core-sistema.md) para detalhes de implementação
2. Veja a [implementação de Plugins e Templates](./34-impl-plugins-templates.md) para padrões de extensão
3. Explore a [referência de configuração YAML](./20-ref-configuracao-yaml.md) para opções disponíveis
4. Leia a [arquitetura técnica](./22-ref-arquitetura-tecnica.md) para entender o design

## Referências

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Google Apps Script Reference](https://developers.google.com/apps-script/reference/)
- [Rollup Plugin API](https://rollupjs.org/guide/en/#plugin-development)
- [Clasp API](https://github.com/google/clasp)
