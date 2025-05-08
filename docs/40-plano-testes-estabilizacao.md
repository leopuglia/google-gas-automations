# Plano de Testes e Estabilização

> Última atualização: 06/05/2025

## Resumo

Este documento apresenta o plano de testes e estabilização para o sistema GAS Builder, detalhando as estratégias, tipos de testes, ferramentas e processos a serem adotados para garantir a qualidade e a robustez do sistema.

## Pré-requisitos

- Conhecimento básico de testes automatizados
- Familiaridade com [Jest](https://jestjs.io/) e [TypeScript](https://www.typescriptlang.org/)
- Entendimento da [arquitetura do GAS Builder](./02-arquitetura-gas-builder.md)
- Acesso ao código-fonte do projeto

## 1. Objetivos de Qualidade

O plano de testes e estabilização tem os seguintes objetivos principais:

1. **Garantir Confiabilidade**
   - Identificar e corrigir bugs antes do deploy
   - Prevenir regressões em funcionalidades existentes
   - Garantir comportamento consistente entre ambientes

2. **Melhorar Manutenibilidade**
   - Promover design modular e testável
   - Facilitar refatorações com segurança
   - Documentar comportamentos esperados através de testes

3. **Aumentar Robustez**
   - Validar tratamento de erros e exceções
   - Testar limites e casos extremos
   - Simular falhas e condições adversas

4. **Validar Compatibilidade**
   - Testar integração com diferentes versões do Google Apps Script
   - Verificar compatibilidade com diferentes ambientes Node.js
   - Garantir interoperabilidade com ferramentas externas

## 2. Estratégia de Testes

A estratégia de testes adota uma abordagem em camadas, combinando diferentes tipos de testes para maximizar a cobertura e a eficiência:

### 2.1. Testes Unitários

- **Foco**: Componentes individuais e funções isoladas
- **Cobertura alvo**: 80% do código-fonte
- **Tecnologia**: Jest com ts-jest
- **Localização**: `/tests/unit/`

### 2.2. Testes de Integração

- **Foco**: Interação entre múltiplos componentes
- **Cobertura alvo**: Todos os fluxos críticos
- **Tecnologia**: Jest com mocks para serviços externos
- **Localização**: `/tests/integration/`

### 2.3. Testes End-to-End

- **Foco**: Fluxos completos de build e deploy
- **Cobertura alvo**: Cenários principais de uso
- **Tecnologia**: Scripts bash automatizados
- **Localização**: `/tests/e2e/`

### 2.4. Testes de Compatibilidade

- **Foco**: Compatibilidade com diferentes versões e ambientes
- **Cobertura alvo**: Matriz de compatibilidade definida
- **Tecnologia**: GitHub Actions com múltiplas configurações
- **Localização**: `.github/workflows/compatibility.yml`

## 3. Ferramentas e Configuração

### 3.1. Jest

Jest será a principal ferramenta de testes, configurada para TypeScript:

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

### 3.2. Mocks para Google Apps Script

Será necessário criar mocks para as APIs do Google Apps Script:

```javascript
// tests/mocks/gas.mock.js
global.Logger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

global.SpreadsheetApp = {
  getActiveSpreadsheet: jest.fn(),
  // Mais métodos conforme necessário
};

global.DriveApp = {
  getFileById: jest.fn(),
  // Mais métodos conforme necessário
};

// Adicionar outros objetos globais do GAS conforme necessário
```

### 3.3. VS Code Test Explorer

Configuração para integração com VS Code:

```json
// .vscode/settings.json
{
  "jest.jestCommandLine": "",
  "jest.runMode": "watch",
  "typescript.tsdk": "node_modules/typescript/lib",
  "jest.shell": "/bin/bash",
  "jest.outputConfig": {
    "revealOn": "run",
    "revealWithFocus": "terminal",
    "clearOnRun": "terminal"
  },
  "testing.openTesting": "neverOpen",
  "terminal.integrated.defaultProfile.linux": "bash"
}
```

### 3.4. Scripts de Execução

Scripts para facilitar a execução dos testes:

```bash
# run-jest.sh
#!/bin/bash
cd "$(dirname "$0")" || exit 1
pnpm test "$@"
```

E no `package.json`:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:unit": "jest --testPathPattern=tests/unit",
  "test:integration": "jest --testPathPattern=tests/integration",
  "test:e2e": "bash tests/e2e/run-e2e.sh"
}
```

## 4. Tipos de Testes e Exemplos

### 4.1. Testes Unitários

Exemplo de teste unitário para o módulo de configuração:

```typescript
// tests/unit/config/config.test.ts
import { loadConfig, validateConfig } from '../../../src/config/config';
import fs from 'fs';
import path from 'path';

