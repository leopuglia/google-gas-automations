# Guia de Troubleshooting

> Última atualização: 06/05/2025

## Resumo

Este guia apresenta soluções para problemas comuns encontrados durante o desenvolvimento, build e deploy de projetos com o GAS Builder. Ele aborda desde erros básicos de configuração até questões mais complexas de compatibilidade e performance, fornecendo diagnósticos e soluções práticas.

## Pré-requisitos

- Conhecimento básico do [GAS Builder](./00-introducao-gas-builder.md)
- Familiaridade com o [Google Apps Script](https://developers.google.com/apps-script/)
- Acesso à linha de comando e ferramentas de desenvolvimento

## 1. Problemas de Instalação e Configuração

### 1.1. Falha na Instalação do GAS Builder

**Sintoma**: Erros durante a instalação do GAS Builder.

**Possíveis Causas e Soluções**:

1. **Versão do Node.js incompatível**

   ```log
   Error: The module was compiled against Node.js 18.x
   ```

   **Solução**: Instale a versão correta do Node.js (recomendado 18.x ou superior).

   ```bash
   # Verificar versão atual
   node -v
   
   # Instalar nvm para gerenciar versões do Node
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
   
   # Instalar e usar Node.js 18
   nvm install 18
   nvm use 18
   ```

2. **Dependências faltantes**

   ```log
   Error: Cannot find module 'rollup'
   ```

   **Solução**: Reinstale as dependências.

   ```bash
   pnpm install
   ```

3. **Problemas de permissão**

   ```log
   Error: EACCES: permission denied
   ```

   **Solução**: Verifique permissões ou use sudo (não recomendado) ou ajuste permissões do npm.

   ```bash
   # Melhor opção: ajustar permissões
   mkdir -p ~/.npm-global
   pnpm config set prefix '~/.npm-global'
   export PATH=~/.npm-global/bin:$PATH
   # Adicione a linha acima ao seu .bashrc ou .zshrc
   ```

### 1.2. Problemas com o Clasp

**Sintoma**: Erros ao usar o Clasp para interagir com o Google Apps Script.

**Possíveis Causas e Soluções**:

1. **Autenticação falhou**

   ```log
   Error: No credentials. Run 'clasp login'.
   ```

   **Solução**: Faça login com o Clasp.

   ```bash
   pnpm clasp login
   ```

2. **Clasp não encontrado**

   ```log
   Command not found: clasp
   ```

   **Solução**: Instale o Clasp globalmente ou use-o através do pnpm.

   ```bash
   # Opção 1: Instalar globalmente
   pnpm add -g @google/clasp
   
   # Opção 2: Usar através do pnpm
   pnpm clasp <comando>
   ```

3. **Erro de manifesto ou configuração**

   ```log
   Error: Could not read manifest file. Check .clasp.json
   ```

   **Solução**: Verifique se o arquivo .clasp.json existe e está correto.

   ```bash
   # Verifique o conteúdo
   cat .clasp.json
   
   # Exemplo de conteúdo correto
   {
     "scriptId": "1abc123def456ghij789klmno",
     "rootDir": "build"
   }
   ```

## 2. Problemas de Build

### 2.1. Falhas no Processo de Build

**Sintoma**: Erros durante a execução de `pnpm build`.

**Possíveis Causas e Soluções**:

1. **Erros de TypeScript**

   ```log
   TS2304: Cannot find name 'SpreadsheetApp'.
   ```

   **Solução**: Importe os tipos do Google Apps Script.

   ```typescript
   // Adicione no topo do arquivo
   import { SpreadsheetApp } from 'google-apps-script-types';
   
   // Ou verifique se você está usando a extensão @types/google-apps-script
   // pnpm add -D @types/google-apps-script
   ```

2. **Erros de resolução de módulos**

   ```log
   Error: Could not resolve '@core/config' from 'src/plugins/sheets/index.ts'
   ```

   **Solução**: Verifique os caminhos de importação e a configuração de aliases.

   ```typescript
   // Verifique o tsconfig.json para aliases
   /*
   {
     "compilerOptions": {
       "paths": {
         "@core/*": ["src/core/*"]
       }
     }
   }
   */
   
   // Use o caminho relativo se necessário
   import { config } from '../../core/config';
   ```

3. **Erros de plugins do Rollup**

   ```log
   Error: Cannot find module '@rollup/plugin-typescript'
   ```

   **Solução**: Instale os plugins necessários.

   ```bash
   pnpm add -D @rollup/plugin-typescript @rollup/plugin-node-resolve @rollup/plugin-commonjs rollup-plugin-terser
   ```

### 2.2. Problemas de Tamanho do Bundle

**Sintoma**: O bundle gerado é maior que o limite do Google Apps Script (50 MB).

**Possíveis Causas e Soluções**:

1. **Dependências muito grandes**

   **Solução**: Reduza dependências ou use alternativas mais leves.

   ```typescript
   // Evite importar bibliotecas inteiras
   // Ruim
   import * as lodash from 'lodash';
   
   // Bom
   import { debounce, throttle } from 'lodash';
   
   // Ainda melhor: implementar funções simples diretamente
   function debounce(fn, wait) {
     // Implementação simplificada
   }
   ```

2. **Código não otimizado**

   **Solução**: Use plugins de minificação e otimização.

   ```javascript
   // rollup.config.js
   import { terser } from 'rollup-plugin-terser';
   
   export default {
     // ...
     plugins: [
       // ...
       terser({
         compress: {
           drop_console: true
         }
       })
     ]
   };
   ```

3. **Múltiplos arquivos grandes**

   **Solução**: Divida seu código em múltiplos projetos GAS.

   ```javascript
   // Crie projetos separados para funcionalidades diferentes
   // Projeto 1: core.gas
   // Projeto 2: ui.gas
   // Projeto 3: automation.gas
   ```

## 3. Problemas de Deploy

### 3.1. Falhas no Deploy para o Google Apps Script

**Sintoma**: Erros ao fazer deploy com `pnpm deploy`.

**Possíveis Causas e Soluções**:

1. **Erro de permissão**

   ```log
   Error: Permission denied. You need edit access to this script.
   ```

   **Solução**: Verifique se você tem acesso de edição ao projeto.
   - Acesse o projeto no [Google Apps Script](https://script.google.com/)
   - Verifique se seu email tem acesso de edição
   - Peça ao proprietário para conceder acesso se necessário

2. **Limite de tamanho do script**

   ```log
   Error: Exceeded maximum script size.
   ```

   **Solução**: Reduza o tamanho do seu script ou divida em múltiplos.
   - Remova código não utilizado
   - Otimize importações
   - Divida em projetos separados e use bibliotecas

3. **Erro de token expirado**

   ```log
   Error: Invalid Credentials. Run 'clasp login' to reset credentials.
   ```

   **Solução**: Faça login novamente.

   ```bash
   pnpm clasp login
   ```

### 3.2. Problemas após Deploy

**Sintoma**: O script funciona localmente, mas falha após o deploy.

**Possíveis Causas e Soluções**:

1. **Recursos incompatíveis com GAS**

   ```log
   TypeError: Cannot read property 'apply' of undefined
   ```

   **Solução**: Evite recursos JavaScript modernos não suportados pelo GAS.
   - Substitua arrow functions por funções tradicionais em certos casos
   - Evite desestruturação complexa
   - Verifique a [documentação de compatibilidade](https://developers.google.com/apps-script/guides/services/)

2. **Problemas com escopos de autorização**

   ```log
   Exception: You do not have permission to access SpreadsheetApp
   ```

   **Solução**: Adicione os escopos necessários ao seu manifesto.

   ```json
   // appsscript.json
   {
     "timeZone": "America/Sao_Paulo",
     "dependencies": {
     },
     "exceptionLogging": "STACKDRIVER",
     "oauthScopes": [
       "https://www.googleapis.com/auth/spreadsheets",
       "https://www.googleapis.com/auth/script.container.ui"
     ]
   }
   ```

3. **Variáveis e funções globais**

   ```typescript
   ReferenceError: processData is not defined
   ```

   **Solução**: Garanta que as funções estejam expostas globalmente.

   ```typescript
   // Em TypeScript, exporte explicitamente para o escopo global
   function processData() {
     // Implementação
   }
   
   // Exporte para o escopo global
   export { processData };
   ```

## 4. Problemas de Runtime

### 4.1. Erros de Execução no Google Apps Script

**Sintoma**: Erros quando o script é executado no ambiente GAS.

**Possíveis Causas e Soluções**:

1. **Tempo limite excedido**

   ```log
   Error: Exceeded maximum execution time
   ```

   **Solução**: Otimize o código ou divida em execuções menores.

   ```javascript
   // Use gatilhos de tempo para continuar execuções longas
   function startProcess() {
     const state = PropertiesService.getScriptProperties();
     state.setProperty('currentIndex', '0');
     processNextBatch();
   }
   
   function processNextBatch() {
     const state = PropertiesService.getScriptProperties();
     const index = parseInt(state.getProperty('currentIndex'), 10);
     
     // Processa um lote
     // ...
     
     // Configura o próximo lote
     state.setProperty('currentIndex', String(index + 100));
     
     // Verifica se ainda há trabalho a fazer
     if (index < totalItems) {
       // Programa a próxima execução
       ScriptApp.newTrigger('processNextBatch')
         .timeBased()
         .after(1000)
         .create();
     }
   }
   ```

2. **Limites de cotas do Google Apps Script**

   ```log
   Error: Service invoked too many times in a short time: [service]
   ```

   **Solução**: Implemente exponential backoff e caching.

   ```javascript
   // Implementação de exponential backoff
   function callWithBackoff(func, maxRetries = 5) {
     let retries = 0;
     while (retries < maxRetries) {
       try {
         return func();
       } catch (e) {
         if (e.toString().includes('invoked too many times')) {
           const waitTime = Math.pow(2, retries) * 1000 + Math.random() * 1000;
           Utilities.sleep(waitTime);
           retries++;
         } else {
           throw e;
         }
       }
     }
     throw new Error('Maximum retries exceeded');
   }
   
   // Uso
   const result = callWithBackoff(() => {
     return SpreadsheetApp.openById(id).getSheets();
   });
   ```

3. **Falhas em APIs externas**

   ```log
   Error: Invalid argument: [URL]
   ```

   **Solução**: Implemente validação robusta e tratamento de erros.

   ```javascript
   function fetchExternalData(url) {
     try {
       // Validar URL
       if (!url.startsWith('https://')) {
         throw new Error('URL must use HTTPS protocol');
       }
       
       // Tentar chamada com tratamento de erro
       const response = UrlFetchApp.fetch(url, {
         muteHttpExceptions: true
       });
       
       if (response.getResponseCode() !== 200) {
         throw new Error(`HTTP error: ${response.getResponseCode()}`);
       }
       
       return JSON.parse(response.getContentText());
     } catch (error) {
       console.error(`Error fetching data: ${error.message}`);
       // Retornar dados de fallback ou relancar
       return null;
     }
   }
   ```

### 4.2. Problemas de Performance

**Sintoma**: Script lento ou ineficiente.

**Possíveis Causas e Soluções**:

1. **Muitas chamadas de API**

   **Solução**: Minimize chamadas de API e use operações em lote.

   ```javascript
   // Ruim: Muitas chamadas individuais
   const sheet = SpreadsheetApp.getActiveSheet();
   for (let i = 0; i < 100; i++) {
     sheet.getRange(i+1, 1).setValue(i);
   }
   
   // Bom: Uma única operação em lote
   const sheet = SpreadsheetApp.getActiveSheet();
   const values = Array(100).fill().map((_, i) => [i]);
   sheet.getRange(1, 1, 100, 1).setValues(values);
   ```

2. **Loops ineficientes**

   **Solução**: Otimize loops e processamento de dados.

   ```javascript
   // Ruim: Processamento ineficiente
   const sheet = SpreadsheetApp.getActiveSheet();
   const lastRow = sheet.getLastRow();
   let sum = 0;
   for (let i = 1; i <= lastRow; i++) {
     sum += sheet.getRange(i, 1).getValue();
   }
   
   // Bom: Obter todos os valores de uma vez
   const sheet = SpreadsheetApp.getActiveSheet();
   const lastRow = sheet.getLastRow();
   const values = sheet.getRange(1, 1, lastRow, 1).getValues();
   const sum = values.reduce((acc, [val]) => acc + val, 0);
   ```

3. **Funções pesadas chamadas frequentemente**

   **Solução**: Implemente memoização para funções caras.

   ```javascript
   // Função de memoização
   function memoize(fn) {
     const cache = {};
     return function(...args) {
       const key = JSON.stringify(args);
       if (cache[key] === undefined) {
         cache[key] = fn(...args);
       }
       return cache[key];
     };
   }
   
   // Uso
   const expensiveCalculation = memoize(function(id) {
     // Cálculo caro ou chamada de API
     return DriveApp.getFileById(id).getBlob().getDataAsString();
   });
   ```

## 5. Problemas de Teste

### 5.1. Falhas em Testes Unitários

**Sintoma**: Testes falham durante a execução de `pnpm test`.

**Possíveis Causas e Soluções**:

1. **Mocks inadequados para Google Apps Script**

   ```log
   TypeError: Cannot read property 'getActiveSpreadsheet' of undefined
   ```

   **Solução**: Configure mocks apropriados para o GAS.

   ```javascript
   // tests/mocks/gas.mock.js
   global.SpreadsheetApp = {
     getActiveSpreadsheet: jest.fn().mockReturnValue({
       getSheets: jest.fn().mockReturnValue([]),
       getSheetByName: jest.fn().mockImplementation(name => ({
         name,
         getRange: jest.fn().mockImplementation((row, col, numRows, numCols) => ({
           setValue: jest.fn(),
           setValues: jest.fn(),
           getValues: jest.fn().mockReturnValue([[]]),
         })),
       })),
     }),
   };
   
   // Configurar em jest.config.js
   // setupFiles: ['<rootDir>/tests/mocks/gas.mock.js']
   ```

2. **Problemas de importação em testes**

   ```log
   Error: Jest encountered an unexpected token
   ```

   **Solução**: Configure o Jest para processar TypeScript corretamente.

   ```javascript
   // jest.config.js
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     transform: {
       '^.+\\.tsx?$': ['ts-jest', {
         tsconfig: 'tsconfig.json'
       }]
     }
   };
   ```

3. **Testes temporais falham intermitentemente**

   ```log
   Error: Timeout - Async callback was not invoked within timeout
   ```

   **Solução**: Aumente os timeouts ou use jest.useFakeTimers().

   ```javascript
   // Aumentar timeout para um teste específico
   test('operação longa', async () => {
     // Teste aqui
   }, 10000); // 10 segundos
   
   // Ou usar timers falsos
   beforeEach(() => {
     jest.useFakeTimers();
   });
   
   test('com timer', () => {
     const callback = jest.fn();
     setTimeout(callback, 1000);
     jest.runAllTimers();
     expect(callback).toHaveBeenCalledTimes(1);
   });
   ```

### 5.2. Problemas com Testes de Integração

**Sintoma**: Testes de integração falham ou são inconsistentes.

**Possíveis Causas e Soluções**:

1. **Dependências externas indisponíveis**

   **Solução**: Use mocks ou serviços de teste dedicados.

   ```javascript
   // Isolar testes de integração em arquivos separados
   // e executá-los condicionalmente
   
   if (process.env.RUN_INTEGRATION_TESTS) {
     describe('Integração com Sheets API', () => {
       // Testes aqui
     });
   }
   ```

2. **Estado inconsistente entre testes**

   **Solução**: Isolamento e limpeza de estado entre testes.

   ```javascript
   // Garantir isolamento de testes
   beforeEach(async () => {
     // Configurar ambiente limpo
     await setupCleanTestEnvironment();
   });
   
   afterEach(async () => {
     // Limpar recursos criados
     await cleanupTestResources();
   });
   ```

## 6. Problemas Comuns do Google Apps Script

### 6.1. Questões de Autorização

**Sintoma**: Permissões negadas ou autorização falha.

**Possíveis Causas e Soluções**:

1. **Escopos insuficientes**

   ```log
   Exception: You do not have permission to call DriveApp.getFiles
   ```

   **Solução**: Adicione os escopos necessários ao manifesto.

   ```json
   // appsscript.json
   {
     "oauthScopes": [
       "https://www.googleapis.com/auth/drive",
       "https://www.googleapis.com/auth/spreadsheets"
     ]
   }
   ```

2. **Necessidade de reautorização após mudanças**

   **Solução**: Reautorize manualmente após adicionar novos escopos.
   - Acesse o script via editor web do Google Apps Script
   - Execute qualquer função
   - Aceite os novos pedidos de permissão

### 6.2. Limites do Google Apps Script

**Sintoma**: Erros relacionados a limites de serviço.

**Possíveis Causas e Soluções**:

1. **Limite de tempo de execução (6 minutos)**

   **Solução**: Divida em execuções menores com acionadores.

   ```javascript
   function startLongProcess() {
     PropertiesService.getScriptProperties().setProperty('progress', '0');
     ScriptApp.newTrigger('continueLongProcess')
       .timeBased()
       .after(1)
       .create();
   }
   
   function continueLongProcess() {
     const props = PropertiesService.getScriptProperties();
     const progress = parseInt(props.getProperty('progress'), 10);
     
     // Processar mais uma parte
     // ...
     
     // Atualizar progresso
     props.setProperty('progress', String(progress + 1));
     
     // Se necessário, agendar mais uma parte
     if (progress < totalParts) {
       ScriptApp.newTrigger('continueLongProcess')
         .timeBased()
         .after(1)
         .create();
     }
   }
   ```

2. **Limite de tamanho de dados (50MB)**

   **Solução**: Divida dados grandes ou use armazenamento externo.

   ```javascript
   // Para dados muito grandes, use o Drive como armazenamento
   function saveData(data) {
     const blob = Utilities.newBlob(
       JSON.stringify(data),
       'application/json',
       'data.json'
     );
     
     // Salvar ou atualizar arquivo no Drive
     const existingFile = getDataFile();
     if (existingFile) {
       return existingFile.setContent(blob.getDataAsString());
     } else {
       return DriveApp.createFile(blob);
     }
   }
   
   function getDataFile() {
     const files = DriveApp.getFilesByName('data.json');
     return files.hasNext() ? files.next() : null;
   }
   
   function loadData() {
     const file = getDataFile();
     if (!file) return null;
     return JSON.parse(file.getBlob().getDataAsString());
   }
   ```

## 7. Diagnóstico e Depuração

### 7.1. Técnicas de Depuração

1. **Logging com Console.log/Logger**

   ```javascript
   function processItem(item) {
     console.log('Processando item:', item);
     // ou
     Logger.log('Processando item: %s', JSON.stringify(item));
     
     // Implementação
     
     console.log('Item processado com resultado:', result);
     return result;
   }
   ```

2. **Depuração via Editor Web**
   - Acesse o [Editor do Google Apps Script](https://script.google.com/)
   - Use a opção "Debug" ou "Depurar" para executar com breakpoints
   - Verifique a saída do Logger em "View > Logs" ou "Visualizar > Logs"

3. **Técnicas de depuração avançada**

   ```javascript
   function debugObject(obj, label = 'Objeto') {
     Logger.log('===== DEBUG: %s =====', label);
     try {
       Logger.log(JSON.stringify(obj, null, 2));
     } catch (e) {
       Logger.log('Não foi possível serializar. Keys: %s', Object.keys(obj).join(', '));
       
       // Tentar exibir propriedades individualmente
       Object.keys(obj).forEach(key => {
         try {
           Logger.log(' - %s: %s', key, JSON.stringify(obj[key]));
         } catch (e) {
           Logger.log(' - %s: [Não serializável]', key);
         }
       });
     }
     Logger.log('========================');
   }
   ```

### 7.2. Ferramentas de Diagnóstico

1. **Verificador de Projeto**

   Ferramenta de linha de comando para verificar problemas comuns:

   ```bash
   pnpm gas-builder check
   ```

2. **Análise de Desempenho**

   ```javascript
   // Ferramenta simples de profiling
   function profileFunction(fn, label) {
     const start = new Date().getTime();
     const result = fn();
     const end = new Date().getTime();
     Logger.log('Perfil [%s]: %d ms', label, end - start);
     return result;
   }
   
   // Uso
   const result = profileFunction(() => {
     return heavyOperation();
   }, 'heavyOperation');
   ```

## Próximos Passos

- Consulte o [FAQ](./13-faq.md) para perguntas frequentes
- Explore a [Referência de Configuração YAML](./20-ref-configuracao-yaml.md)
- Veja o [Guia de Início Rápido](./10-guia-inicio-rapido.md) para verificar etapas de configuração inicial

## Referências

- [Google Apps Script - Runtime Limitations](https://developers.google.com/apps-script/guides/services/quotas)
- [Clasp - GitHub Repository](https://github.com/google/clasp)
- [TypeScript Troubleshooting](https://www.typescriptlang.org/docs/handbook/declaration-files/troubleshooting.html)
- [Rollup.js Documentation](https://rollupjs.org/guide/en/)
- [Jest Testing Framework](https://jestjs.io/docs/troubleshooting)
