# Sistema de Build - VilladasPedras

## Visão Geral

O sistema de build do projeto utiliza:

- Rollup para empacotamento do código
- TypeScript para tipagem e compilação
- Clasp para deploy no Google Apps Script

## Arquivos Principais

### 1. rollup.config.js

Configura o processo de build com:

- Processamento de templates dinâmicos
- Suporte a múltiplos projetos e ambientes (dev/prod)
- Integração com TypeScript

### 2. tsconfig.json

Define:

- Target ES2019
- Strict mode ativado
- Tipos para Google Apps Script
- Paths para imports

### 3. package.json

Contém:

- Scripts para build, deploy e execução
- Dependências do projeto (Rollup, Clasp, etc.)
- Configurações do Prettier e ESLint

### 4. config.yml

Configura:

- Projetos e suas estruturas
- Script IDs para cada ambiente
- Templates de saída
- Mapeamento de PDVs

## Fluxo de Build

1. Processa templates (process-templates.js)
2. Compila TypeScript (rollup.config.js)
3. Empacota código (build-rollup.js)
4. Prepara para deploy (build-deploy.js)
5. Envia para GAS (clasp-operations.js)

## Scripts Principais

- `pnpm run build`: Build completo
- `pnpm run push:project`: Envia para GAS
- `pnpm run execute:project`: Executa remotamente
