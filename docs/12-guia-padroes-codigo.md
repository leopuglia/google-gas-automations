# Guia de Padrões de Código

> Última atualização: 06/05/2025

## Resumo

Este guia define as convenções e padrões de código adotados no projeto GAS Builder, abrangendo estilo de código, práticas recomendadas e configurações de ferramentas. A adoção destes padrões garante consistência, legibilidade e manutenibilidade em todo o código.

## Pré-requisitos

- Conhecimento de [TypeScript](https://www.typescriptlang.org/docs/)
- Familiaridade com [ESLint](https://eslint.org/) e [Prettier](https://prettier.io/)
- Conhecimento básico do [Google Apps Script](https://developers.google.com/apps-script/)

## 1. Princípios Gerais

### 1.1. Fundamentos

- **Legibilidade**: O código deve ser fácil de ler e entender
- **Manutenibilidade**: O código deve ser fácil de manter e modificar
- **Consistência**: O código deve seguir padrões consistentes
- **Simplicidade**: Preferir soluções simples e diretas
- **Testabilidade**: O código deve ser projetado para facilitar testes

### 1.2. Valores do Projeto

- **Qualidade**: Priorizar código bem escrito e testado
- **Colaboração**: Facilitar contribuições de múltiplos desenvolvedores
- **Evolução**: Permitir melhorias e refatorações contínuas
- **Documentação**: Manter documentação clara e atualizada
- **Acessibilidade**: Tornar o código acessível para iniciantes

## 2. Estrutura do Código

### 2.1. Organização de Arquivos

```bash
src/
  ├── core/             # Núcleo do sistema
  │   ├── config/       # Configuração
  │   ├── build/        # Sistema de build
  │   └── utils/        # Utilitários compartilhados
  ├── cli/              # Interface de linha de comando
  ├── plugins/          # Plugins extensíveis
  │   ├── base/         # Classes base para plugins
  │   └── [plugin-name]/# Plugins específicos
  └── templates/        # Templates do sistema
      ├── base/         # Classes base para templates
      └── [template-name]/# Templates específicos
```

### 2.2. Convenções de Nomeação

#### 2.2.1. Arquivos

- **Nomes de arquivo**: `kebab-case.ts` (ex: `config-manager.ts`)
- **Testes unitários**: `[nome-do-arquivo].spec.ts` (ex: `config-manager.spec.ts`)
- **Interfaces/Tipos**: `[nome].types.ts` (ex: `config.types.ts`)
- **Constantes**: `[nome].constants.ts` (ex: `error.constants.ts`)
- **Utilitários**: `[nome].utils.ts` (ex: `string.utils.ts`)

#### 2.2.2. Identificadores

- **Classes**: `PascalCase` (ex: `ConfigManager`)
- **Interfaces**: `PascalCase` prefixo `I` opcional (ex: `IConfig` ou `Config`)
- **Tipos**: `PascalCase` (ex: `BuildOptions`)
- **Variáveis/Funções**: `camelCase` (ex: `getConfig()`)
- **Constantes**: `UPPER_SNAKE_CASE` (ex: `MAX_RETRY_COUNT`)
- **Componentes privados**: Prefixo `_` (ex: `_validateInput()`)

### 2.3. Imports e Exports

```typescript
// Imports agrupados e ordenados
import fs from 'fs';                                     // Node.js built-ins primeiro
import path from 'path';

import { rollup } from 'rollup';                         // Dependências externas
import typescript from '@rollup/plugin-typescript';

import { Config } from './types';                        // Imports locais
import { validateConfig } from './validation';

// Exports agrupados
export { ConfigManager };                                // Exports nomeados
export type { ConfigOptions, ValidationResult };         // Export de tipos
export default ConfigManager;                            // Export padrão (use com moderação)
```

## 3. Estilo de Código

### 3.1. Formatação

A formatação é gerenciada pelo Prettier com as seguintes configurações:

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### 3.2. Boas Práticas de TypeScript

```typescript
// Usar tipos explícitos em assinaturas de funções
function processData(input: InputData): ResultData {
  // ...
}

// Usar inferência de tipos para variáveis quando óbvio
const count = 0;  // Tipo inferido como number

// Usar interfaces para API pública
interface ConfigManager {
  loadConfig(path: string): Promise<Config>;
  validateConfig(config: unknown): ValidationResult;
}

// Usar genéricos para componentes reutilizáveis
function parseJson<T>(json: string): T {
  return JSON.parse(json) as T;
}

// Usar tipagem estrita
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Divisão por zero');
  }
  return a / b;
}

// Evitar 'any', preferir 'unknown' quando necessário
function processUnknownData(data: unknown): void {
  if (typeof data === 'string') {
    // Agora TypeScript sabe que data é string
    console.log(data.toUpperCase());
  }
}
```

### 3.3. Padrões de ESLint

Regras principais do ESLint:

```javascript
{
  "rules": {
    // Preferir const sobre let quando possível
    "prefer-const": "error",
    
    // Não permitir any implícito
    "@typescript-eslint/no-implicit-any": "error",
    
    // Exigir retorno de tipos em funções exportadas
    "@typescript-eslint/explicit-function-return-type": ["warn", {
      "allowExpressions": true,
      "allowTypedFunctionExpressions": true
    }],
    
    // Evitar código não utilizado
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    
    // Impedir importações cíclicas
    "import/no-cycle": "error",
    
    // Padrões do Google Apps Script
    "googleappsscript/valid-apps-script-object": "error"
  }
}
```

## 4. Padrões de Codificação

### 4.1. Funções

```typescript
// Preferir funções pequenas e focadas
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Usar parâmetros opcionais com valores padrão
function fetchData(url: string, options: RequestOptions = DEFAULT_OPTIONS): Promise<Response> {
  // ...
}

// Usar destructuring para opções
function processOptions({ verbose = false, retries = 3, timeout = 1000 }: ProcessOptions = {}): void {
  // ...
}

// Documentar comportamentos complexos
/**
 * Calcula o valor médio dos itens no array.
 * Retorna 0 para array vazio.
 */
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}
```

### 4.2. Classes

```typescript
// Utilizar visibilidade explícita
class DataProcessor {
  // Propriedades privadas
  private readonly config: Config;
  private data: ProcessedData | null = null;
  
  // Construtor com injeção de dependências
  constructor(config: Config) {
    this.config = config;
  }
  
  // Métodos públicos bem documentados
  /**
   * Processa os dados conforme configuração.
   */
  public async process(input: RawData): Promise<ProcessedData> {
    this.validateInput(input);
    
    const result = await this.transform(input);
    this.data = result;
    
    return result;
  }
  
  // Métodos privados auxiliares
  private validateInput(input: RawData): void {
    if (!input.id) {
      throw new Error('ID is required');
    }
  }
  
  private async transform(input: RawData): Promise<ProcessedData> {
    // Lógica de transformação
    return { /* ... */ };
  }
}
```

### 4.3. Tratamento de Erros

```typescript
// Usar classes de erro personalizadas
class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

// Tratar erros específicos
try {
  const config = await loadConfig(filePath);
} catch (error) {
  if (error instanceof ConfigError) {
    console.error('Erro de configuração:', error.message);
  } else if (error instanceof SyntaxError) {
    console.error('Erro de sintaxe no arquivo de configuração');
  } else {
    console.error('Erro desconhecido:', error);
  }
  process.exit(1);
}

// Usar async/await com try/catch
async function safeOperation(): Promise<Result> {
  try {
    const data = await fetchData();
    return processData(data);
  } catch (error) {
    logger.error('Failed to perform operation', { error });
    throw new OperationError('Operation failed', { cause: error });
  }
}
```

### 4.4. Padrões Específicos para Google Apps Script

```typescript
// Exportar funções globais explicitamente
function onOpen(): void {
  // Implementação...
}

// Expor explicitamente para o GAS
export { onOpen };

// Usar tipagem para APIs do Google
function getSheetData(sheetName: string): any[][] {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }
  
  return sheet.getDataRange().getValues();
}

// Usar verificações de limite de tempo para scripts longos
function processManyItems(items: Item[]): ProcessResult {
  const results: ItemResult[] = [];
  
  for (let i = 0; i < items.length; i++) {
    // Verificar se está próximo ao limite de tempo (5.5 min)
    if (i > 0 && i % 50 === 0) {
      if (isTimeExpiring()) {
        return { 
          completed: false, 
          processedCount: i,
          results
        };
      }
    }
    
    results.push(processItem(items[i]));
  }
  
  return {
    completed: true,
    processedCount: items.length,
    results
  };
}

function isTimeExpiring(): boolean {
  const MAX_EXECUTION_TIME = 5.5 * 60 * 1000; // 5.5 minutos em ms
  const executionTime = Date.now() - START_TIME;
  return executionTime > MAX_EXECUTION_TIME;
}
```

## 5. Testes

### 5.1. Padrões de Teste

```typescript
// Usar estrutura arrange-act-assert
describe('ConfigManager', () => {
  test('deve carregar configuração válida', async () => {
    // Arrange
    const manager = new ConfigManager();
    const configPath = '/path/to/valid-config.yml';
    
    // Act
    const config = await manager.loadConfig(configPath);
    
    // Assert
    expect(config).toBeDefined();
    expect(config.version).toBe('1.0.0');
  });
});

// Agrupar testes logicamente
describe('DataProcessor', () => {
  describe('validate', () => {
    test('deve aceitar dados válidos', () => { /* ... */ });
    test('deve rejeitar dados sem ID', () => { /* ... */ });
  });
  
  describe('process', () => {
    test('deve processar dados simples', () => { /* ... */ });
    test('deve lidar com dados complexos', () => { /* ... */ });
  });
});

// Usar mocks para dependências externas
test('deve chamar API externa com parâmetros corretos', async () => {
  // Arrange
  const mockApi = {
    fetchData: jest.fn().mockResolvedValue({ status: 'success' })
  };
  const service = new DataService(mockApi);
  
  // Act
  await service.processData('test-id');
  
  // Assert
  expect(mockApi.fetchData).toHaveBeenCalledWith('test-id');
});
```

### 5.2. Mocks para Google Apps Script

```typescript
// Configuração de mocks para GAS
const MockSpreadsheetApp = {
  getActiveSpreadsheet: jest.fn().mockReturnValue({
    getSheetByName: jest.fn().mockImplementation(name => {
      if (name === 'ValidSheet') {
        return {
          getDataRange: jest.fn().mockReturnValue({
            getValues: jest.fn().mockReturnValue([
              ['Header1', 'Header2'],
              ['Value1', 'Value2']
            ])
          })
        };
      }
      return null;
    })
  })
};

// Injetar no global scope antes dos testes
global.SpreadsheetApp = MockSpreadsheetApp;
```

## 6. Configurações de Ferramentas

### 6.1. ESLint

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint',
    'googleappsscript',
    'jest'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:googleappsscript/recommended',
    'plugin:jest/recommended',
    'prettier'
  ],
  rules: {
    // Regras personalizadas...
  }
};
```

### 6.2. Prettier

```json
// .prettierrc
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### 6.3. TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/core/*"],
      "@plugins/*": ["src/plugins/*"],
      "@templates/*": ["src/templates/*"],
      "@cli/*": ["src/cli/*"],
      "@shared/*": ["shared/*"]
    },
    "outDir": "./build",
    "declaration": true,
    "declarationDir": "./types",
    "sourceMap": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": [
    "src/**/*.ts",
    "shared/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "build",
    "tests/**/*.spec.ts"
  ]
}
```

### 6.4. Jest

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

## 7. Controle de Qualidade

### 7.1. Pull Requests

- Todo código deve passar por revisão
- Testes devem passar antes do merge
- Linting e formatação devem estar corretos
- A documentação deve ser atualizada

### 7.2. Pipelines CI/CD

```yaml
# Exemplo simplificado de pipeline
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### 7.3. Análise de Cobertura de Código

- Meta mínima: 80% de cobertura
- Áreas críticas: 90% ou mais
- Relatórios automatizados em PRs

## 8. Recursos e Referências

### 8.1. Exemplos de Código

Para mais exemplos, consulte:

- [src/examples/](../src/examples/)
- [templates/basic/](../templates/basic/)

### 8.2. Referências Externas

- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## Próximos Passos

- Consulte o [guia de documentação de código](./11-guia-documentacao-codigo.md)
- Explore a [arquitetura técnica](./22-ref-arquitetura-tecnica.md)
- Veja o [sistema de build](./21-ref-sistema-build.md)

## Referências

- [TSConfig Reference](https://www.typescriptlang.org/tsconfig)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Jest Configuration](https://jestjs.io/docs/configuration)
