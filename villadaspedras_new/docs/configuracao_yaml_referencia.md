# Referência de Configuração YAML

Este documento descreve todas as opções disponíveis no arquivo de configuração `config.yml` para o sistema de build flexível.

## Estrutura Geral

O arquivo de configuração é dividido em várias seções principais:

```yaml
defaults:        # Configurações padrão globais
  paths:         # Caminhos de diretórios
  ...

projects:        # Definição dos projetos
  projeto1:      # Configuração do projeto 1
    ...
  projeto2:      # Configuração do projeto 2
    ...

environments:    # Configurações específicas de ambiente
  dev:           # Ambiente de desenvolvimento
    ...
  prod:          # Ambiente de produção
    ...
```

## Seção `defaults`

Define configurações padrão que se aplicam a todos os projetos.

### `paths`

Define os caminhos dos diretórios principais:

```yaml
defaults:
  paths:
    src: ./src           # Diretório de código fonte
    build: ./build       # Diretório de build (saída do Rollup)
    dist: ./dist         # Diretório de deploy (saída para o Clasp)
    templates: ./templates # Diretório de templates
    scripts: ./scripts   # Diretório de scripts
```

### `projects-structure`

Define a estrutura de cada projeto, incluindo suas chaves aninhadas. Esta diretiva é usada pelo script de deploy para determinar como processar cada projeto:

```yaml
defaults:
  projects-structure:
    example:             # Projeto sem estrutura aninhada
      keys:              # Sem chaves aninhadas
    salario:             # Projeto com uma chave aninhada (ano)
      nested:
        - key: year      # Primeira chave aninhada (ano)
    consumo:             # Projeto com duas chaves aninhadas (ano e pdv)
      nested:
        - key: year      # Primeira chave aninhada (ano)
        - key: pdv       # Segunda chave aninhada (pdv)
```

Esta configuração é crucial para o funcionamento do sistema de deploy, pois define quais chaves são necessárias para cada projeto e em qual ordem elas devem ser processadas.

### `templates`

Define templates padrão para arquivos de deploy. Esta é a nova estrutura recomendada para definir templates:

```yaml
defaults:
  templates:
    .clasp-template.json:
      destination-file: .clasp.json
    .claspignore-template.json:
      destination-file: .claspignore
    appsscript-template:
      destination-file: appsscript.json
      keys:
        - timeZone: America/Sao_Paulo
        - runtimeVersion: V8
```

### Templates padrão (estrutura antiga)

O sistema também suporta a estrutura antiga de templates para compatibilidade:

```yaml
defaults:
  .clasp-template.json:
    destination-file: .clasp.json
  .claspignore-template.json:
    destination-file: .claspignore
  appsscript-template:
    destination-file: appsscript.json
    keys:
      - timeZone: America/Sao_Paulo
      - runtimeVersion: V8
```

O sistema verifica primeiro a nova estrutura (`defaults.templates`) e, se não encontrar, usa a estrutura antiga como fallback.

## Seção `projects`

Define cada projeto e suas configurações específicas.

### Configuração básica de projeto

```yaml
projects:
  nome-projeto:
    src: diretorio-src         # Diretório fonte dentro de src/
    output: nome-output        # Nome do diretório de saída
    outputTemplate: '{{template}}' # Template para o diretório de saída
    nameTemplate: 'Nome {{template}}' # Template para o nome do projeto
```

### Estrutura aninhada

Define a estrutura aninhada do projeto (ex: ano, pdv):

```yaml
projects:
  nome-projeto:
    # ... outras configurações
    nested:
      - key: year              # Primeira chave aninhada (ex: ano)
      - key: pdv               # Segunda chave aninhada (ex: pdv)
```

### Mapeamento de valores

Define mapeamentos para substituição de valores:

```yaml
projects:
  nome-projeto:
    # ... outras configurações
    mapping:
      keys-template:
        - key: output          # Chave a ser mapeada
          nameTemplate:
            substitutions:
              - consumo: Consumo  # Valor original: valor de substituição
              - salario: Salário
        - key: pdv
          nameTemplate:
            substitutions:
              - 1-cafeteria: 1.Cafeteria
              - 2-saara: 2.Saara
```

### Dependências e macros

Define dependências e macros para o Google Apps Script:

```yaml
projects:
  nome-projeto:
    # ... outras configurações
    dependencies:
      - userSymbol: Drive
        version: v3
        serviceId: drive
    sheetsMacros:
      - menuName: 1. VIRAR MÊS
        functionName: virarMes
      - menuName: 2. VIRAR ANO
        functionName: virarAno
```

## Configurações de ambiente

Existem três formas de definir configurações específicas para cada ambiente (dev/prod):

### 1. Estrutura recomendada: `projects.{project}.environments.{env}`

Esta é a estrutura recomendada, onde os ambientes são definidos dentro de cada projeto:

```yaml
projects:
  nome-projeto:
    # Outras configurações do projeto...
    environments:
      dev:  # Ambiente de desenvolvimento
        templates:
          .clasp-template.json:
            destination-file: .clasp.json
            scriptId: ID_DO_SCRIPT_DEV
        linkedFileId: ID_DO_ARQUIVO_VINCULADO_DEV
      
      prod:  # Ambiente de produção
        templates:
          .clasp-template.json:
            destination-file: .clasp.json
            scriptId: ID_DO_SCRIPT_PROD
        linkedFileId: ID_DO_ARQUIVO_VINCULADO_PROD
```

### 2. Estrutura alternativa: `environments.{env}.{project}`

Esta estrutura agrupa configurações por ambiente primeiro, depois por projeto:

