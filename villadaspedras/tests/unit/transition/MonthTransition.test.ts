import { MonthTransition } from '../../../src/transition/MonthTransition';
import { SpreadsheetService } from '../../../src/spreadsheet/spreadsheetService';
import { describe, beforeEach, test, expect, jest } from '@jest/globals';

describe('MonthTransition', () => {
  let transition: MonthTransition;
  let mockSpreadsheetService: jest.Mocked<SpreadsheetService>;
  
  beforeEach(() => {
    // Mock do SpreadsheetService
    mockSpreadsheetService = {
      duplicateSheet: jest.fn()
    } as unknown as jest.Mocked<SpreadsheetService>;
    
    const mockParams = {
      spreadsheetId: 'mock-spreadsheet-id',
      currentMonth: new Date(),
      nextMonth: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lastMonth: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      spreadsheet: {} as any,
      config: {
        modelSheetName: 'Template'
      } as any
    };
    
    transition = new MonthTransition(mockParams);
    // Substituir o serviço pelo mock
    transition['spreadsheetService'] = mockSpreadsheetService;
  });

  test('should initialize correctly', () => {
    expect(transition).toBeInstanceOf(MonthTransition);
  });

  test('should execute month transition', () => {
    const monthName = 'JANEIRO';
    jest.spyOn(transition['dateUtils'], 'getMonthName').mockReturnValue(monthName);
    
    transition.execute();
    
    expect(mockSpreadsheetService.duplicateSheet).toHaveBeenCalledWith('Template', monthName);
  });
});
