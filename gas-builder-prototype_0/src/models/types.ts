// Interfaces básicas para o projeto

export const ProtectionType = {
  RANGE: 'RANGE',
  SHEET: 'SHEET',
} as const;

export declare namespace VilladasPedrasGAS {
  namespace Spreadsheet {
    interface Spreadsheet {
      getSheetByName(name: string): Sheet | null;
      getActiveSheet(): Sheet;
      duplicateActiveSheet(): Sheet;
      getProtections(type: (typeof ProtectionType)[keyof typeof ProtectionType]): Protection[];
      setSheetProtection(protection: Protection): void;
    }


    interface Sheet {
      getName(): string;
      protect(): Protection;
      getProtections(type: (typeof ProtectionType)[keyof typeof ProtectionType]): Protection[];
      getSheetProtection(): Protection;
      copyTo(spreadsheet: Spreadsheet): Sheet;
      activate(): void;
      setName(name: string): void;
    }

    interface Protection {
      setDescription(description: string): void;
      remove(): void;
      getRange(): Range;
    }

    interface Range {}
  }
}

export interface ISheet {
  name: string;
  protected: boolean;
}

export interface IProtection {
  description: string;
  range: string;
}

export interface ISpreadsheetConfig {
  currentSheetName: string;
  modelSheetName: string;
  protectedRanges: string[];
  sharedFolderName: string;
  emailAdmin: string;
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
  getMonthName(date: Date): string;
  getNextMonth(date: Date): Date;
  getPreviousMonth(date: Date): Date;
  getFirstTuesday(date: Date): Date;
}
