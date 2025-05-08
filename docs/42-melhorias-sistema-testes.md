# Melhorias no Sistema de Testes

> Última atualização: 06/05/2025

## Resumo

Este documento apresenta propostas concretas de melhorias para o sistema de testes do GAS Builder, baseadas na experiência de implementação e nas lições aprendidas. O objetivo é evoluir continuamente a qualidade e a abrangência dos testes, contribuindo para maior estabilidade e confiabilidade do sistema.

## Pré-requisitos

- Familiaridade com o [plano de testes](./40-plano-testes-estabilizacao.md) e sua [implementação](./41-impl-estabilizacao-testes.md)
- Conhecimento das tecnologias de teste (Jest, TypeScript)
- Compreensão da [arquitetura do GAS Builder](./02-arquitetura-gas-builder.md)

## 1. Áreas de Melhoria Identificadas

Após a implementação inicial do sistema de testes, foram identificadas as seguintes áreas que precisam de melhorias:

### 1.1. Cobertura de Testes

- **Situação Atual**: Cobertura média de 78%, com variações entre componentes
- **Problemas**: Algumas áreas críticas com cobertura abaixo do ideal
- **Impacto**: Risco de regressões em funcionalidades importantes

### 1.2. Tempo de Execução

- **Situação Atual**: Bateria completa de testes leva ~5 minutos
- **Problemas**: Lentidão em alguns testes, especialmente de integração
- **Impacto**: Feedback mais demorado para desenvolvedores

### 1.3. Manutenção de Mocks

- **Situação Atual**: Mocks parciais e espalhados por múltiplos arquivos
- **Problemas**: Duplicação e inconsistência entre mocks
- **Impacto**: Dificuldade de manutenção e maior esforço para novos testes

### 1.4. Testes End-to-End (E2E)

- **Situação Atual**: Poucos testes E2E, principalmente manuais
- **Problemas**: Baixa automação de cenários completos
- **Impacto**: Dificuldade de validar o sistema de forma holística

### 1.5. Documentação de Testes

- **Situação Atual**: Documentação básica, principalmente em comentários
- **Problemas**: Falta de padrões e guias para novos testes
- **Impacto**: Curva de aprendizado elevada para novos contribuidores

## 2. Propostas de Melhorias

### 2.1. Aumento e Otimização de Cobertura

#### 2.1.1. Análise de Cobertura Direcionada

Implementar análise de cobertura mais granular para identificar áreas específicas que precisam de atenção:

```typescript
// Exemplo de configuração para análise detalhada no jest.config.js
/** @type {import('jest').Config} */
export default {
  // Configuração existente...
  coverageReporters: ['text', 'html', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/config/': {
      branches: 90,
      functions: 95,
      lines: 90
    },
    './src/deploy/': {
      branches: 85,
      functions: 90,
      lines: 85
    }
  }
};
```

#### 2.1.2. Estratégia de Testes por Componente

Definir estratégias específicas para componentes críticos:

| Componente | Estratégia | Meta de Cobertura |
|------------|------------|-------------------|
| Config Manager | Foco em validação e casos extremos | 95% |
| Template Processor | Testes parametrizados com diversas entradas | 90% |
| Rollup Integration | Mocks granulares e testes de contrato | 85% |
| Deploy Process | Mocks do Clasp e testes de falhas | 85% |
| CLI | Testes de comandos e parâmetros | 90% |

#### 2.1.3. Implementação de TDD para Novos Recursos

Adotar Test-Driven Development para todos os novos recursos:

1. Escrever testes que definem comportamento esperado
2. Implementar código que atenda aos testes
3. Refatorar mantendo testes passando

### 2.2. Otimização do Tempo de Execução

#### 2.2.1. Paralelização Inteligente

Configurar Jest para executar testes em paralelo sem conflitos:

```javascript
// jest.config.js
/** @type {import('jest').Config} */
export default {
  // Configuração existente...
  maxWorkers: '50%',  // Utilizar 50% dos cores disponíveis
  maxConcurrency: 5,  // Máximo de testes em paralelo
  workerIdleMemoryLimit: '512MB'  // Limite de memória por worker
};
```

#### 2.2.2. Testes em Camadas

Implementar execução em camadas para priorizar feedback rápido:

```json
// package.json - scripts otimizados
"scripts": {
  "test": "jest",
  "test:fast": "jest --testPathIgnorePatterns=integration,e2e",
  "test:integration": "jest --testPathPattern=integration",
  "test:e2e": "jest --testPathPattern=e2e",
  "test:staged": "jest --findRelatedTests $(git diff --staged --name-only)",
  "test:watch": "jest --watch"
}
```

#### 2.2.3. Caching Agressivo

Configurar mecanismos de cache para evitar processamento redundante:

```javascript
// jest.config.js
/** @type {import('jest').Config} */
export default {
  // Configuração existente...
  cache: true,
  cacheDirectory: '.jest-cache',
  haste: {
    enableSymlinks: true
  }
};
```

### 2.3. Sistema de Mocks Centralizado

#### 2.3.1. Factory de Mocks

