# Configuração YAML: GAS Builder

Este documento detalha a estrutura e as opções de configuração do arquivo YAML utilizado pelo GAS Builder para gerenciar projetos Google Apps Script.

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
    output:
      format: esm
      inlineDynamicImports: false
    plugins:
      - name: nodeResolve
        config: {}
      - name: typescript
        config:
          tsconfig: './tsconfig.json'
      - name: terser
        config:
          compress: true
```

### 2.4. Estrutura de Projetos

```yaml
defaults:
  projects-structure:
    example:
      keys: []
    advanced:
      nested:
        - key: year
        - key: category
```

## 3. Definição de Projetos

Cada projeto é definido com suas próprias configurações:

```yaml
projects:
  example:
    src: example
    output: example
    outputTemplate: example
    nameTemplate: 'Example {{env}}'
    # Outras configurações...
```

### 3.1. Configurações Básicas

| Propriedade | Descrição | Exemplo |
|-------------|-----------|---------|
| `src` | Diretório fonte do projeto | `example` |
| `output` | Nome base de saída | `example` |
| `outputTemplate` | Template para o diretório de saída | `{{year}}-{{output}}` |
| `nameTemplate` | Template para o nome do projeto | `{{output}} {{env}}` |

### 3.2. Estrutura Aninhada

Para projetos com estrutura aninhada (como ano/categoria):

```yaml
projects:
  advanced:
    nested:
      - key: year
      - key: category
```

### 3.3. Mapeamento de Chaves

Para substituir valores de chaves por nomes amigáveis:

```yaml
projects:
  advanced:
    mapping:
      keys-template:
        - key: category
          nameTemplate:
            substitutions:
              - reports: Reports
              - analytics: Analytics
```

### 3.4. Dependências

```yaml
projects:
  advanced:
    dependencies:
      - userSymbol: Drive
        version: v3
        serviceId: drive
```

### 3.5. Macros

```yaml
projects:
  advanced:
    sheetsMacros:
      - menuName: Update Reports
        functionName: updateReports
```

### 3.6. Configurações do Rollup

```yaml
projects:
  advanced:
    rollup:
      main: main.ts
      name: Advanced
      common-libs:
        - name: utils
          path: ./src/commons/utils.ts
      project-libs:
        - name: reports
          path: ./src/advanced/libs/reports.ts
      externals:
        - luxon
```

### 3.7. Ambientes

```yaml
projects:
  advanced:
    environments:
      dev:
        2024:
          reports:
            templates:
              .clasp-template.json:
                destination-file: .clasp.json
                scriptId: YOUR_DEV_REPORTS_SCRIPT_ID
          analytics:
            templates:
              .clasp-template.json:
                destination-file: .clasp.json
                scriptId: YOUR_DEV_ANALYTICS_SCRIPT_ID
      prod:
        2024:
          reports:
            templates:
              .clasp-template.json:
                destination-file: .clasp.json
                scriptId: YOUR_PROD_REPORTS_SCRIPT_ID
```

## 4. Exemplo Completo

```yaml
# Configuração de exemplo para o GAS Builder
# Schema: ./config.schema.json

defaults:
  # Templates padrão para todos os projetos
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
  
  # Configurações de caminhos
  paths:
    src: ./src
    build: ./build
    dist: ./dist
    templates: ./templates
    scripts: ./scripts
  
  # Configurações para o Rollup
  rollup:
    # Configurações de saída padrão
    output:
      format: esm
      inlineDynamicImports: false
    # Plugins padrão
    plugins:
      - name: nodeResolve
        config: {}
      - name: typescript
        config:
          tsconfig: './tsconfig.json'
      - name: terser
        config:
          compress: true
  
  # Estrutura de projetos
  projects-structure:
    example:
      keys: []
    advanced:
      nested:
        - key: year
        - key: category

# Configurações dos projetos
projects:
  # Projeto de exemplo simples
  example:
    src: example
    output: example
    outputTemplate: example
    nameTemplate: 'Example {{env}}'
    dependencies: []
    sheetsMacros: []
    # Configurações específicas para o Rollup
    rollup:
      main: main.ts
      name: Example
    # Ambientes dentro do projeto
    environments:
      dev:
        templates:
          .clasp-template.json:
            destination-file: .clasp.json
            scriptId: YOUR_DEV_SCRIPT_ID
      prod:
        templates:
          .clasp-template.json:
            destination-file: .clasp.json
            scriptId: YOUR_PROD_SCRIPT_ID
  
  # Projeto avançado com estrutura aninhada
  advanced:
    src: advanced
    output: advanced
    outputTemplate: '{{year}}-{{category}}-{{output}}'
    nameTemplate: '{{output}} {{year}} {{category}} {{env}}'
    nested:
      - key: year
      - key: category
    mapping:
      keys-template:
        - key: category
          nameTemplate:
            substitutions:
              - reports: Reports
              - analytics: Analytics
    dependencies:
      - userSymbol: Drive
        version: v3
        serviceId: drive
    sheetsMacros:
      - menuName: Update Reports
        functionName: updateReports
    rollup:
      main: main.ts
      name: Advanced
      common-libs:
        - name: utils
          path: ./src/commons/utils.ts
    environments:
      dev:
        2024:
          reports:
            templates:
              .clasp-template.json:
                destination-file: .clasp.json
                scriptId: YOUR_DEV_REPORTS_SCRIPT_ID
          analytics:
            templates:
              .clasp-template.json:
                destination-file: .clasp.json
                scriptId: YOUR_DEV_ANALYTICS_SCRIPT_ID
      prod:
        2024:
          reports:
            templates:
              .clasp-template.json:
                destination-file: .clasp.json
                scriptId: YOUR_PROD_REPORTS_SCRIPT_ID
          analytics:
            templates:
              .clasp-template.json:
                destination-file: .clasp.json
                scriptId: YOUR_PROD_ANALYTICS_SCRIPT_ID
```

## 5. Variáveis de Template

O sistema de templates suporta as seguintes variáveis:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `{{env}}` | Ambiente atual | `dev`, `prod` |
| `{{output}}` | Nome base de saída | `example` |
| `{{project}}` | Nome do projeto | `advanced` |
| `{{year}}` | Valor da chave `year` | `2024` |
| `{{category}}` | Valor da chave `category` | `reports` |

Você pode usar essas variáveis nos templates de saída e nome:

```yaml
outputTemplate: '{{year}}-{{category}}-{{output}}'
nameTemplate: '{{output}} {{year}} {{category}} {{env}}'
```

## 6. Boas Práticas

1. **Organize projetos por funcionalidade**
   - Agrupe projetos relacionados com estrutura aninhada
   - Use nomes descritivos para projetos e chaves

2. **Defina valores padrão em `defaults`**
   - Evite repetição de configurações comuns
   - Sobrescreva apenas o necessário em cada projeto

3. **Use templates para nomes consistentes**
   - Crie templates descritivos para diretórios e nomes
   - Aproveite o sistema de substituição para nomes amigáveis

4. **Separe ambientes claramente**
   - Mantenha configurações de desenvolvimento e produção separadas
   - Use IDs de script diferentes para cada ambiente

5. **Documente sua configuração**
   - Adicione comentários explicativos no YAML
   - Documente a estrutura de projetos complexos
