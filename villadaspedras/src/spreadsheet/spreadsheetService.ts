// Serviço para manipulação de planilhas

import type { VilladasPedrasGAS } from '../models/types';

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

  // Outros métodos serão implementados aqui
}
