# Configuração YAML: GAS Builder

> Última atualização: 06/05/2025

## Resumo

Este documento detalha a estrutura e as opções de configuração do arquivo YAML utilizado pelo GAS Builder para gerenciar projetos Google Apps Script. A configuração YAML é o coração do sistema, permitindo personalizar todos os aspectos do processo de build e deploy.

## Pré-requisitos

- Conhecimento básico de YAML
- Familiaridade com a [estrutura do projeto](./32-impl-core-sistema.md)
- Entendimento dos [conceitos básicos](./00-introducao-gas-builder.md) do GAS Builder

## 1. Estrutura Geral

O arquivo de configuração YAML é dividido em duas seções principais:

1. `defaults`: Configurações globais aplicadas a todos os projetos
2. `projects`: Definições específicas de cada projeto

```yaml
defaults:
  # Configurações globais
  
projects:
  # Definições de projetos
```

## 2. Configurações Padrão (defaults)

### 2.1. Templates Padrão

```yaml
defaults:
  templates:
    .clasp-template.json:
      destination-file: .clasp.json
    .claspignore-template:
      destination-file: .claspignore
    appsscript-template.json:
      destination-file: appsscript.json
      keys:
        - timeZone: America/Sao_Paulo
        - runtimeVersion: V8
```

### 2.2. Caminhos de Diretórios

```yaml
defaults:
  paths:
    src: ./src
    build: ./build
    dist: ./dist
    templates: ./templates
    scripts: ./scripts
```

### 2.3. Configurações do Rollup

```yaml
defaults:
  rollup:
    plugins:
      - typescript
      - commonjs
      - resolve
    minify: false
    sourcemap: false
```

### 2.4. Configurações de Logging

```yaml
defaults:
  logging:
    level: INFO  # NONE, ERROR, WARN, INFO, DEBUG
    colorize: true
```

### 2.5. Configurações de Deploy

```yaml
defaults:
  deploy:
    default-environment: dev
    push:
      force: false
      watch: false
```

## 3. Configurações de Projetos

### 3.1. Estrutura Básica de Projeto

```yaml
projects:
  nome-do-projeto:
    src: src/nome-do-projeto
    output: build/nome-do-projeto
    entryFiles:
      - index.ts
    environments:
      dev:
        scriptId: SCRIPT_ID_DEV
      prod:
        scriptId: SCRIPT_ID_PROD
```

### 3.2. Opções Avançadas de Projeto

```yaml
projects:
  nome-do-projeto:
    src: src/nome-do-projeto
    output: build/nome-do-projeto
    entryFiles:
      - index.ts
      - functions.ts
    externals:
      - lodash
      - dayjs
    rollup:
      minify: true
      sourcemap: true
      plugins:
        - typescript
        - commonjs
        - resolve
        - terser
    templates:
      custom-template.json:
        destination-file: custom.json
        keys:
          - customKey: customValue
    environments:
      dev:
        scriptId: SCRIPT_ID_DEV
        variables:
          API_URL: https://api-dev.example.com
      stage:
        scriptId: SCRIPT_ID_STAGE
        variables:
          API_URL: https://api-stage.example.com
      prod:
        scriptId: SCRIPT_ID_PROD
        variables:
          API_URL: https://api.example.com
```

## 4. Referência Completa de Opções

### 4.1. Seção defaults

| Opção | Descrição | Tipo | Valor Padrão |
|-------|-----------|------|--------------|
| `defaults.templates` | Definições de templates | Objeto | `{}` |
| `defaults.paths` | Caminhos de diretórios | Objeto | Ver 2.2 |
| `defaults.rollup` | Configurações do Rollup | Objeto | Ver 2.3 |
| `defaults.logging` | Configurações de logging | Objeto | Ver 2.4 |
| `defaults.deploy` | Configurações de deploy | Objeto | Ver 2.5 |

### 4.2. Seção projects

