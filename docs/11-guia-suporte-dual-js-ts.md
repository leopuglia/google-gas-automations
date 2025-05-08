# Guia de Suporte Dual JavaScript/TypeScript

> Última atualização: 08/05/2025

## Resumo

Este guia explica como o GAS Builder (implementado em JavaScript) oferece suporte para projetos Google Apps Script desenvolvidos tanto em JavaScript quanto em TypeScript. Você aprenderá como configurar e compilar projetos usando qualquer uma das linguagens de sua preferência.

## Visão Geral

O GAS Builder é um sistema de build em JavaScript projetado para dar suporte a projetos desenvolvidos tanto em JavaScript quanto em TypeScript:

- **Sistema de Build**: Implementado completamente em JavaScript para máxima estabilidade e compatibilidade
- **Projetos GAS**: Podem ser desenvolvidos em JavaScript ou TypeScript, conforme sua preferência
- **Compilação Inteligente**: Reconhece automaticamente o tipo de projeto e aplica as transformações necessárias

## Configuração de Projetos

### Especificando a Linguagem do Projeto

Para definir a linguagem de um projeto, use a propriedade `language` no arquivo `config.yml`:

```yaml
projects:
  meu-projeto:
    src: caminho/para/src
    output: saida
    language: javascript  # Pode ser 'javascript' ou 'typescript'
    # outras configurações...
```

Se a propriedade `language` não for especificada, o sistema assumirá `typescript` como padrão para manter compatibilidade com projetos existentes.

### Estrutura do Projeto JavaScript

Um projeto GAS em JavaScript típico segue esta estrutura:

```bash
meu-projeto-js/
├── src/                # Código fonte JavaScript
│   ├── main.js         # Ponto de entrada principal
│   ├── utils.js        # Funções utilitárias
│   └── ...             # Outros arquivos .js
├── config.yml          # Configuração com language: javascript
└── ...
```

### Estrutura do Projeto TypeScript

Um projeto GAS em TypeScript típico segue esta estrutura:

```bash
meu-projeto-ts/
├── src/                # Código fonte TypeScript
│   ├── main.ts         # Ponto de entrada principal 
│   ├── utils.ts        # Funções utilitárias
│   └── ...             # Outros arquivos .ts
├── config.yml          # Configuração com language: typescript (ou omitido)
└── ...
```

## Pipeline de Build

O GAS Builder detecta automaticamente a linguagem de cada projeto e aplica as transformações apropriadas:

### Para Projetos JavaScript

1. Lê arquivos `.js` da pasta `src`
2. Aplica transformações via Babel para compatibilidade com o Google Apps Script
3. Resolve dependências com plugins commonjs e nodeResolve
4. Remove importações estáticas (não suportadas pelo GAS)
5. Gera arquivos JavaScript otimizados na pasta `build`

### Para Projetos TypeScript

1. Lê arquivos `.ts` da pasta `src`
2. Compila TypeScript para JavaScript usando o TypeScript Compiler
3. Aplica transformações para compatibilidade com o Google Apps Script
4. Resolve dependências com plugins nodeResolve
5. Remove importações estáticas (não suportadas pelo GAS)
6. Gera arquivos JavaScript otimizados na pasta `build`

## Considerações Especiais

### Arquivos de Entrada

Por padrão, o sistema procura pelos seguintes arquivos de entrada, dependendo da linguagem:

- **JavaScript**: `main.js` na pasta src do projeto
- **TypeScript**: `main.ts` na pasta src do projeto

Você pode especificar um arquivo de entrada diferente na configuração:

```yaml
projects:
  meu-projeto:
    # ...outras configurações
    rollup:
      main: app.js  # ou app.ts para TypeScript
```

### Bibliotecas e Dependências

Ambas as opções de linguagem suportam o uso de bibliotecas externas e módulos:

```javascript
// Em JavaScript
const { formatDate } = require('./utils.js');

// Em TypeScript
import { formatDate } from './utils';
```

O sistema de build tratará adequadamente estas importações para ambos os tipos de projeto.

### Verificação de Tipos

Para projetos JavaScript, você pode adicionar verificação de tipos opcional usando JSDoc:

```javascript
/**
 * @param {string} name Nome do usuário
 * @returns {string} Saudação personalizada
 */
function greet(name) {
  return `Olá, ${name}!`;
}
```

## Exemplos Práticos

### Exemplo: Projeto JavaScript

**config.yml**:

```yaml
projects:
  exemplo-js:
    src: exemplo-js
    output: exemplo-js
    language: javascript
    # ...outras configurações
```

**Código fonte** (`src/exemplo-js/main.js`):

```javascript
/**
 * Função que será exposta como função global no Google Apps Script
 */
function doGet() {
  return HtmlService.createHtmlOutput('Olá, Mundo!');
}

// Exportar funções para o escopo global
global.doGet = doGet;
```

### Exemplo: Projeto TypeScript

**config.yml**:

```yaml
projects:
  exemplo-ts:
    src: exemplo-ts
    output: exemplo-ts
    language: typescript  # Pode ser omitido, pois typescript é o padrão
    # ...outras configurações
```

**Código fonte** (`src/exemplo-ts/main.ts`):

```typescript
/**
 * Função que será exposta como função global no Google Apps Script
 */
function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createHtmlOutput('Olá, Mundo!');
}

// Exportar funções para o escopo global
(global as any).doGet = doGet;
```

## Depuração e Solução de Problemas

### Problemas Comuns em Projetos JavaScript

- **Sintaxe não suportada**: Evite recursos muito recentes do JavaScript que o Babel não transpila para o ES2019
- **Módulos CommonJS**: Certifique-se de usar `require()` para importações em arquivos JavaScript
- **Exportações**: Use `global.nomeDaFuncao = nomeDaFuncao` para expor funções ao GAS

### Problemas Comuns em Projetos TypeScript

- **Tipos incorretos**: Certifique-se de instalar `@types/google-apps-script` como dependência de desenvolvimento
- **Erros de compilação**: Verifique o tsconfig.json para garantir configurações compatíveis
- **Exportações**: Use `(global as any).nomeDaFuncao = nomeDaFuncao` para expor funções ao GAS

## Boas Práticas

1. **Seja consistente**: Escolha uma linguagem para cada projeto e mantenha-se consistente
2. **Documentação**: Documente bem seu código independente da linguagem escolhida
3. **Tipos**: Use tipos explícitos em TypeScript e JSDoc em JavaScript para melhor desenvolvimento
4. **Ferramentas**: Configure seu editor para linting e verificação de tipos para ambas as linguagens