```yaml
environments:
  dev:  # Ambiente de desenvolvimento
    nome-projeto:  # Configurações para o projeto sem estrutura aninhada
      # Configurações específicas do projeto para o ambiente dev
      .clasp-template.json:
        destination-file: .clasp.json
        scriptId: ID_DO_SCRIPT_DEV
      linkedFileId: ID_DO_ARQUIVO_VINCULADO_DEV
  
  prod:  # Ambiente de produção
    nome-projeto:  # Configurações para o projeto sem estrutura aninhada
      # Configurações específicas do projeto para o ambiente prod
      .clasp-template.json:
        destination-file: .clasp.json
        scriptId: ID_DO_SCRIPT_PROD
      linkedFileId: ID_DO_ARQUIVO_VINCULADO_PROD
```

### 3. Estrutura antiga: `projects.{project}.{env}`

Esta estrutura (mantida para compatibilidade) define ambientes diretamente no objeto do projeto:

```yaml
projects:
  nome-projeto:
    # Outras configurações do projeto...
    dev:  # Ambiente de desenvolvimento
      .clasp-template.json:
        destination-file: .clasp.json
        scriptId: ID_DO_SCRIPT_DEV
      linkedFileId: ID_DO_ARQUIVO_VINCULADO_DEV
    
    prod:  # Ambiente de produção
      .clasp-template.json:
        destination-file: .clasp.json
        scriptId: ID_DO_SCRIPT_PROD
      linkedFileId: ID_DO_ARQUIVO_VINCULADO_PROD
```

### Ordem de busca de configurações

O sistema busca as configurações de ambiente na seguinte ordem:

1. Primeiro, verifica se há configurações na seção `projects.{project}.environments.{env}` (estrutura recomendada)
2. Se não encontrar, verifica se há configurações na seção `environments.{env}.{project}` (estrutura alternativa)
3. Se não encontrar, verifica se há configurações na seção `projects.{project}.{env}` (estrutura antiga)
4. Se não encontrar nenhuma configuração, usa um objeto vazio e as configurações padrão

### Configuração aninhada por ambiente

Para projetos com estrutura aninhada:

```yaml
environments:
  dev:
    nome-projeto:
      2024:  # Valor para a chave 'year'
        .clasp-template.json:
          destination-file: .clasp.json
          scriptId: ID_DO_SCRIPT_2024_DEV
        
        1-cafeteria:  # Valor para a chave 'pdv' (quando aplicável)
          .clasp-template.json:
            destination-file: .clasp.json
            scriptId: ID_DO_SCRIPT_2024_CAFETERIA_DEV
```

## Exemplo Completo

Aqui está um exemplo simplificado de um arquivo de configuração completo:

```yaml
defaults:
  paths:
    src: ./src
    build: ./build
    dist: ./dist
    templates: ./templates
    scripts: ./scripts
  .clasp-template.json:
    destination-file: .clasp.json
  .claspignore-template.json:
    destination-file: .claspignore
  appsscript-template:
    destination-file: appsscript.json
    keys:
      - timeZone: America/Sao_Paulo
      - runtimeVersion: V8

projects:
  salario:
    src: planilha-salario
    output: salario
    outputTemplate: '{{year}}-{{output}}'
    nameTemplate: 'Macros {{output}} {{year}} {{env}}'
    nested:
      - key: year
    mapping:
      keys-template:
        - key: output
          nameTemplate:
            substitutions:
              - salario: Salário
    dependencies:
      - userSymbol: Drive
        version: v3
        serviceId: drive
    sheetsMacros:
      - menuName: 1. VIRAR MÊS SALARIO
        functionName: virarMesSalario
      - menuName: 2. VIRAR ANO SALARIO
        functionName: virarAnoSalario

  consumo:
    src: planilha-consumo
    output: consumo
    outputTemplate: '{{year}}-{{pdv}}-{{output}}'
    nameTemplate: 'Macros {{output}} {{pdv}} {{year}} {{env}}'
    nested:
      - key: year
      - key: pdv
    mapping:
      keys-template:
        - key: output
          nameTemplate:
            substitutions:
              - consumo: Consumo
        - key: pdv
          nameTemplate:
            substitutions:
              - 1-cafeteria: 1.Cafeteria
              - 2-saara: 2.Saara
              - 3-castelo: 3.Castelo
              - 4-stones: 4.Stones
    dependencies:
      - userSymbol: Drive
        version: v3
        serviceId: drive
    sheetsMacros:
      - menuName: 1. VIRAR MÊS CONSUMO
        functionName: virarMesConsumo
      - menuName: 2. VIRAR ANO CONSUMO
        functionName: virarAnoConsumo

environments:
  dev:
    salario:
      2024:
        .clasp-template.json:
          destination-file: .clasp.json
          scriptId: 1ni6ZUXl1lqfBRik93jEyMI_K7-nWJBGwHPIVAb5Fw-IHZTF1UPfEiBIL
        linkedFileId: 1n1ypLBl5fPO4eClA9uIWUvlwwYTuu2lHAwQBmaFdSkI
    
    consumo:
      2024:
        1-cafeteria:
          .clasp-template.json:
            destination-file: .clasp.json
            scriptId: 1piXZFH-QithkQm-Q5_S2HVsAZAlURV9iPKvgA_h4icEnNL9cJ0WgtMMJ
          linkedFileId: 1xE0OSx7V6fc5SoDM6L6kJTuj-F3705tkc6XQe-lJUns
```

## Uso no Sistema de Build

O sistema de build usa este arquivo de configuração para:

1. Determinar quais projetos processar
2. Gerar diretórios de saída com base nos templates
3. Criar arquivos de configuração para o Clasp
4. Definir dependências e macros para o Google Apps Script

Para filtrar projetos específicos, use os parâmetros do script de deploy:

```bash
pnpm run deploy:dev -- --project=salario --year=2024
pnpm run deploy:prod -- --project=consumo --pdv=1-cafeteria
```
