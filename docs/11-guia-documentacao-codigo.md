# Guia de Documentação de Código

> Última atualização: 06/05/2025

## Resumo

Este guia estabelece os padrões e melhores práticas para documentação de código no projeto GAS Builder, incluindo comentários de código, JSDoc, exemplos de uso e organização. Uma documentação clara e consistente é essencial para a manutenibilidade e colaboração eficaz no projeto.

## Pré-requisitos

- Conhecimento básico de [TypeScript](https://www.typescriptlang.org/)
- Familiaridade com [JSDoc](https://jsdoc.app/)
- Conhecimento do [Google Apps Script](https://developers.google.com/apps-script/)
- IDE com suporte a TypeScript (VS Code recomendado)

## 1. Princípios da Documentação de Código

### 1.1. Objetivos

A documentação de código no GAS Builder tem os seguintes objetivos:

- **Clareza**: Comunicar claramente a intenção e comportamento de cada componente
- **Completude**: Documentar todos os componentes públicos e suas interfaces
- **Precisão**: Garantir que a documentação reflita o comportamento atual do código
- **Usabilidade**: Facilitar o uso dos componentes por outros desenvolvedores
- **Manutenibilidade**: Facilitar futuras atualizações no código e na documentação

### 1.2. Quando Documentar

- **Sempre documentar**:
  - Interfaces e tipos públicos
  - Funções e métodos públicos
  - Classes e módulos
  - Parâmetros de configuração
  - Comportamentos não óbvios ou complexos
  - Decisões de arquitetura importantes

- **Frequentemente documentar**:
  - Implementações privadas complexas
  - Algoritmos e lógica de negócio
  - Workarounds e soluções temporárias

- **Raramente necessário documentar**:
  - Código trivial e autoexplicativo
  - Implementações privadas simples
  - Variáveis temporárias de escopo limitado

## 2. Formato de Documentação

### 2.1. Comentários JSDoc

Utilize JSDoc para documentar todos os elementos públicos:

```typescript
/**
 * Processa uma planilha do Google e extrai informações relevantes.
 * 
 * Esta função é o ponto de entrada principal para processamento de dados
 * de planilhas, identificando automaticamente o formato e aplicando as
 * transformações necessárias.
 * 
 * @param {string} spreadsheetId - ID da planilha do Google a ser processada
 * @param {ProcessOptions} options - Opções de processamento
 * @returns {ProcessResult} Resultado do processamento contendo dados extraídos
 * @throws {InvalidSpreadsheetError} Se a planilha não for encontrada ou estiver inacessível
 * @throws {ProcessingError} Se ocorrer um erro durante o processamento
 * 
 * @example
 * // Processar uma planilha com opções padrão
 * const result = processSpreadsheet('1abc123def456ghij789klmno');
 * 
 * @example
 * // Processar com opções personalizadas
 * const result = processSpreadsheet('1abc123def456ghij789klmno', {
 *   sheetNames: ['Dados', 'Resumo'],
 *   includeFormulas: true,
 *   dateFormat: 'yyyy-MM-dd'
 * });
 */
function processSpreadsheet(spreadsheetId: string, options?: ProcessOptions): ProcessResult {
  // Implementação...
}
```

### 2.2. Documentação de Interfaces e Tipos

```typescript
/**
 * Opções para processamento de planilhas.
 * 
 * @interface
 */
interface ProcessOptions {
  /**
   * Nomes das abas a serem processadas.
   * Se não for fornecido, todas as abas serão processadas.
   */
  sheetNames?: string[];
  
  /**
   * Se deve incluir fórmulas nos resultados (true) ou apenas valores (false).
   * @default false
   */
  includeFormulas?: boolean;
  
  /**
   * Formato para valores de data.
   * @default 'dd/MM/yyyy'
   */
  dateFormat?: string;
}

/**
 * Resultado do processamento de uma planilha.
 * 
 * @interface
 */
interface ProcessResult {
  /**
   * Dados extraídos, organizados por nome da aba.
   */
  data: Record<string, any[][]>;
  
  /**
   * Metadados da planilha processada.
   */
  metadata: SpreadsheetMetadata;
  
  /**
   * Timestamp do processamento.
   */
  processedAt: Date;
}
```

### 2.3. Documentação de Classes

```typescript
/**
 * Gerenciador de configuração para projetos GAS Builder.
 * 
 * Responsável por carregar, validar e fornecer acesso às
 * configurações do projeto a partir de arquivos YAML.
 * 
 * @class
 */
class ConfigManager {
  /**
   * Cria uma nova instância do gerenciador de configuração.
   * 
   * @param {ConfigOptions} options - Opções de configuração
   */
  constructor(options?: ConfigOptions) {
    // Implementação...
  }
  
  /**
   * Carrega configuração de um arquivo YAML.
   * 
   * @param {string} filePath - Caminho para o arquivo de configuração
   * @returns {Promise<Config>} Configuração carregada e validada
   * @throws {ConfigLoadError} Se o arquivo não puder ser carregado
   * @throws {ConfigValidationError} Se a configuração for inválida
   */
  async loadConfig(filePath: string): Promise<Config> {
    // Implementação...
  }
  
  /**
   * Valida uma configuração conforme o schema.
   * 
   * @param {Config} config - Configuração a ser validada
   * @returns {ValidationResult} Resultado da validação
   */
  validateConfig(config: Config): ValidationResult {
    // Implementação...
  }
}
```

### 2.4. Documentação de Módulos

Cada arquivo de módulo deve começar com um comentário JSDoc:

```typescript
/**
 * @fileoverview Módulo para processamento de planilhas do Google.
 * 
 * Este módulo contém funções e classes para interagir com planilhas
 * do Google, extrair dados e aplicar transformações.
 * 
 * @module spreadsheet
 */

// Importações e código do módulo...
```

### 2.5. Documentação de Variáveis de Ambiente e Configuração

```typescript
/**
 * Configurações de ambiente.
 * 
 * @namespace
 */
export const ENV = {
  /**
   * Modo de operação do sistema.
   * Valores possíveis: 'development', 'test', 'production'
   * 
   * @default 'development'
   */
  MODE: process.env.NODE_ENV || 'development',
  
  /**
   * Nível de log.
   * Valores possíveis: 'error', 'warn', 'info', 'debug', 'trace'
   * 
   * @default 'info'
   */
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  /**
   * ID da planilha de configuração.
   * Obrigatório para ambientes de produção e teste.
   */
  CONFIG_SPREADSHEET_ID: process.env.CONFIG_SPREADSHEET_ID
};
```

## 3. Padrões de Documentação

### 3.1. Padrão de Comentários

- Use comentários JSDoc para documentação formal
- Use comentários de linha (`//`) para explicações em linha
- Use comentários de bloco (`/* */`) para desativar código temporariamente ou para documentação informal de blocos

### 3.2. Estrutura de Comentários JSDoc

A estrutura recomendada para comentários JSDoc é:

1. **Descrição curta** (primeira linha)
2. **Descrição longa** (parágrafo opcional após linha em branco)
3. **Tags JSDoc**:
   - `@param` para documentar parâmetros
   - `@returns` para documentar valor de retorno
   - `@throws` para documentar exceções
   - `@example` para exemplos de uso
   - Outras tags conforme necessário

### 3.3. Convenções de Nomenclatura

- Use nomes descritivos e significativos para variáveis, funções e classes
- Siga as convenções de caso:
  - `camelCase` para variáveis e funções
  - `PascalCase` para classes, interfaces e tipos
  - `UPPER_SNAKE_CASE` para constantes

### 3.4. Dicas e TODOs

Use comentários especiais para marcar tarefas pendentes:

```typescript
// TODO: Implementar validação de formato de data
// FIXME: Corrigir bug de processamento para células vazias
// NOTE: Esta implementação é temporária e será substituída na v2.0
// HACK: Workaround para limitação da API do Google
```

## 4. Documentação Específica para Google Apps Script

### 4.1. Funções Expostas Globalmente

Para funções que serão expostas globalmente no Google Apps Script:

```typescript
/**
 * Processa a planilha ativa.
 * 
 * Esta função é exposta globalmente no Google Apps Script e pode
 * ser chamada diretamente do menu ou de um gatilho.
 * 
 * @global
 * @function processActiveSpreadsheet
 * @customfunction
 */
function processActiveSpreadsheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  // Implementação...
}

// Garantir que a função seja exportada globalmente
export { processActiveSpreadsheet };
```

### 4.2. Funções Personalizadas

Para funções personalizadas que podem ser usadas em fórmulas:

```typescript
/**
 * Extrai o domínio de um endereço de email.
 * 
 * @param {string} email - Endereço de email
 * @returns {string} Domínio do email
 * 
 * @global
 * @customfunction
 * @example
 * =EXTRACT_DOMAIN("usuario@exemplo.com") // Retorna "exemplo.com"
 */
function EXTRACT_DOMAIN(email: string): string {
  return email.split('@')[1] || '';
}

// Exportação global
export { EXTRACT_DOMAIN };
```

### 4.3. Documentação de Menus e Interfaces de Usuário

```typescript
/**
 * Cria o menu personalizado na interface do Google Sheets.
 * 
 * @global
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('GAS Builder')
    .addItem('Processar Dados', 'processActiveSpreadsheet')
    .addSeparator()
    .addSubMenu(ui.createMenu('Configurações')
      .addItem('Definir Parâmetros', 'showConfigDialog')
      .addItem('Limpar Configuração', 'clearConfig'))
    .addToUi();
}

// Exportação global
export { onOpen };
```

## 5. Documentação de Testes

### 5.1. Documentação de Testes Unitários

Cada arquivo de teste deve documentar claramente o que está sendo testado:

```typescript
/**
 * @fileoverview Testes para o módulo de processamento de planilhas.
 * 
 * Estes testes verificam o comportamento do módulo em várias condições,
 * incluindo casos de erro e edge cases.
 */

import { processSpreadsheet } from '../src/spreadsheet';
import { jest } from '@jest/globals';

describe('processSpreadsheet', () => {
  /**
   * Verifica se a função processa corretamente uma planilha válida
   * com as opções padrão.
   */
  test('deve processar planilha válida com opções padrão', () => {
    // Arranjo
    const mockSpreadsheet = { /* ... */ };
    
    // Ação
    const result = processSpreadsheet('valid-id');
    
    // Asserção
    expect(result).toBeDefined();
    expect(result.data).toHaveProperty('Sheet1');
  });
  
  /**
   * Verifica se a função lança exceção apropriada quando a
   * planilha não é encontrada.
   */
  test('deve lançar InvalidSpreadsheetError para ID inválido', () => {
    // Asserção
    expect(() => processSpreadsheet('invalid-id')).toThrow('InvalidSpreadsheetError');
  });
});
```

### 5.2. Documentação de Mocks

Documente claramente os mocks utilizados nos testes:

```typescript
/**
 * Mock do objeto SpreadsheetApp para testes.
 * 
 * Este mock simula o comportamento básico do SpreadsheetApp
 * do Google Apps Script para permitir testes unitários.
 */
const mockSpreadsheetApp = {
  /**
   * Retorna um mock da planilha ativa.
   */
  getActiveSpreadsheet: jest.fn().mockReturnValue({
    /**
     * Retorna um mock da lista de abas.
     */
    getSheets: jest.fn().mockReturnValue([
      /* ... mocks de abas ... */
    ]),
    
    /**
     * Retorna um mock de uma aba específica.
     */
    getSheetByName: jest.fn().mockImplementation(name => {
      /* ... mock de aba ... */
    })
  })
};

// Substituir o objeto global
global.SpreadsheetApp = mockSpreadsheetApp;
```

## 6. Ferramentas e Integração com IDE

### 6.1. Configuração do TypeDoc

O projeto utiliza [TypeDoc](https://typedoc.org/) para gerar documentação a partir dos comentários JSDoc:

```json
// typedoc.json
{
  "entryPoints": ["./src/index.ts"],
  "out": "docs/api",
  "categorizeByGroup": true,
  "categoryOrder": ["Core", "Plugins", "Utils", "*"],
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeExternals": true,
  "readme": "none",
  "name": "GAS Builder API",
  "includeVersion": true
}
```

Para gerar a documentação:

```bash
pnpm docs:generate
```

### 6.2. Configuração do ESLint para Documentação

O projeto utiliza regras específicas do ESLint para garantir a qualidade da documentação:

```javascript
// .eslintrc.js
module.exports = {
  // Outras configurações...
  rules: {
    // Regras para documentação JSDoc
    'jsdoc/require-description': 'warn',
    'jsdoc/require-param-description': 'warn',
    'jsdoc/require-returns-description': 'warn',
    'jsdoc/require-jsdoc': [
      'warn',
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
          FunctionExpression: false
        }
      }
    ]
  },
  plugins: [
    // Outros plugins...
    'jsdoc'
  ],
  extends: [
    // Outras extensões...
    'plugin:jsdoc/recommended'
  ]
};
```

### 6.3. Integração com VS Code

Configurações recomendadas para o VS Code:

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "typescript.implementationsCodeLens.enabled": true,
  "typescript.referencesCodeLens.enabled": true,
  "typescript.suggest.completeFunctionCalls": true,
  "javascript.suggest.jsdoc.generateReturns": true,
  "javascript.suggest.completeJSDocs": true
}
```

## 7. Exemplos de Documentação Completa

### 7.1. Exemplo de Classe com Documentação Completa

```typescript
/**
 * Gerenciador de configuração para projetos do GAS Builder.
 * 
 * Esta classe é responsável por carregar, validar e fornecer acesso
 * às configurações do projeto a partir de arquivos YAML.
 * 
 * @class
 */
export class ConfigManager {
  private config: Config | null = null;
  private readonly schema: JSONSchema7;
  private readonly validator: Ajv;
  
  /**
   * Cria uma nova instância do gerenciador de configuração.
   * 
   * @param {ConfigManagerOptions} [options] - Opções de inicialização
   */
  constructor(options?: ConfigManagerOptions) {
    this.schema = options?.schema || DEFAULT_SCHEMA;
    this.validator = new Ajv({ allErrors: true });
    
    if (options?.configPath) {
      this.loadConfigSync(options.configPath);
    }
  }
  
  /**
   * Carrega configuração de forma síncrona a partir de um arquivo YAML.
   * 
   * @param {string} filePath - Caminho para o arquivo de configuração
   * @returns {Config} Configuração carregada e validada
   * @throws {ConfigLoadError} Se o arquivo não puder ser carregado
   * @throws {ConfigValidationError} Se a configuração for inválida
   */
  loadConfigSync(filePath: string): Config {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const parsedConfig = yaml.parse(fileContent) as Config;
      
      const validationResult = this.validateConfig(parsedConfig);
      if (!validationResult.valid) {
        throw new ConfigValidationError('Configuração inválida', validationResult.errors);
      }
      
      this.config = parsedConfig;
      return parsedConfig;
    } catch (error) {
      if (error instanceof ConfigValidationError) {
        throw error;
      }
      throw new ConfigLoadError(`Erro ao carregar configuração: ${error.message}`, error);
    }
  }
  
  /**
   * Valida uma configuração conforme o schema.
   * 
   * @param {Config} config - Configuração a ser validada
   * @returns {ValidationResult} Resultado da validação
   */
  validateConfig(config: Config): ValidationResult {
    const validate = this.validator.compile(this.schema);
    const valid = validate(config);
    
    return {
      valid: valid === true,
      errors: validate.errors || []
    };
  }
  
  /**
   * Obtém a configuração de um projeto específico.
   * 
   * @param {string} projectId - ID do projeto
   * @returns {ProjectConfig | null} Configuração do projeto ou null se não encontrado
   * @throws {ConfigNotLoadedError} Se nenhuma configuração foi carregada
   */
  getProjectConfig(projectId: string): ProjectConfig | null {
    if (!this.config) {
      throw new ConfigNotLoadedError('Nenhuma configuração foi carregada');
    }
    
    return this.config.projects[projectId] || null;
  }
}
```

### 7.2. Exemplo de Arquivo de Módulo Completo

```typescript
/**
 * @fileoverview Módulo de utilidades para planilhas do Google.
 * 
 * Este módulo contém funções auxiliares para manipulação de planilhas
 * do Google, incluindo operações comuns como cópia, proteção e formatação.
 * 
 * @module spreadsheet-utils
 */

import { SpreadsheetApp, Sheet, Range } from 'google-apps-script-types';

/**
 * Opções para copiar intervalos entre planilhas.
 * 
 * @interface
 */
export interface CopyRangeOptions {
  /**
   * Se deve copiar formatação.
   * @default true
   */
  copyFormatting?: boolean;
  
  /**
   * Se deve copiar fórmulas (true) ou apenas valores (false).
   * @default true
   */
  copyFormulas?: boolean;
  
  /**
   * Se deve limpar o conteúdo do intervalo de destino antes da cópia.
   * @default false
   */
  clearDestination?: boolean;
}

/**
 * Copia um intervalo de uma planilha para outra.
 * 
 * @param {Sheet} sourceSheet - Aba de origem
 * @param {string} sourceRange - Intervalo de origem (ex: "A1:C10")
 * @param {Sheet} destSheet - Aba de destino
 * @param {string} destRange - Intervalo de destino (ex: "D5:F14")
 * @param {CopyRangeOptions} [options] - Opções de cópia
 * @returns {Range} O intervalo de destino após a cópia
 * @throws {Error} Se os intervalos tiverem dimensões diferentes
 * 
 * @example
 * // Copiar valores de Dados!A1:C10 para Resumo!D5:F14
 * const sourceSheet = ss.getSheetByName('Dados');
 * const destSheet = ss.getSheetByName('Resumo');
 * copyRange(sourceSheet, 'A1:C10', destSheet, 'D5:F14');
 */
export function copyRange(
  sourceSheet: Sheet,
  sourceRange: string,
  destSheet: Sheet,
  destRange: string,
  options: CopyRangeOptions = {}
): Range {
  // Valores padrão para opções
  const {
    copyFormatting = true,
    copyFormulas = true,
    clearDestination = false
  } = options;
  
  // Obter intervalos
  const source = sourceSheet.getRange(sourceRange);
  const dest = destSheet.getRange(destRange);
  
  // Verificar dimensões
  const sourceDims = {
    rows: source.getNumRows(),
    cols: source.getNumColumns()
  };
  
  const destDims = {
    rows: dest.getNumRows(),
    cols: dest.getNumColumns()
  };
  
  if (sourceDims.rows !== destDims.rows || sourceDims.cols !== destDims.cols) {
    throw new Error(
      `Dimensões de intervalo incompatíveis: origem ${sourceDims.rows}x${sourceDims.cols}, ` +
      `destino ${destDims.rows}x${destDims.cols}`
    );
  }
  
  // Limpar destino se necessário
  if (clearDestination) {
    dest.clear();
  }
  
  // Copiar valores ou fórmulas
  if (copyFormulas) {
    dest.setFormulas(source.getFormulas());
  } else {
    dest.setValues(source.getValues());
  }
  
  // Copiar formatação se necessário
  if (copyFormatting) {
    source.copyFormatToRange(
      destSheet,
      dest.getColumn(),
      dest.getLastColumn(),
      dest.getRow(),
      dest.getLastRow()
    );
  }
  
  return dest;
}

/**
 * Protege uma aba da planilha, com opções configuráveis.
 * 
 * @param {Sheet} sheet - Aba a ser protegida
 * @param {string} [description] - Descrição da proteção
 * @param {string[]} [allowedUsers] - Emails dos usuários permitidos
 * @returns {Protection} O objeto de proteção criado
 * 
 * @example
 * const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dados');
 * protectSheet(sheet, 'Proteção de dados sensíveis', ['usuario@exemplo.com']);
 */
export function protectSheet(
  sheet: Sheet,
  description?: string,
  allowedUsers?: string[]
) {
  const protection = sheet.protect();
  
  if (description) {
    protection.setDescription(description);
  }
  
  // Remover edição para todos exceto proprietário e usuários permitidos
  protection.removeEditors(protection.getEditors());
  
  if (allowedUsers && allowedUsers.length > 0) {
    protection.addEditors(allowedUsers);
  }
  
  return protection;
}
```

## 8. Verificação de Qualidade da Documentação

### 8.1. Cobertura de Documentação

O projeto utiliza ferramentas para monitorar a cobertura da documentação:

```bash
# Verificar cobertura de documentação JSDoc
pnpm docs:coverage

# Exemplo de saída:
# Total de itens: 248
# Itens documentados: 217 (87.5%)
# Itens sem documentação: 31 (12.5%)
```

### 8.2. Revisão da Documentação

Processo recomendado para revisão da documentação:

1. **Auto-revisão**: Verifique se a documentação é clara e completa
2. **Revisão por pares**: Peça a um colega para revisar a documentação
3. **Teste de usabilidade**: Verifique se alguém não familiarizado com o código consegue entender a documentação
4. **Revisão periódica**: Atualize a documentação conforme o código evolui

### 8.3. Checklist de Qualidade

- [ ] Todas as interfaces públicas estão documentadas com JSDoc
- [ ] Os exemplos de uso estão atualizados e funcionais
- [ ] A documentação descreve claramente o comportamento esperado
- [ ] Parâmetros, retornos e exceções estão documentados
- [ ] Os tipos estão corretamente especificados
- [ ] Valores padrão estão documentados
- [ ] Casos de borda e limitações estão documentados
- [ ] A documentação segue consistentemente os padrões definidos

## Próximos Passos

- Familiarize-se com os [exemplos de documentação](./02-arquitetura-gas-builder.md#documentação)
- Configure seu IDE para mostrar dicas de documentação
- Revise e melhore a documentação existente
- Utilize a documentação ao implementar novos componentes

## Referências

- [JSDoc - Documentation](https://jsdoc.app/)
- [TypeScript - Documentation](https://www.typescriptlang.org/docs/)
- [Google Apps Script - Best Practices](https://developers.google.com/apps-script/guides/support/best-practices)
- [TypeDoc - Documentation Generator](https://typedoc.org/)
- [ESLint JSDoc - Plugin](https://github.com/gajus/eslint-plugin-jsdoc)