// Mock do fs
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  readFileSync: jest.fn()
}));

describe('Config Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('loadConfig should throw error if file not found', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    
    expect(() => loadConfig('non-existent.yml')).toThrow('not found');
  });
  
  test('loadConfig should load and parse YAML file', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(`
      defaults:
        logging:
          level: INFO
      projects:
        test-project:
          src: src/test
          environments:
            dev:
              scriptId: abc123
    `);
    
    const config = loadConfig('config.yml');
    
    expect(config).toHaveProperty('defaults.logging.level', 'INFO');
    expect(config).toHaveProperty('projects.test-project.src', 'src/test');
    expect(config).toHaveProperty('projects.test-project.environments.dev.scriptId', 'abc123');
  });
  
  // Mais testes...
});
```

### 4.2. Testes de Integração

Exemplo de teste de integração para o processo de build:

```typescript
// tests/integration/build/build-process.test.ts
import { build } from '../../../src/rollup/build';
import { loadConfig } from '../../../src/config/config';
import fs from 'fs-extra';
import path from 'path';

// Mocks parciais para preservar alguma funcionalidade real
jest.mock('../../../src/config/config', () => ({
  ...jest.requireActual('../../../src/config/config'),
  loadConfig: jest.fn()
}));

jest.mock('rollup', () => ({
  rollup: jest.fn().mockResolvedValue({
    write: jest.fn().mockResolvedValue({}),
    close: jest.fn().mockResolvedValue({})
  })
}));

describe('Build Process Integration', () => {
  const mockConfig = {
    defaults: {
      paths: {
        src: './src',
        build: './build'
      },
      rollup: {
        plugins: ['typescript', 'commonjs', 'resolve']
      }
    },
    projects: {
      'test-project': {
        src: 'src/test-project',
        output: 'build/test-project',
        entryFiles: ['index.ts'],
        environments: {
          dev: {
            scriptId: 'abc123'
          }
        }
      }
    }
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (loadConfig as jest.Mock).mockReturnValue(mockConfig);
  });
  
  test('build should process configuration and call rollup', async () => {
    await build('config.yml', 'test-project', false);
    
    // Verificar se a configuração foi carregada
    expect(loadConfig).toHaveBeenCalledWith('config.yml');
    
    // Verificar se rollup foi chamado com a configuração correta
    // (verificações específicas da chamada do rollup)
    
    // Mais verificações...
  });
  
  // Mais testes...
});
```

### 4.3. Testes End-to-End

Exemplo de script para teste end-to-end:

```bash
# tests/e2e/build-deploy-test.sh
#!/bin/bash
set -e

# Preparar ambiente de teste
echo "Preparando ambiente de teste..."
mkdir -p e2e-test
cd e2e-test

# Criar projeto de teste
echo "Criando projeto de teste..."
mkdir -p src/test-project
echo "function testFunction() { return 'Hello World'; }" > src/test-project/index.ts

# Criar configuração
cat > config.yml << EOF
defaults:
  paths:
    src: ./src
    build: ./build
projects:
  test-project:
    src: src/test-project
    output: build/test-project
    environments:
      dev:
        scriptId: MOCK_SCRIPT_ID
EOF

# Executar build
echo "Executando build..."
npx gas-builder build --project test-project

# Verificar resultado
if [ -f "build/test-project/index.js" ]; then
  echo "✅ Build realizado com sucesso!"
else
  echo "❌ Falha no build!"
  exit 1
