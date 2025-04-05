import { VilladasPedrasGAS } from '../../../src/models/types';
import { SpreadsheetService } from '../../../src/spreadsheet/spreadsheetService';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';

describe('SpreadsheetService', () => {
  let mockSpreadsheet: VilladasPedrasGAS.Spreadsheet.Spreadsheet;
  let service: SpreadsheetService;

  beforeEach(() => {
    mockSpreadsheet = {
      getSheetByName: jest.fn(),
      getActiveSheet: jest.fn(),
      insertSheet: jest.fn(),
      getProtections: jest.fn(() => []),
      setSheetProtection: jest.fn()
    } as unknown as VilladasPedrasGAS.Spreadsheet.Spreadsheet;
    
    service = new SpreadsheetService(mockSpreadsheet);
  });

  describe('activateSheet', () => {
    it('should activate existing sheet', () => {
      const mockSheet = { activate: jest.fn() };
      (mockSpreadsheet.getSheetByName as jest.Mock).mockReturnValue(mockSheet);
      
      service.activateSheet('existing');
      expect(mockSheet.activate).toHaveBeenCalled();
    });

    it('should handle non-existent sheet gracefully', () => {
      (mockSpreadsheet.getSheetByName as jest.Mock).mockReturnValue(null);
      expect(() => service.activateSheet('nonexistent')).not.toThrow();
    });
  });

  describe('duplicateSheet', () => {
    it('should duplicate sheet with new name', () => {
      const mockSheet = { 
        copyTo: jest.fn().mockReturnValue({ setName: jest.fn() })
      };
      (mockSpreadsheet.getSheetByName as jest.Mock).mockReturnValue(mockSheet);
      
      service.duplicateSheet('source', 'copy');
      expect(mockSheet.copyTo).toHaveBeenCalledWith(mockSpreadsheet);
    });
  });

  describe('protectSheet', () => {
    it('should protect sheet with description', () => {
      const mockProtection = { 
        setDescription: jest.fn(),
        getRange: jest.fn()
      };
      const mockSheet = { 
        protect: jest.fn().mockReturnValue(mockProtection)
      };
      (mockSpreadsheet.getSheetByName as jest.Mock).mockReturnValue(mockSheet);

      service.protectSheet('sheet', 'Test protection');
      expect(mockSheet.protect).toHaveBeenCalled();
      expect(mockProtection.setDescription).toHaveBeenCalledWith('Test protection');
    });
  });

  describe('unprotectSheet', () => {
    it('should remove sheet protection (via getProtections)', () => {
      const mockProtection = { remove: jest.fn() };
      const mockSheet = { 
        getProtections: jest.fn().mockReturnValue([mockProtection])
      };
      (mockSpreadsheet.getSheetByName as jest.Mock).mockReturnValue(mockSheet);

      service.unprotectSheet('sheet');
      expect(mockProtection.remove).toHaveBeenCalled();
    });

    it('should remove sheet protection (via getSheetProtection)', () => {
      const mockProtection = { remove: jest.fn() };
      const mockSheet = { 
        getSheetProtection: jest.fn().mockReturnValue(mockProtection)
      };
      (mockSpreadsheet.getSheetByName as jest.Mock).mockReturnValue(mockSheet);

      service.unprotectSheet('sheet');
      expect(mockProtection.remove).toHaveBeenCalled();
    });

    it('should handle non-existent sheet gracefully', () => {
      (mockSpreadsheet.getSheetByName as jest.Mock).mockReturnValue(null);
      expect(() => service.unprotectSheet('nonexistent')).not.toThrow();
    });
  });
});
