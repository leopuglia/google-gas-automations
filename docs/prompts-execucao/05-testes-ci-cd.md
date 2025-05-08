# Prompt Final: Testes Automatizados e CI/CD

## Cenário

Você está desenvolvendo o sistema de build `google-gas-builder` para Google Apps Script e precisa implementar uma estratégia robusta de testes automatizados e integração contínua. O projeto possui módulos core que manipulam configuração YAML, geradores de template, sistemas de arquivos e integração com CLASP que precisam ser testados de forma unitária e de integração. Além disso, é necessário configurar um pipeline CI/CD no GitHub Actions para garantir qualidade de código e releases automáticos.

## Seu Papel

Você é um Engenheiro de Software especializado em Quality Assurance e DevOps, com ampla experiência em Jest, JavaScript e GitHub Actions. Seu objetivo é desenvolver uma estratégia de testes abrangente e um pipeline CI/CD eficiente para o projeto.

## Instruções Detalhadas

1. **Estrutura de Testes Unitários**
   - Analise a configuração do Jest no arquivo `jest.config.js` existente
   - Defina uma estrutura para testes unitários que espelhe a estrutura do código fonte:

     ```bash
     tests/
     ├─ unit/
     │   ├─ core/
     │   │   ├─ config/
     │   │   │   ├─ yaml-parser.test.js
     │   │   │   ├─ schema-validator.test.js
     │   │   │   └─ index.test.js
     │   │   ├─ template/
     │   │   │   ├─ renderer.test.js
     │   │   │   └─ index.test.js
     │   │   └─ filesystem/
     │   │       ├─ operations.test.js
     │   │       └─ index.test.js
     │   ├─ rollup/
     │   │   ├─ builders/
     │   │   │   ├─ input-builder.test.js
     │   │   │   ├─ output-builder.test.js
     │   │   │   └─ plugin-factory.test.js
     │   │   └─ index.test.js
     │   └─ cli/
     │       ├─ parser.test.js
     │       └─ commands/
     │           ├─ build.test.js
     │           └─ deploy.test.js
     ├─ integration/
     │   ├─ config-to-rollup.test.js
     │   ├─ deploy-process.test.js
     │   └─ cli-commands.test.js
     └─ mocks/
         ├─ gas.mock.js
         ├─ fs.mock.js
         └─ config-samples/
             ├─ valid-config.yml
             ├─ invalid-config.yml
             └── minimal-config.yml
     ```