fi

# Limpar ambiente
echo "Limpando ambiente de teste..."
cd ..
rm -rf e2e-test

echo "Teste E2E concluído com sucesso!"
```

## 5. Cobertura de Testes

### 5.1. Métricas de Cobertura

As seguintes métricas serão monitoradas:

- **Cobertura de linhas**: Percentual de linhas de código executadas
- **Cobertura de branches**: Percentual de caminhos de decisão testados
- **Cobertura de funções**: Percentual de funções testadas
- **Cobertura de statements**: Percentual de declarações executadas

### 5.2. Áreas Prioritárias

Algumas áreas exigem maior cobertura devido à sua criticidade:

1. **Sistema de configuração**: >90% de cobertura
2. **Integração com Rollup**: >85% de cobertura
3. **Sistema de templates**: >85% de cobertura
4. **Sistema de deploy**: >80% de cobertura

### 5.3. Relatórios de Cobertura

Os relatórios de cobertura serão:

- Gerados automaticamente em cada execução de testes
- Armazenados em `/coverage/`
- Integrados com o VS Code (utilizando extensões)
- Publicados como artefatos nos workflows de CI

## 6. Integração Contínua

### 6.1. GitHub Actions

Configuração para execução de testes em CI:

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run tests
      run: pnpm test
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
        name: codecov-${{ matrix.node-version }}
        fail_ci_if_error: false
```

### 6.2. Status Checks

Os seguintes status checks serão implementados:

- Todos os testes passando
- Cobertura de código mínima (threshold)
- Linting sem erros
- Build bem-sucedido

## 7. Processo de Estabilização

### 7.1. Fases de Estabilização

1. **Fase Alpha (2 semanas)**
   - Implementação da estrutura de testes
   - Testes unitários para componentes críticos
   - Correção de bugs bloqueadores

2. **Fase Beta (3-4 semanas)**
   - Expansão da cobertura de testes
   - Testes de integração para fluxos principais
   - Testes com projetos reais em ambiente controlado

3. **Fase RC (Release Candidate) (2 semanas)**
   - Testes end-to-end completos
   - Validação de compatibilidade
   - Correção de bugs remanescentes

4. **Fase GA (General Availability) (1 semana)**
   - Verificação final de qualidade
   - Documentação de testes atualizada
   - Release oficial

### 7.2. Critérios de Saída

Para avançar entre as fases, devem ser atendidos:

- **Alpha → Beta**:
  - >50% de cobertura de testes unitários
  - Zero bugs bloqueadores
  - Estrutura de testes implementada

- **Beta → RC**:
  - >70% de cobertura total
  - Testes de integração para todos os fluxos críticos
  - Máximo de 5 bugs de média prioridade abertos

- **RC → GA**:
  - >80% de cobertura total
  - Todos os testes end-to-end passando
  - Máximo de 3 bugs de baixa prioridade abertos
  - Documentação de testes completa

## 8. Manutenção Contínua

### 8.1. Processo de Testes para Novos Recursos

1. Escrever testes unitários antes ou junto com o código
2. Atualizar testes de integração conforme necessário
3. Verificar cobertura antes de submeter PR
4. Atualizar documentação de testes se aplicável

### 8.2. Revisão Periódica

- Revisão mensal de cobertura de testes
- Atualização trimestral de mocks e fixtures
- Refatoração de testes conforme evolução do sistema

## Próximos Passos

1. Implementar estrutura básica de testes conforme definido neste plano
2. Configurar integração com GitHub Actions
3. Criar mocks para as APIs do Google Apps Script
4. Iniciar implementação de testes unitários para componentes críticos

## Referências

- [02-arquitetura-gas-builder.md](./02-arquitetura-gas-builder.md): Arquitetura do sistema
- [32-impl-core-sistema.md](./32-impl-core-sistema.md): Implementação do core do sistema
- [Documentação do Jest](https://jestjs.io/docs/getting-started): Framework de testes
- [Memória: Configuração do Jest](../memoria/963e3caf-957a-43a3-b242-e56765cea22f): Configuração específica para o projeto
