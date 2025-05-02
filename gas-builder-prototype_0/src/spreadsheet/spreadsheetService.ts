import { VilladasPedrasGAS, ProtectionType } from '../models/types';

// Serviço para manipulação de planilhas

export class SpreadsheetService {
  private ss: VilladasPedrasGAS.Spreadsheet.Spreadsheet;

  constructor(spreadsheet: VilladasPedrasGAS.Spreadsheet.Spreadsheet) {
    this.ss = spreadsheet;
  }

  activateSheet(sheetName: string): void {
    const sheet = this.ss.getSheetByName(sheetName);
    if (sheet) sheet.activate();
  }

  duplicateSheet(sheetName: string, newName: string): void {
    const sheet = this.ss.getSheetByName(sheetName);
    if (sheet) {
      const newSheet = sheet.copyTo(this.ss);
      newSheet.setName(newName);
    }
  }

  protectSheet(sheetName: string, description: string): void {
    const sheet = this.ss.getSheetByName(sheetName);
    if (!sheet) return;

    const protection = sheet.protect();
    protection.setDescription(description);
  }

  unprotectSheet(sheetName: string): void {
    const sheet = this.ss.getSheetByName(sheetName);
    if (!sheet) return;

    // Tenta primeiro com getSheetProtection
    const sheetProtection = sheet.getSheetProtection?.();
    if (sheetProtection) {
      sheetProtection.remove();
      return;
    }

    // Se não existir, tenta com getProtections
    const protections = sheet.getProtections?.(ProtectionType.SHEET) || [];
    if (protections.length > 0) {
      protections[0].remove();
    }
  }

  // Outros métodos serão implementados aqui
}