Implementar padrão factory para mocks consistentes:

```typescript
// tests/mocks/factory.ts
export class MockFactory {
  static createLogger() {
    return {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
  }
  
  static createConfig(overrides = {}) {
    return {
      defaults: {
        paths: {
          src: './src',
          build: './build'
        },
        logging: {
          level: 'INFO'
        }
      },
      projects: {
        'test-project': {
          src: 'src/test-project',
          output: 'build/test-project',
          environments: {
            dev: { scriptId: 'test-id' }
          }
        }
      },
      ...overrides
    };
  }
  
  static createGoogleAppsScriptMocks() {
    return {
      Logger: {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      },
      SpreadsheetApp: {
        // Implementação do mock
      },
      // Outros serviços
    };
  }
}
```

#### 2.3.2. Mock Modular de APIs do Google

Implementar mocks modulares para APIs do Google Apps Script:

```typescript
// tests/mocks/google-apps-script/index.ts
export * from './logger';
export * from './spreadsheet';
export * from './document';
export * from './drive';
// etc.

// tests/mocks/google-apps-script/spreadsheet.ts
export const SpreadsheetApp = {
  getActiveSpreadsheet: jest.fn().mockReturnValue({
    // Implementação detalhada
  }),
  open: jest.fn(),
  openById: jest.fn(),
  // Mais métodos
};
```

#### 2.3.3. Snapshots para Configurações

Utilizar snapshots para verificar estruturas complexas:

```typescript
// Exemplo de teste com snapshot
test('should generate correct rollup config', () => {
  const config = MockFactory.createConfig();
  const rollupConfig = buildRollupConfig(config, 'test-project');
  
  // Verificar estrutura completa via snapshot
  expect(rollupConfig).toMatchSnapshot();
  
  // Verificar também aspectos críticos explicitamente
  expect(rollupConfig.input).toHaveProperty('index');
  expect(rollupConfig.plugins).toHaveLength(3);
});
```

### 2.4. Implementação de Testes E2E Robustos

#### 2.4.1. Framework Customizado para E2E

Criar framework específico para testes E2E:

```typescript
// tests/e2e/framework/runner.ts
export class E2ETestRunner {
  private projectDir: string;
  private configPath: string;
  
  constructor(options: { projectDir: string, configPath?: string }) {
    this.projectDir = options.projectDir;
    this.configPath = options.configPath || path.join(this.projectDir, 'config.yml');
  }
  
  async setup() {
    // Preparar ambiente de teste
    await fs.ensureDir(this.projectDir);
    // Mais inicializações...
  }
  
  async createProject(projectKey: string, options: ProjectOptions) {
    // Criar estrutura de projeto para teste
  }
  
  async runBuild(options: BuildOptions) {
    // Executar build usando CLI real
  }
  
  async runDeploy(options: DeployOptions) {
    // Executar deploy (com mock de clasp)
  }
  
  async verify(assertion: VerificationAssertion) {
    // Verificar resultados
  }
  
  async cleanup() {
    // Limpar ambiente após teste
  }
}
```

#### 2.4.2. Cenários de Teste Padronizados

Implementar conjunto padronizado de cenários E2E:

```typescript
// tests/e2e/scenarios/basic-project.test.ts
import { E2ETestRunner } from '../framework/runner';

describe('E2E: Basic Project', () => {
  let runner: E2ETestRunner;
  
  beforeAll(async () => {
    runner = new E2ETestRunner({
      projectDir: path.join(os.tmpdir(), 'gas-builder-e2e-basic')
    });
    await runner.setup();
  });
  
  afterAll(async () => {
    await runner.cleanup();
  });
  
  test('should build and deploy basic project', async () => {
    // Criar projeto de teste
    await runner.createProject('basic', {
      src: 'src/basic',
      files: {
        'index.ts': 'function hello() { return "Hello"; }; export { hello };'
      }
    });
    
    // Executar build
    await runner.runBuild({
      projectKey: 'basic',
      clean: true
    });
    
    // Verificar build
    await runner.verify({
      file: 'build/basic/index.js',
      exists: true,
      contains: 'function hello'
    });
    
    // Executar deploy (mockado)
    await runner.runDeploy({
      projectKey: 'basic',
      environment: 'dev'
    });
    
    // Verificar logs de deploy
    await runner.verify({
      logs: true,
      contains: 'Deploy concluído com sucesso'
    });
  });
  
  // Mais cenários...
});
```

#### 2.4.3. Integração com GitHub Actions

Configurar execução periódica de testes E2E em CI:

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *'  # Diariamente às 2h UTC

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: e2e-results
          path: reports/e2e
```

### 2.5. Documentação e Padronização

#### 2.5.1. Guia de Testes Detalhado

Criar documento de referência para testes:

```markdown
# Guia de Testes para o GAS Builder

## Princípios Gerais
- Cada teste deve ter um propósito claro
- Evitar dependências entre testes
- Preferir testes pequenos e focados

## Estrutura de um Teste
- Arrange: preparar dados e ambiente
- Act: executar função/método sob teste
- Assert: verificar resultados

