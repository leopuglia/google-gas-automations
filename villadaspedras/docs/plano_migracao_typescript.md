# Plano de Migração para TypeScript

## Estrutura de Módulos

```bash
src/
  core/
    dateUtils.ts       # Funções de manipulação de data
    logger.ts          # Utilitários de log
    utils.ts           # Funções utilitárias gerais
  
  spreadsheet/
    spreadsheetService.ts # Classe principal para manipulação
    protection.ts      # Funções de proteção de abas
    ranges.ts          # Manipulação de intervalos
  
  transition/
    monthTransition.ts # Lógica de virada de mês
    yearTransition.ts  # Lógica de virada de ano
  
  models/
    config.ts          # Interfaces de configuração
    types.ts           # Tipos globais
```

## Progresso Atual

✅ **Estrutura de diretórios criada**

```bash
src/
  core/
  spreadsheet/
  transition/
  models/
```

✅ **Interfaces base definidas**

- `ISpreadsheetConfig`
- `ITransitionParams`
- `IDateUtils`

✅ **Implementação inicial concluída**

- `core/dateUtils.ts` (implementa `IDateUtils`)
- `models/config.ts` (configurações padrão)
- `spreadsheet/spreadsheetService.ts` (manipulação básica de planilhas)

### SpreadsheetService.ts

```typescript
class SpreadsheetService {
  // Manipulação básica de planilhas
  activateSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet): void
  
  // Proteções
  protectSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet): void
  unprotectSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet): void
  
  // Intervalos
  copyRangeValues(source: Range, target: Range): void
}
```

### MonthTransition.ts

```typescript
class MonthTransition {
  constructor(private spreadsheetService: SpreadsheetService) {}
  
  execute(
    currentMonth: Date,
    lastMonth: Date,
    config: ITransitionConfig
  ): void
}
```

## Status Atual - 2025-04-05

✅ **Implementação inicial concluída e versionada**

- Estrutura modular criada
- Interfaces base definidas
- Serviços principais implementados
- Merge realizado para o branch main

### Próximos Passos

1. Configurar Rollup para compilação TS → JS
2. Implementar testes unitários
3. Expandir funcionalidades do SpreadsheetService
4. Documentar API da biblioteca

## Interfaces Principais

```typescript
interface ITransitionConfig {
  currentSheetName: string
  modelSheetName: string
  protectedRanges: string[]
}

interface IDateUtils {
  getMonthName(date: Date): string
  getNextMonth(date: Date): Date
  getPreviousMonth(date: Date): Date
}
```

## Próximos Passos

1. Criar estrutura de diretórios
2. Definir interfaces base
3. Migrar funções utilitárias primeiro
4. Implementar classes principais
5. Configurar rollup para bundle