| Opção | Descrição | Tipo | Obrigatório | Valor Padrão |
|-------|-----------|------|-------------|--------------|
| `projects.<name>.src` | Diretório de código-fonte | String | Sim | - |
| `projects.<name>.output` | Diretório de saída | String | Não | Valor de `src` |
| `projects.<name>.entryFiles` | Arquivos de entrada | Array | Não | `["index.ts"]` |
| `projects.<name>.externals` | Dependências externas | Array | Não | `[]` |
| `projects.<name>.rollup` | Configurações do Rollup | Objeto | Não | Herda de `defaults.rollup` |
| `projects.<name>.templates` | Templates específicos | Objeto | Não | Herda de `defaults.templates` |
| `projects.<name>.environments` | Ambientes de deploy | Objeto | Sim | - |

### 4.3. Configurações de Ambiente

| Opção | Descrição | Tipo | Obrigatório | Valor Padrão |
|-------|-----------|------|-------------|--------------|
| `projects.<name>.environments.<env>.scriptId` | ID do script no Google | String | Sim | - |
| `projects.<name>.environments.<env>.variables` | Variáveis de ambiente | Objeto | Não | `{}` |
| `projects.<name>.environments.<env>.deploy` | Configurações de deploy | Objeto | Não | Herda de `defaults.deploy` |

## 5. Exemplos Práticos

### 5.1. Configuração Mínima

```yaml
projects:
  meu-projeto:
    src: src/meu-projeto
    environments:
      dev:
        scriptId: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

### 5.2. Projeto com Múltiplos Ambientes

```yaml
defaults:
  paths:
    src: ./src
    build: ./build
  logging:
    level: INFO

projects:
  meu-projeto:
    src: src/meu-projeto
    output: build/meu-projeto
    entryFiles:
      - index.ts
    environments:
      dev:
        scriptId: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ_DEV
        variables:
          IS_DEVELOPMENT: true
          API_KEY: dev_key_123
      prod:
        scriptId: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ_PROD
        variables:
          IS_DEVELOPMENT: false
          API_KEY: prod_key_456
```

### 5.3. Configuração Avançada com Múltiplos Projetos

```yaml
defaults:
  templates:
    .clasp-template.json:
      destination-file: .clasp.json
    .claspignore-template:
      destination-file: .claspignore
    appsscript-template.json:
      destination-file: appsscript.json
      keys:
        - timeZone: America/Sao_Paulo
        - runtimeVersion: V8
  paths:
    src: ./src
    build: ./build
    templates: ./templates
  rollup:
    plugins:
      - typescript
      - commonjs
      - resolve
    minify: false
  logging:
    level: INFO
    colorize: true

projects:
  projeto-planilhas:
    src: src/projeto-planilhas
    output: build/projeto-planilhas
    entryFiles:
      - index.ts
      - funcoes-planilha.ts
    rollup:
      minify: true
    environments:
      dev:
        scriptId: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ_PLANILHAS_DEV
      prod:
        scriptId: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ_PLANILHAS_PROD
  
  projeto-docs:
    src: src/projeto-docs
    output: build/projeto-docs
    entryFiles:
      - index.ts
    environments:
      dev:
        scriptId: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ_DOCS_DEV
      prod:
        scriptId: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ_DOCS_PROD
```

## 6. Validação de Configuração

O GAS Builder valida automaticamente o arquivo de configuração YAML contra um schema JSON. Em caso de erros, mensagens detalhadas são exibidas para ajudar na correção:

```bash
[ERROR] Erros de validação na configuração:
- /projects/meu-projeto: não possui a propriedade obrigatória 'environments'
- /projects/meu-projeto/src: não é uma string
```

## Próximos Passos

- Consulte [11-guia-sistema-build.md](./11-guia-sistema-build.md) para instruções de uso prático
- Explore [32-impl-core-sistema.md](./32-impl-core-sistema.md) para entender a implementação
- Veja [34-impl-plugins-templates.md](./34-impl-plugins-templates.md) para detalhes sobre templates

## Referências

- [YAML Specification](https://yaml.org/spec/1.2.2/)
- [JSON Schema](https://json-schema.org/)
- [10-guia-inicio-rapido.md](./10-guia-inicio-rapido.md): Primeiros passos com o GAS Builder