## Padrões de Nomenclatura
- `describe`: módulo ou classe sendo testada
- `test`: comportamento específico sendo testado
- variáveis: nome_claro_sobre_propósito

## Exemplos por Categoria
...
```

#### 2.5.2. Snippets para VS Code

Criar snippets para acelerar criação de testes:

```json
// .vscode/test-snippets.code-snippets
{
  "Jest Test Suite": {
    "scope": "typescript",
    "prefix": "test:suite",
    "body": [
      "import { $1 } from '$2';",
      "",
      "describe('$3', () => {",
      "  beforeEach(() => {",
      "    jest.clearAllMocks();",
      "  });",
      "",
      "  test('should $4', () => {",
      "    // Arrange",
      "    $5",
      "",
      "    // Act",
      "    $6",
      "",
      "    // Assert",
      "    $7",
      "  });",
      "});"
    ]
  },
  "Jest Mock": {
    "scope": "typescript",
    "prefix": "test:mock",
    "body": [
      "jest.mock('$1', () => ({",
      "  $2: jest.fn()$3",
      "}));"
    ]
  }
}
```

#### 2.5.3. Convenção para JSDoc em Testes

Padronizar documentação em testes:

```typescript
/**
 * Testa o carregamento de configuração
 * 
 * @group unit
 * @category config
 */
describe('Config Loading', () => {
  /**
   * Verifica se erro é lançado quando arquivo não existe
   * 
   * @scenario arquivo-inexistente
   * @priority high
   */
  test('should throw error when file does not exist', () => {
    // Test implementation
  });
});
```

## 3. Plano de Implementação

### 3.1. Priorização

Implementaremos as melhorias na seguinte ordem:

1. **Sistema de Mocks Centralizado** (Alto Impacto / Médio Esforço)
   - Factory de mocks
   - Mocks modulares para GAS

2. **Otimização de Tempo de Execução** (Alto Impacto / Baixo Esforço)
   - Paralelização
   - Script para testes em camadas

3. **Aumento da Cobertura** (Alto Impacto / Alto Esforço)
   - Foco nos componentes prioritários
   - Implementação de estratégias por componente

4. **Documentação e Padronização** (Médio Impacto / Baixo Esforço)
   - Guia de testes
   - Snippets para VS Code

5. **Testes E2E** (Médio Impacto / Alto Esforço)
   - Framework básico
   - Cenários prioritários

### 3.2. Cronograma

| Melhoria | Tempo Estimado | Responsável |
|----------|----------------|-------------|
| Sistema de Mocks | 1-2 semanas | Equipe de Qualidade |
| Otimização de Tempo | 3-5 dias | Dev. Infrastructure |
| Aumento de Cobertura | 3-4 semanas | Todos desenvolvedores |
| Documentação | 1 semana | Tech Writer + QA |
| Testes E2E | 2-3 semanas | Equipe de Qualidade |

### 3.3. Métricas de Sucesso

Para cada área de melhoria, definimos métricas específicas:

- **Cobertura**: Aumento para >85% global
- **Tempo de Execução**: Redução de 5 minutos para <2 minutos
- **Manutenção**: Redução de 30% no código de teste por funcionalidade
- **E2E**: 10 cenários críticos automatizados
- **Documentação**: 100% de aderência aos novos padrões em novos testes

## 4. Impacto nas Equipes

### 4.1. Benefícios para Desenvolvedores

- Feedback mais rápido durante desenvolvimento
- Menor necessidade de testes manuais
- Maior segurança em refatorações
- Templates prontos para novos testes

### 4.2. Benefícios para Qualidade

- Melhor visibilidade de problemas
- Maior cobertura automatizada
- Métricas mais precisas
- Melhor experiência de depuração

### 4.3. Benefícios para o Produto

- Maior estabilidade
- Ciclos de release mais curtos
- Menos bugs em produção
- Maior confiança em novos recursos

## 5. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Overhead de manutenção de testes | Média | Médio | Automação e templates padronizados |
| Resistência à mudança de padrões | Alta | Médio | Documentação clara e demonstração de benefícios |
| Testes falsos positivos (flaky) | Alta | Alto | Mecanismos de retry e isolamento de ambiente |
| Baixa adoção de TDD | Média | Baixo | Workshops e exemplos práticos |
| Tempo de CI aumentado | Alta | Médio | Execução parcial por PR, testes completos em main |

## Próximos Passos

1. Apresentar plano de melhorias para a equipe
2. Implementar piloto do sistema de mocks centralizado
3. Configurar otimizações de tempo para feedback rápido
4. Iniciar documentação de padrões de teste
5. Planejar incremento gradual de cobertura

## Referências

- [40-plano-testes-estabilizacao.md](./40-plano-testes-estabilizacao.md): Plano original
- [41-impl-estabilizacao-testes.md](./41-impl-estabilizacao-testes.md): Implementação atual
- [Jest Best Practices](https://jestjs.io/docs/snapshot-testing): Práticas recomendadas do Jest
- [Google Testing Blog](https://testing.googleblog.com/): Referências de testes do Google
