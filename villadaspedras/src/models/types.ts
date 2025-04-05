// Interfaces básicas para o projeto

export declare namespace VilladasPedrasGAS {
  namespace Spreadsheet {
    interface Spreadsheet {
      getSheetByName(name: string): Sheet | null;
      getActiveSheet(): Sheet;
      duplicateActiveSheet(): Sheet;
    }

    interface Sheet {
      getName(): string;
      setName(name: string): void;
      activate(): void;
      copyTo(spreadsheet: Spreadsheet): Sheet;
    }
  }
}

export interface ISpreadsheetConfig {
  currentSheetName: string;
  modelSheetName: string;
  protectedRanges: string[];
  sharedFolderName: string;
  emailAdmin: string;
}

export interface ITransitionParams {
  currentMonth: Date;
  lastMonth: Date;
  spreadsheet: VilladasPedrasGAS.Spreadsheet.Spreadsheet;
  config: ISpreadsheetConfig;
}

export interface IDateUtils {
  getMonthName(date: Date): string;
  getNextMonth(date: Date): Date;
  getPreviousMonth(date: Date): Date;
  getFirstTuesday(date: Date): Date;
}
