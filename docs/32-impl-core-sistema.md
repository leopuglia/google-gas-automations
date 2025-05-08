# Implementação do Core do GAS Builder

> Última atualização: 06/05/2025

## Resumo

Este documento detalha a implementação técnica do core do sistema GAS Builder, incluindo configurações de projeto, estrutura de diretórios e componentes fundamentais. Ele serve como referência para desenvolvedores que precisam entender ou modificar o funcionamento interno do sistema.

## Pré-requisitos

- Conhecimento intermediário de TypeScript e Node.js
- Familiaridade com Rollup e sistemas de build
- Leitura prévia de [02-arquitetura-gas-builder.md](./02-arquitetura-gas-builder.md)

## 1. Configuração do Projeto

### 1.1 package.json

O arquivo package.json define as dependências e scripts do projeto:

```json
{
  "name": "gas-builder",
  "version": "1.0.0",
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

### 1.2 tsconfig.json

A configuração do TypeScript é otimizada para projetos Google Apps Script:

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

### 1.3 .eslintrc.js

Configuração do ESLint para garantir qualidade de código:

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

### 1.4 .prettierrc

Configuração do Prettier para formatação consistente:

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

## 2. Estrutura de Diretórios

A estrutura de diretórios do projeto segue uma organização modular:

```bash
gas-builder/
├── .github/                      # Configurações do GitHub e CI/CD
├── .vscode/                      # Configurações do VS Code
├── docs/                         # Documentação detalhada
├── examples/                     # Exemplos de projetos
├── src/                          # Código-fonte do sistema de build
│   ├── cli/                      # Interface de linha de comando
│   ├── config/                   # Gerenciamento de configuração
│   ├── deploy/                   # Sistema de deploy
│   ├── logger/                   # Sistema de logging
│   ├── rollup/                   # Configuração do Rollup
│   ├── templates/                # Processamento de templates
│   └── utils/                    # Utilitários diversos
├── templates/                    # Templates padrão
├── tests/                        # Testes automatizados
└── [arquivos de configuração]    # Arquivos de configuração na raiz
```

## 3. Componentes Principais

### 3.1 Configuração (config/)

O módulo de configuração é responsável por:

- Carregar o arquivo YAML de configuração
- Validar a configuração contra um schema JSON
- Mesclar configurações padrão com específicas
- Fornecer acesso às configurações em todo o sistema

### 3.2 Templates (templates/)

O sistema de templates permite:

- Processar arquivos de template usando Handlebars
- Substituir variáveis com base na configuração
- Gerar arquivos de configuração dinâmicos
- Personalizar o comportamento por ambiente

### 3.3 Rollup (rollup/)

A integração com Rollup inclui:

- Configuração dinâmica de plugins
- Transformação de código TypeScript
- Resolução de dependências
- Empacotamento de módulos para formato compatível com GAS

### 3.4 Deploy (deploy/)

O sistema de deploy cuida de:

- Invocar o clasp para push do código
- Gerenciar diferentes ambientes
- Aplicar verificações pré-deploy
- Registrar logs de deploy

## 4. Fluxo de Execução

1. Carregamento da configuração (config.yml)
2. Validação da configuração
3. Processamento de templates
4. Build com Rollup
5. Deploy via clasp

## Próximos Passos

- Consulte [33-impl-cli.md](./33-impl-cli.md) para detalhes sobre a implementação da CLI
- Consulte [34-impl-plugins-templates.md](./34-impl-plugins-templates.md) para detalhes sobre plugins e templates
- Explore [20-ref-configuracao-yaml.md](./20-ref-configuracao-yaml.md) para entender as opções de configuração

## Referências

- [01-roadmap-gas-builder.md](./01-roadmap-gas-builder.md): Plano de evolução do projeto
- [02-arquitetura-gas-builder.md](./02-arquitetura-gas-builder.md): Visão geral da arquitetura
- [20-ref-configuracao-yaml.md](./20-ref-configuracao-yaml.md): Referência da configuração YAML
