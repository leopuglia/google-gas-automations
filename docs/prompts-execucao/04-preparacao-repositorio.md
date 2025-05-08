# Prompt Final: Preparação de Repositório e Estrutura

## Cenário

Você está iniciando a criação de uma biblioteca de build genérica para Google Apps Script chamada `google-gas-builder`. O primeiro passo é preparar o repositório e a estrutura de pastas para comportar o código que será migrado do projeto atual. É fundamental estabelecer uma estrutura organizada que siga as melhores práticas de desenvolvimento Node.js com JavaScript e facilite a manutenção a longo prazo.

## Seu Papel

Você é um Arquiteto de DevOps especializado em infraestrutura de projetos Node.js com experiência em ferramentas de build JavaScript, automação e Google Apps Script. Sua tarefa é configurar o repositório inicial, definir estrutura de diretórios, configurar ferramentas de desenvolvimento e preparar arquivos de configuração essenciais.

## Instruções Detalhadas

1. **Inicialização do Repositório**
   - Crie um novo diretório chamado `google-gas-builder`
   - Inicialize um repositório Git
   - Configure o `.gitignore` para excluir:
     - Diretórios: `node_modules/`, `build/`, `dist/`, `coverage/`, `.history/`, `.local/`, `temp/`, `tmp/`
     - Arquivos: `.DS_Store`, `*.log`, `npm-debug.log*`, `.env`, `.env.*`, `*.tgz`, `*.zip`
     - Arquivos específicos do Google Apps Script: `.clasp.json.bak`
   - Adicione um arquivo `LICENSE` (MIT recomendado)
   - Crie um `README.md` inicial com descrição do projeto

2. **Estrutura de Diretórios**
   - Crie a seguinte estrutura de diretórios:

     ```bash
     google-gas-builder/
     ├── .github/                     # Configurações GitHub e CI
     │   └── workflows/               # GitHub Actions
     ├── .vscode/                     # Configurações VS Code
     │   ├── extensions.json          # Extensões recomendadas
     │   ├── launch.json              # Configurações de debug
     │   └── settings.json            # Configurações do editor
     ├── docs/                        # Documentação
     │   ├── examples/                # Exemplos de uso
     │   ├── api/                     # Documentação da API
     │   └── assets/                  # Imagens e recursos
     ├── examples/                    # Projetos de exemplo
     │   ├── basic/                   # Exemplo básico
     │   └── advanced/                # Exemplo avançado
     ├── src/                         # Código-fonte
     │   ├── cli/                     # Interface de linha de comando
     │   ├── core/                    # Lógica de negócio
     │   ├── rollup/                  # Configuração do Rollup
     │   └── utils/                   # Utilitários
     ├── templates/                   # Templates padrão
     │   ├── .clasp-template.json    
     │   ├── .claspignore-template
     │   └── appsscript-template.json
     ├── tests/                       # Testes
     │   ├── unit/                    # Testes unitários
     │   ├── integration/             # Testes de integração
     │   └── mocks/                   # Mocks para testes
     └── types/                       # Definições de tipo
         └── global.d.ts             # Tipos globais
     ```

3. **Configuração do Projeto**
   - Inicialize o projeto com `pnpm`:

     ```bash
     pnpm init -y
     ```

   - Modifique o `package.json` para incluir:
     - Nome: `@google-apps/gas-builder`
     - Versão: `0.1.0`
     - Descrição: `A flexible build system for Google Apps Script projects`
     - Main: `dist/index.js`
     - Types: `dist/index.d.ts`
     - Bin: `{ "gas-builder": "dist/cli/index.js" }`
     - Scripts básicos (build, test, lint, etc.)
     - Engines: `{ "node": ">=16.0.0" }`
     - Keywords: `["google-apps-script", "build", "clasp", "typescript"]`

4. **Configuração de TypeScript**
   - Crie um arquivo `tsconfig.json` com configurações otimizadas:

     ```json
     {
       "compilerOptions": {
         "target": "ES2019",
         "module": "ESNext",
         "moduleResolution": "node",
         "esModuleInterop": true,
         "declaration": true,
         "outDir": "./dist",
         "rootDir": "./src",
         "strict": true,
         "noImplicitAny": true,
         "strictNullChecks": true,
         "strictFunctionTypes": true,
         "strictBindCallApply": true,
         "strictPropertyInitialization": true,
         "noImplicitThis": true,
         "forceConsistentCasingInFileNames": true,
         "skipLibCheck": true,
         "resolveJsonModule": true
       },
       "include": ["src/**/*"],
       "exclude": ["node_modules", "dist", "tests", "examples"]
     }
     ```

