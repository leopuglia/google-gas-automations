# Sistema de Build Flexível - VilladasPedras

## Visão Geral

O sistema de build flexível do projeto utiliza:

- **Rollup** para empacotamento do código TypeScript
- **Handlebars** para processamento de templates
- **YAML** para configuração centralizada
- **Clasp** para deploy no Google Apps Script

O sistema foi projetado para ser completamente genérico e configurável, permitindo fácil expansão para novos projetos, ambientes, anos e PDVs sem necessidade de modificar o código JavaScript.

## Arquivos Principais

### 1. config.yml

Arquivo central de configuração que define:

- **Estrutura de projetos**: Definição de projetos, ambientes e estruturas aninhadas
- **Templates**: Configuração de templates para arquivos de deploy
- **Caminhos**: Definição de diretórios (src, build, dist, templates, scripts)
- **Mapeamentos**: Substituições para nomes de projetos, PDVs, etc.
- **Script IDs**: IDs dos scripts no Google Apps Script para cada ambiente

Exemplo de estrutura:

```yaml
defaults:
  paths:
    src: ./src
    build: ./build
    dist: ./dist
    templates: ./templates
    scripts: ./scripts

projects:
  salario:
    src: planilha-salario
    output: salario
    outputTemplate: '{{year}}-{{output}}'
    nested:
      - key: year
    # Outras configurações...
  
  consumo:
    src: planilha-consumo
    output: consumo
    outputTemplate: '{{year}}-{{pdv}}-{{output}}'
    nested:
      - key: year
      - key: pdv
    # Outras configurações...
```

### 2. scripts/deploy.js

Script principal de deploy que:

- Processa todos os projetos definidos no YAML ou filtrados por parâmetros
- Suporta múltiplos ambientes (dev/prod)
- Processa estruturas aninhadas (ano, pdv, etc.)
- Usa templates Handlebars para substituição de variáveis
- Gera arquivos de deploy (.clasp.json, appsscript.json, etc.)

### 3. rollup.config.js

Configura o processo de build com:

- Processamento de múltiplos projetos (example, salario, consumo)
- Remoção de imports estáticos
- Configuração do TypeScript

### 4. package.json

Contém scripts simplificados para build e deploy:

```json
{
  "scripts": {
    "build": "rollup -c",
    "clean": "rimraf dist/* build/*",
    "deploy": "node scripts/deploy.js",
    "deploy:dev": "node scripts/deploy.js --env=dev",
    "deploy:prod": "node scripts/deploy.js --env=prod",
    "deploy:push": "node scripts/deploy.js --push",
    "deploy:dev:push": "node scripts/deploy.js --env=dev --push",
    "deploy:prod:push": "node scripts/deploy.js --env=prod --push",
    "deploy:clean": "node scripts/deploy.js --clean",
    "deploy:clean:push": "node scripts/deploy.js --clean --push"
  }
}
```

## Fluxo de Build e Deploy

1. **Build** (`pnpm run build`):
   - Compila o código TypeScript com Rollup
   - Gera bundles para cada projeto na pasta `build/`

2. **Deploy** (`pnpm run deploy:dev`):
   - Carrega configuração do arquivo YAML
   - Inicializa caminhos de diretórios
   - Processa todos os projetos ou filtrados por parâmetros
   - Gera arquivos de deploy na pasta `dist/`

3. **Push** (`pnpm run deploy:dev:push`):
   - Executa o deploy e depois faz push para o Google Apps Script
   - Usa o Clasp para enviar o código para o Google Apps Script

## Parâmetros Disponíveis

O script de deploy aceita vários parâmetros para filtrar e configurar o processo:

- `--env=<dev|prod>`: Ambiente de deploy (desenvolvimento ou produção)
- `--project=<nome>`: Filtrar por projeto específico (ex: salario, consumo)
- `--year=<ano>`: Filtrar por ano específico (ex: 2024)
- `--pdv=<pdv>`: Filtrar por PDV específico (ex: 1-cafeteria)
- `--clean`: Limpar diretórios antes do deploy
- `--push`: Executar push para o Google Apps Script após o deploy
- `--config=<arquivo>`: Usar arquivo de configuração alternativo

## Exemplos de Uso

```bash
# Build do código TypeScript
pnpm run build

# Deploy de todos os projetos no ambiente de desenvolvimento
pnpm run deploy:dev

# Deploy do projeto salário para o ano 2024 no ambiente de produção
pnpm run deploy:prod -- --project=salario --year=2024

# Deploy do projeto consumo para a cafeteria no ambiente de desenvolvimento
pnpm run deploy:dev -- --project=consumo --pdv=1-cafeteria

# Deploy de todos os projetos com limpeza de diretórios e push
pnpm run deploy:clean:push
```

## Estrutura de Diretórios

- **src/**: Código fonte TypeScript
  - **commons/**: Código compartilhado entre projetos
  - **planilha-salario/**: Código específico do projeto salário
  - **planilha-consumo/**: Código específico do projeto consumo
  - **example/**: Projeto de exemplo

- **build/**: Código compilado pelo Rollup
  - **salario/**: Bundle do projeto salário
  - **consumo/**: Bundle do projeto consumo
  - **example/**: Bundle do projeto exemplo

- **dist/**: Arquivos de deploy para o Google Apps Script
  - **dev/**: Ambiente de desenvolvimento
  - **prod/**: Ambiente de produção

- **templates/**: Templates para arquivos de deploy
  - **.clasp-template.json**: Template para .clasp.json
  - **.claspignore-template**: Template para .claspignore
  - **appsscript-template.json**: Template para appsscript.json

## Expansão e Manutenção

Para adicionar novos projetos, anos ou PDVs, basta atualizar o arquivo `config.yml` sem necessidade de modificar o código JavaScript. O sistema detectará automaticamente as novas configurações e gerará os arquivos de deploy correspondentes.

### Adicionando um Novo Projeto

1. Adicione o código fonte na pasta `src/`
2. Configure o projeto no arquivo `config.yml`
3. Atualize o `rollup.config.js` para incluir o novo projeto
4. Execute `pnpm run build` e `pnpm run deploy`

### Adicionando um Novo Ano ou PDV

1. Adicione as configurações no arquivo `config.yml`
2. Execute `pnpm run deploy` com os parâmetros apropriados