2. **Implementação de Mocks para Google Apps Script**
   - Crie mocks abrangentes para as APIs do Google Apps Script usadas no projeto:

     ```javascript
     // tests/mocks/gas.mock.js
     
     // SpreadsheetApp
     global.SpreadsheetApp = {
       getActiveSpreadsheet: jest.fn(() => ({
         getSheetByName: jest.fn(),
         getActiveSheet: jest.fn(),
         getSheets: jest.fn(() => []),
         getName: jest.fn(() => 'Mock Spreadsheet'),
         getId: jest.fn(() => '1mock_spreadsheet_id')
       })),
       getUi: jest.fn(() => ({
         createMenu: jest.fn(() => ({
           addItem: jest.fn(() => ({
             addSeparator: jest.fn(() => ({
               addToUi: jest.fn()
             }))
           }))
         }))
       }))
     };
     
     // DriveApp
     global.DriveApp = {
       getFileById: jest.fn((id) => ({
         getName: jest.fn(() => `File ${id}`),
         getId: jest.fn(() => id),
         getUrl: jest.fn(() => `https://drive.google.com/file/d/${id}`),
         getBlob: jest.fn()
       })),
       getFolderById: jest.fn((id) => ({
         getName: jest.fn(() => `Folder ${id}`),
         getId: jest.fn(() => id),
         getUrl: jest.fn(() => `https://drive.google.com/folder/d/${id}`),
         createFile: jest.fn(),
         createFolder: jest.fn()
       }))
     };
     
     // Utilities
     global.Utilities = {
       formatString: jest.fn((...args) => {
         let str = args[0];
         for (let i = 1; i < args.length; i++) {
           str = str.replace(`%${i}`, args[i]);
         }
         return str;
       }),
       formatDate: jest.fn(() => '2025-05-06'),
       sleep: jest.fn(),
       base64Encode: jest.fn((input) => Buffer.from(input).toString('base64')),
       base64Decode: jest.fn((input) => Buffer.from(input, 'base64').toString())
     };
     
     // LockService
     global.LockService = {
       getScriptLock: jest.fn(() => ({
         tryLock: jest.fn(() => true),
         releaseLock: jest.fn()
       })),
       getDocumentLock: jest.fn(() => ({
         tryLock: jest.fn(() => true),
         releaseLock: jest.fn()
       }))
     };
     
     // Logger
     global.Logger = {
       log: jest.fn(console.log),
       info: jest.fn(console.info),
       warn: jest.fn(console.warn),
       error: jest.fn(console.error)
     };
     
     // Properties
     global.PropertiesService = {
       getScriptProperties: jest.fn(() => ({
         getProperty: jest.fn((key) => `mock_value_for_${key}`),
         setProperty: jest.fn(),
         deleteProperty: jest.fn(),
         getProperties: jest.fn(() => ({}))
       })),
       getUserProperties: jest.fn(() => ({
         getProperty: jest.fn((key) => `mock_user_value_for_${key}`),
         setProperty: jest.fn(),
         deleteProperty: jest.fn(),
         getProperties: jest.fn(() => ({}))
       }))
     };
     ```

3. **Implementação de Testes Unitários**
   - Para cada módulo, desenvolva testes unitários abrangentes com foco em:
     - Cobertura de código (mínimo 80%)
     - Testes de casos de borda e erros
     - Isolamento adequado (use mocks para dependências)
     - Legibilidade e manutenção

   - Exemplo para `yaml-parser.test.ts`:

     ```typescript
     import fs from 'fs';
     import path from 'path';
     import { parseYaml } from '../../../src/core/config/yaml-parser';
     
     // Mock para fs
     jest.mock('fs', () => ({
       readFileSync: jest.fn(),
       existsSync: jest.fn()
     }));
     
     describe('YAML Parser', () => {
       // Redefinir mocks antes de cada teste
       beforeEach(() => {
         jest.clearAllMocks();
       });
       
       test('deve parsear YAML válido corretamente', () => {
         const yamlContent = `
           defaults:
             paths:
               src: ./src
               build: ./build
           projects:
             example:
               src: example
               output: example
         `;
         
         const result = parseYaml(yamlContent);
         
         expect(result).toEqual({
           defaults: {
             paths: {
               src: './src',
               build: './build'
             }
           },
           projects: {
             example: {
               src: 'example',
               output: 'example'
             }
           }
         });
       });
       
       test('deve retornar null para YAML vazio', () => {
         const result = parseYaml('');
         expect(result).toBeNull();
       });
       
       test('deve lançar erro para YAML malformado', () => {
         const yamlContent = `
           defaults:
             - invalid
               yaml: content
         `;
         
         expect(() => parseYaml(yamlContent)).toThrow();
       });
       
       test('deve lidar com arrays no YAML', () => {
         const yamlContent = `
           defaults:
             plugins:
               - name: plugin1
               - name: plugin2
         `;
         
         const result = parseYaml(yamlContent);
         
         expect(result?.defaults?.plugins).toBeInstanceOf(Array);
         expect(result?.defaults?.plugins).toHaveLength(2);
         expect(result?.defaults?.plugins[0].name).toBe('plugin1');
       });
     });
     ```

4. **Implementação de Testes de Integração**
   - Crie testes que garantam a interação correta entre módulos:

     ```typescript
     // tests/integration/config-to-rollup.test.ts
     
     import fs from 'fs';
     import path from 'path';
     import { loadConfig } from '../../src/core/config';
     import { buildInputConfig } from '../../src/rollup/builders/input-builder';
     import { buildOutputConfig } from '../../src/rollup/builders/output-builder';
     import { createPlugins } from '../../src/rollup/builders/plugin-factory';
     
     // Mock para fs
     jest.mock('fs', () => ({
       readFileSync: jest.fn(),
       existsSync: jest.fn(() => true)
     }));
     
     describe('Integração Config -> Rollup', () => {
       beforeEach(() => {
         jest.clearAllMocks();
         
         // Mock de arquivo de configuração
         (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) => {
           if (filePath.includes('config.yml')) {
             return `
               defaults:
                 paths:
                   src: ./src
                   build: ./build
                 rollup:
                   output:
                     format: esm
                   plugins:
                     - name: nodeResolve
                     - name: typescript
               projects:
                 example:
                   src: example
                   output: example
                   rollup:
                     main: main.ts
                     plugins:
                       - name: terser
             `;
           } else if (filePath.includes('schema.json')) {
             return '{}';
           }
           return '';
         });
       });
       
       test('deve gerar configuração Rollup correta a partir da configuração YAML', () => {
         // Carregar configuração
         const { config, paths } = loadConfig({ validate: false });
         
         // Projeto a testar
         const projectKey = 'example';
         const projectConfig = config.projects[projectKey];
         
         // Gerar input config
         const input = buildInputConfig(projectKey, projectConfig, config);
         
         // Verificar input
         expect(input).toHaveProperty(projectKey);
         expect(input[projectKey]).toContain('example/main.ts');
         
         // Gerar plugins
         const outputDir = `${paths.build}/${projectConfig.output}`;
         const plugins = createPlugins(
           config.defaults.rollup?.plugins || [],
           projectConfig.rollup?.plugins || [],
           outputDir
         );
         
         // Verificar plugins
         expect(plugins).toHaveLength(3); // nodeResolve, typescript, terser
         
         // Gerar output
         const output = buildOutputConfig(
           projectKey,
           projectConfig.output,
           paths.build,
           config.defaults.rollup,
           projectConfig.rollup
         );
         
         // Verificar output
         expect(output.format).toBe('esm');
         expect(output.dir).toContain('/build/example');
       });
     });
     ```

5. **Configuração de GitHub Actions**
   - Crie workflows para testes, linting e publicação:

     ```yaml
     # .github/workflows/test.yml
     name: Tests
     
     on:
       push:
         branches: [main, develop]
       pull_request:
         branches: [main, develop]
     
     jobs:
       test:
         runs-on: ubuntu-latest
         
         strategy:
           matrix:
             node-version: [16.x, 18.x, 20.x]
         
         steps:
           - uses: actions/checkout@v3
           
           - name: Setup Node.js ${{ matrix.node-version }}
             uses: actions/setup-node@v3
             with:
               node-version: ${{ matrix.node-version }}
               cache: 'pnpm'
           
           - name: Setup pnpm
             uses: pnpm/action-setup@v2
             with:
               version: 8
           
           - name: Install dependencies
             run: pnpm install
           
           - name: Lint
             run: pnpm lint
           
           - name: Type check
             run: pnpm type-check
           
           - name: Test
             run: pnpm test
           
           - name: Upload coverage reports
             uses: codecov/codecov-action@v3
             with:
               token: ${{ secrets.CODECOV_TOKEN }}
           
           - name: Build
             run: pnpm build
     ```

     ```yaml
     # .github/workflows/publish.yml
     name: Publish Package
     
     on:
       release:
         types: [created]
     
     jobs:
       publish:
         runs-on: ubuntu-latest
         
         steps:
           - uses: actions/checkout@v3
           
           - name: Setup Node.js
             uses: actions/setup-node@v3
             with:
               node-version: '16.x'
               registry-url: 'https://registry.npmjs.org'
               cache: 'pnpm'
           
           - name: Setup pnpm
             uses: pnpm/action-setup@v2
             with:
               version: 8
           
           - name: Install dependencies
             run: pnpm install
           
           - name: Test
             run: pnpm test
           
           - name: Build
             run: pnpm build
           
           - name: Publish
             run: pnpm publish --access public
             env:
               NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
     ```

6. **Relatórios de Cobertura**
   - Configure o Jest para gerar relatórios de cobertura detalhados:

     ```javascript
     // Adição ao jest.config.js
     coverageReporters: ['text', 'lcov', 'clover', 'json'],
     coverageThreshold: {
       global: {
         branches: 80,
         functions: 80,
         lines: 80,
         statements: 80
       }
     },
     ```

7. **Monitoramento de Performance dos Testes**
   - Implemente métricas de performance dos testes:

     ```javascript
     // Adição ao jest.config.js
     reporters: [
       'default',
       ['jest-junit', {
         outputDirectory: './coverage/junit',
         outputName: 'jest-junit.xml',
       }]
     ],
     ```

8. **Integração com Codecov**
   - Configure a integração com Codecov para visualização de cobertura de testes:

     ```bash
     # codecov.yml
     codecov:
       require_ci_to_pass: yes
     
     coverage:
       precision: 2
       round: down
       range: "70...100"
       status:
         project:
           default:
             target: 80%
             threshold: 5%
         patch:
           default:
             target: 80%
     ```

## Fontes de Referência

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [GitHub Actions for Node.js](https://docs.github.com/en/actions/guides/building-and-testing-nodejs)
- [Testing TypeScript with Jest](https://www.typescriptlang.org/docs/handbook/typescript-tooling-in-5-minutes.html#testing-with-jest)
- [Codecov Documentation](https://docs.codecov.io/docs)
- [Mock Functions in Jest](https://jestjs.io/docs/mock-functions)
- [Google Apps Script Testing](https://developers.google.com/apps-script/guides/support/troubleshooting)

## Formato de Saída

Forneça um plano detalhado para a implementação de testes e CI/CD, incluindo:

1. **Estratégia de Testes**
   - Explicação da abordagem de testes unitários e de integração
   - Métricas e objetivos de cobertura
   - Estratégia de mocking para dependências externas

2. **Implementação de Testes**
   - Código completo para testes unitários de pelo menos 3 módulos-chave
   - Código para pelo menos 2 testes de integração
   - Configuração detalhada de mocks

3. **Configuração de CI/CD**
   - Workflows completos do GitHub Actions
   - Explicação do propósito de cada job e step
   - Estratégia para diferentes ambientes (dev/prod)

4. **Métricas e Relatórios**
   - Configuração de relatórios de cobertura
   - Integração com ferramentas externas (Codecov)
   - Alertas e notificações

**Atenção**: Todos os testes devem ser escritos em TypeScript e seguir as melhores práticas de testes. A configuração CI/CD deve ser compatível com pnpm e otimizada para performance.