5. **Configuração de Linting e Formatação**
   - Configure ESLint com TypeScript:

     ```json
     // .eslintrc.json
     {
       "root": true,
       "parser": "@typescript-eslint/parser",
       "plugins": ["@typescript-eslint"],
       "extends": [
         "eslint:recommended",
         "plugin:@typescript-eslint/recommended",
         "prettier"
       ],
       "env": {
         "node": true,
         "es2020": true
       },
       "rules": {
         "@typescript-eslint/explicit-module-boundary-types": "warn",
         "@typescript-eslint/no-explicit-any": "warn",
         "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
       }
     }
     ```

   - Configure Prettier:

     ```json
     // .prettierrc
     {
       "singleQuote": true,
       "trailingComma": "es5",
       "tabWidth": 2,
       "semi": true,
       "printWidth": 100
     }
     ```

6. **Configuração de Testes**
   - Configure Jest com TypeScript:

     ```javascript
     // jest.config.js
     /** @type {import('jest').Config} */
     export default {
       preset: 'ts-jest',
       testEnvironment: 'node',
       roots: ['<rootDir>/tests'],
       transform: {
         '^.+\\.tsx?$': ['ts-jest', {
           tsconfig: 'tsconfig.json'
         }]
       },
       testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
       moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
       setupFiles: ['<rootDir>/tests/mocks/gas.mock.js'],
       verbose: true,
       testPathIgnorePatterns: ['/node_modules/'],
       collectCoverage: true,
       collectCoverageFrom: ['<rootDir>/src/**/*.ts']
     };
     ```

   - Crie um arquivo mock básico para o Google Apps Script:

     ```javascript
     // tests/mocks/gas.mock.js
     // Mock básico das APIs do Google Apps Script
     global.SpreadsheetApp = {
       getActiveSpreadsheet: jest.fn(),
       // adicione outros métodos conforme necessário
     };
     
     global.DriveApp = {
       getFileById: jest.fn(),
       // adicione outros métodos conforme necessário
     };
     
     // ... outros namespaces do GAS
     ```

7. **Migração de Arquivos**
   - Identifique os arquivos a serem migrados do projeto atual:
     - Scripts de build e deploy em `scripts/build-system/`
     - Configuração do Rollup em `rollup.config.js`
     - Templates em `templates/`
     - Esquema de configuração em `schema/`
   - Prepare um plano de migração com etapas específicas

8. **Arquivos Essenciais**
   - Crie um arquivo `.npmignore` para controlar o que será publicado:

     ```ini
     # Arquivos de desenvolvimento
     src/
     tests/
     examples/
     docs/
     .github/
     .vscode/
     
     # Configuração
     .eslintrc.json
     .prettierrc
     tsconfig.json
     jest.config.js
     
     # Outros
     *.log
     coverage/
     ```

   - Adicione um arquivo `CONTRIBUTING.md` com diretrizes para contribuição

## Fontes de Referência

- [npm Package.json Guidelines](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)
- [TypeScript Project Configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring/)
- [GitHub: Setting up a Node.js project for success](https://github.blog/2021-04-02-setting-up-a-node-js-project-for-success/)
- [Google Apps Script Development Best Practices](https://developers.google.com/apps-script/guides/support/best-practices)

## Formato de Saída

Forneça um roteiro detalhado para a preparação do repositório, incluindo:

1. **Scripts de Terminal**
   - Comandos para inicializar o repositório e estrutura
   - Comandos para instalar dependências essenciais
   - Comandos para configurar ferramentas de desenvolvimento

2. **Arquivos de Configuração**
   - Conteúdo completo para cada arquivo de configuração
   - Explicação do propósito de cada configuração

3. **Plano de Migração**
   - Lista de arquivos a serem migrados
   - Destino na nova estrutura
   - Modificações necessárias durante a migração

4. **Documentação Inicial**
   - Estrutura proposta para o README.md
   - Instruções básicas de uso

**Atenção**: Todo o código deve seguir as melhores práticas de ECMAScript Modules (ESM) e ser compatível com Node.js 16+. Use sempre caminhos de importação explícitos e mantenha a modularidade.
