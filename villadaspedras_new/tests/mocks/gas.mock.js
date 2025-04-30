/**
 * Mock para o ambiente do Google Apps Script
 * Isso permite testar o código sem precisar estar no ambiente real do GAS
 */

// Mock do SpreadsheetApp
global.SpreadsheetApp = {
  getActiveSpreadsheet: jest.fn().mockReturnValue({
    getActiveSheet: jest.fn().mockReturnValue({
      getRange: jest.fn().mockReturnValue({
        setValue: jest.fn()
      })
    }),
    getSheetByName: jest.fn().mockReturnValue({
      getRange: jest.fn().mockReturnValue({
        setValue: jest.fn(),
        getValue: jest.fn(),
        getValues: jest.fn().mockReturnValue([])
      })
    })
  }),
  getUi: jest.fn().mockReturnValue({
    alert: jest.fn(),
    createMenu: jest.fn().mockReturnValue({
      addItem: jest.fn().mockReturnValue({
        addToUi: jest.fn()
      })
    })
  })
};

// Mock do Logger
global.Logger = {
  log: jest.fn()
};

// Mock do PropertiesService
global.PropertiesService = {
  getScriptProperties: jest.fn().mockReturnValue({
    getProperty: jest.fn(),
    setProperty: jest.fn()
  })
};
