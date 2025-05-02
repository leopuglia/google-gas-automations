# Modularização do Código

## Visão Geral

O sistema de build e deploy foi refatorado para seguir uma abordagem modular, onde cada módulo tem uma responsabilidade específica. Isso torna o código mais organizado, manutenível e testável.

## Estrutura de Módulos

### 1. `config-helper.js`

Responsável por carregar e processar a configuração YAML.

```javascript
// Importação e exportação
import * as configHelper from './config-helper.js';

// Funções principais
const config = configHelper.loadConfig(configFile);
const paths = configHelper.initializePaths(config);
```

**Principais funcionalidades:**

- Carregamento do arquivo YAML de configuração
- Inicialização dos caminhos de diretórios
- Validação da configuração

### 2. `filesystem-helper.js`

Gerencia operações de sistema de arquivos, como limpeza de diretórios e verificação de build.

```javascript
// Importação e exportação
import * as filesystemHelper from './filesystem-helper.js';

// Funções principais
filesystemHelper.cleanDirectories(paths.build, paths.dist);
filesystemHelper.ensureBuildBeforeDeploy(config, paths, projectKey);
```

**Principais funcionalidades:**

- Limpeza de diretórios (build e dist)
- Verificação e execução automática do build
- Manipulação de arquivos e diretórios

### 3. `template-helper.js`

Processa templates Handlebars e gera arquivos de configuração.

```javascript
// Importação e exportação
import * as templateHelper from './template-helper.js';

// Funções principais
const result = templateHelper.processProjectTemplates(config, projectKey, environment, filters);
```

**Principais funcionalidades:**

- Processamento de templates Handlebars
- Geração de arquivos de configuração (.clasp.json, .claspignore, etc.)
- Resolução de variáveis de substituição

### 4. `clasp-helper.js`

Gerencia interações com a ferramenta Clasp para deploy no Google Apps Script.

```javascript
// Importação e exportação
import * as claspHelper from './clasp-helper.js';

// Funções principais
claspHelper.pushProject(outputDir);
```

**Principais funcionalidades:**

- Execução de comandos Clasp (push, etc.)
- Gerenciamento de erros de deploy

## Benefícios da Modularização

### 1. Separação de Responsabilidades

Cada módulo tem uma responsabilidade clara e bem definida, seguindo o princípio de responsabilidade única (SRP).

### 2. Testabilidade

A modularização facilita a criação de testes unitários para cada componente do sistema. Os testes podem ser encontrados na pasta `scripts/tests/`.

### 3. Manutenibilidade

Código mais organizado e modular é mais fácil de manter e estender. Novas funcionalidades podem ser adicionadas com impacto mínimo no código existente.

### 4. Reusabilidade

Os módulos podem ser reutilizados em diferentes partes do sistema ou até mesmo em outros projetos.

## Fluxo de Execução

1. `deploy.js` carrega a configuração usando `config-helper.js`
2. Verifica e limpa diretórios usando `filesystem-helper.js`
3. Verifica e executa o build se necessário usando `filesystem-helper.js`
4. Processa templates e gera arquivos usando `template-helper.js`
5. Executa push para o Google Apps Script usando `clasp-helper.js` (se solicitado)

## Exemplo de Uso

```javascript
// Importar módulos
import * as configHelper from './config-helper.js';
import * as filesystemHelper from './filesystem-helper.js';
import * as templateHelper from './template-helper.js';
import * as claspHelper from './clasp-helper.js';

// Carregar configuração
const config = configHelper.loadConfig(configFile);
const paths = configHelper.initializePaths(config);

// Limpar diretórios
filesystemHelper.cleanDirectories(paths.build, paths.dist);

// Verificar e executar build
const buildSuccess = filesystemHelper.ensureBuildBeforeDeploy(config, paths, projectKey);

// Processar templates
const result = templateHelper.processProjectTemplates(config, projectKey, environment, filters);

// Executar push
if (doPush && result && result.outputDir) {
  claspHelper.pushProject(result.outputDir);
}
```

## Testes

Os testes para cada módulo estão localizados na pasta `scripts/tests/`. Para executar os testes:

```bash
pnpm run test
```

## Conclusão

A modularização do código torna o sistema mais robusto, manutenível e extensível. Cada módulo tem uma responsabilidade clara e bem definida, facilitando a compreensão e manutenção do código.
