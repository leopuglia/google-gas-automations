# API Reference - VilladasPedrasLib

## Classes Principais

### SpreadsheetService

```typescript
class SpreadsheetService {
  constructor(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet)
  
  // Métodos principais
  activateSheet(sheetName: string): void
  duplicateSheet(sheetName: string, newName: string): void
  protectRanges(sheetName: string, ranges: string[]): void
}
```

### MonthTransition

```typescript
class MonthTransition {
  constructor(params: ITransitionParams)
  
  execute(): void
}
```

### YearTransition

```typescript
class YearTransition {
  constructor(params: ITransitionParams)
  
  execute(): void
}
```

## Interfaces

### ITransitionParams

```typescript
interface ITransitionParams {
  currentMonth: Date
  lastMonth: Date
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
  config: ISpreadsheetConfig
}
```

### ISpreadsheetConfig

```typescript
interface ISpreadsheetConfig {
  currentSheetName: string
  modelSheetName: string
  protectedRanges: string[]
  sharedFolderName: string
  emailAdmin: string
}
```

## Exemplos Práticos

### Virada de Mês

```typescript
// Configuração básica
const config = {
  currentSheetName: 'MES_CORRENTE',
  modelSheetName: 'MODELO',
  protectedRanges: ['A1:Z100'],
  sharedFolderName: 'Faturamento',
  emailAdmin: 'admin@empresa.com'
};

// Executar transição
const ss = SpreadsheetApp.getActiveSpreadsheet();
const transition = new MonthTransition({
  currentMonth: new Date(),
  lastMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)),
  spreadsheet: ss,
  config
});

transition.execute();
```

### Virada de Ano

```typescript
const yearTransition = new YearTransition({
  currentMonth: new Date(),
  lastMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)),
  spreadsheet: ss,
  config
});

yearTransition.execute();
```
