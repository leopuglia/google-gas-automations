// Interfaces básicas para o projeto

declare namespace VilladasPedrasGAS {
  namespace Spreadsheet {
    interface Spreadsheet {}
  }
}

export interface ISpreadsheetConfig {
  currentSheetName: string
  modelSheetName: string
  protectedRanges: string[]
  sharedFolderName: string
  emailAdmin: string
}

export interface ITransitionParams {
  currentMonth: Date
  lastMonth: Date
  spreadsheet: VilladasPedrasGAS.Spreadsheet.Spreadsheet
  config: ISpreadsheetConfig
}

export interface IDateUtils {
  getMonthName(date: Date): string
  getNextMonth(date: Date): Date
  getPreviousMonth(date: Date): Date
  getFirstTuesday(date: Date): Date
}
