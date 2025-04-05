import { jest } from '@jest/globals';

// Mock completo para Google Apps Script
type JestMock<T extends (...args: any[]) => any> = jest.Mock<T>;

declare global {
  namespace GoogleAppsScript {
    namespace Spreadsheet {
      interface Sheet {
        getName(): string;
        setName(name: string): void;
        activate(): void;
        copyTo(spreadsheet: Spreadsheet): Sheet;
      }

      interface Spreadsheet {
        getSheetByName(name: string): Sheet | null;
        getActiveSheet(): Sheet;
        duplicateActiveSheet(): Sheet;
      }
    }
  }
}

export const SpreadsheetApp = {
  getActiveSpreadsheet: jest.fn(() => ({
    getSheetByName: jest.fn(),
    getActiveSheet: jest.fn(),
    duplicateActiveSheet: jest.fn()
  })) as JestMock<any>,
  openById: jest.fn() as JestMock<any>,
  create: jest.fn() as JestMock<any>
};

export const DocumentApp = {
  getActiveDocument: jest.fn() as JestMock<any>
};

export const PropertiesService = {
  getScriptProperties: jest.fn(() => ({
    getProperty: jest.fn() as JestMock<any>,
    setProperty: jest.fn() as JestMock<any>
  })) as JestMock<any>,
  getDocumentProperties: jest.fn() as JestMock<any>,
  getUserProperties: jest.fn() as JestMock<any>
};
