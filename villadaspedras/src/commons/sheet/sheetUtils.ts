/** 
 * Villa das Pedras: Funções de manipulação de planilhas
 * 
 * Versão: 1.0.0 | Data: 05/09/2024
 * 
 * Autor: Leonardo Puglia
 * 
 * Descrição: Funções auxiliares para manipulação de planilhas
 */

import { EMAIL_ADMIN } from '../constants';

/**
 * Ativa uma aba na planilha
 * @param sheet Aba a ser ativada
 * @param ss Planilha ativa
 * @returns A aba ativada
 */
export function activateSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet, ss: GoogleAppsScript.Spreadsheet.Spreadsheet): GoogleAppsScript.Spreadsheet.Sheet {
  try {
    sheet.activate();
    return sheet;
  } catch (e) {
    console.error('Erro ao ativar a aba: %s', e);
    ss.toast(`Erro ao ativar a aba: ${e}`);
    return sheet; // Retorna a aba mesmo se não conseguir ativar
  }
}

/**
 * Protege a aba sheet para não permitir mais alterações
 * @param sheet Aba a ser protegida
 * @param sheetName Nome da aba
 */
export function protectSheet(
  sheet: GoogleAppsScript.Spreadsheet.Sheet, 
  sheetName: string = sheet.getName()
): void {
  try {
    // Protege a aba inteira
    const protection = sheet.protect();
    
    // Define o nome da proteção
    protection.setDescription(`Proteção da aba ${sheetName}`);
    
    // Remove todos os editores exceto o usuário atual
    const me = Session.getEffectiveUser();
    protection.addEditor(me);
    
    // Adiciona o usuário administrador como editor
    protection.addEditor(EMAIL_ADMIN);
    
    // Remove todos os outros editores
    // Usando o método removeEditor para cada editor individualmente
    // para evitar problemas de tipo entre User[] e string[]
    const editors = protection.getEditors();
    for (let i = 0; i < editors.length; i++) {
      protection.removeEditor(editors[i]);
    }
    
    // Não permite que os editores alterem a proteção
    protection.setDomainEdit(false);
  } catch (e) {
    console.error('Erro ao proteger a aba %s: %s', sheetName, e);
  }
}

/**
 * Copia todos os intervalos protegidos entre abas
 * @param ss Planilha ativa
 * @param sourceSheet Aba de origem
 * @param destinationSheet Aba de destino
 */
export function copyIntervalProtections(
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet, 
  sourceSheet: GoogleAppsScript.Spreadsheet.Sheet, 
  destinationSheet: GoogleAppsScript.Spreadsheet.Sheet
): void {
  try {
    // Obtém todas as proteções da planilha
    const protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    
    // Filtra apenas as proteções da aba de origem
    const sourceSheetProtections = protections.filter(protection => {
      const range = protection.getRange();
      return range && range.getSheet().getName() === sourceSheet.getName();
    });
    
    // Para cada proteção na aba de origem
    sourceSheetProtections.forEach(protection => {
      const sourceRange = protection.getRange();
      if (sourceRange) {
        // Obtém as coordenadas do intervalo protegido
        const startRow = sourceRange.getRow();
        const startCol = sourceRange.getColumn();
        const numRows = sourceRange.getNumRows();
        const numCols = sourceRange.getNumColumns();
        
        // Cria um intervalo equivalente na aba de destino
        const destRange = destinationSheet.getRange(startRow, startCol, numRows, numCols);
        
        // Protege o intervalo na aba de destino
        const newProtection = destRange.protect();
        
        // Define a descrição da proteção
        newProtection.setDescription(protection.getDescription() || `Proteção copiada para ${destinationSheet.getName()}`);
        
        // Copia os editores individualmente para evitar problemas de tipo
        const editors = protection.getEditors();
        if (editors.length > 0) {
          for (let i = 0; i < editors.length; i++) {
            newProtection.addEditor(editors[i]);
          }
        }
        
        // Define as mesmas configurações de edição
        newProtection.setDomainEdit(protection.canDomainEdit());
      }
    });
  } catch (e) {
    console.error('Erro ao copiar proteções: %s', e);
  }
}

/**
 * Função destinada a desbloquear uma aba bloqueada
 * @param sheet Aba a ser desbloqueada
 */
export function unprotectSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
  try {
    // Obtém todas as proteções da aba
    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    
    // Remove cada proteção
    protections.forEach(protection => {
      protection.remove();
    });
  } catch (e) {
    console.error('Erro ao desproteger a aba: %s', e);
  }
}

/**
 * Função destinada a desbloquear os intervalos de uma aba bloqueada
 * @param sheet Aba a ter os intervalos desbloqueados
 */
export function unprotectIntervals(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
  try {
    // Obtém todas as proteções de intervalo da aba
    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    
    // Remove cada proteção
    protections.forEach(protection => {
      protection.remove();
    });
  } catch (e) {
    console.error('Erro ao desproteger os intervalos: %s', e);
  }
}

/**
 * Reordena os nomes na planilha de salário
 * @param sheet Aba a ser reordenada
 * @param modeloSheet Aba modelo
 */
export function reordenarNomesSalario(
  sheet: GoogleAppsScript.Spreadsheet.Sheet, 
  modeloSheet: GoogleAppsScript.Spreadsheet.Sheet
): void {
  try {
    // Obtém o intervalo de dados da aba
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Encontra a coluna de nomes (geralmente a coluna A)
    const nomeColIndex = 0; // Coluna A
    
    // Encontra a linha onde começam os nomes (após os cabeçalhos)
    let startRow = 0;
    for (let i = 0; i < values.length; i++) {
      if (values[i][nomeColIndex] === 'Nome') {
        startRow = i + 1;
        break;
      }
    }
    
    // Se não encontrou a linha de cabeçalho, usa a linha 1
    if (startRow === 0) {
      startRow = 1;
    }
    
    // Obtém os nomes da aba modelo
    const modeloValues = modeloSheet.getDataRange().getValues();
    const modeloNomes: string[] = [];
    
    // Encontra a coluna de nomes na aba modelo
    for (let i = 0; i < modeloValues.length; i++) {
      if (modeloValues[i][nomeColIndex] && typeof modeloValues[i][nomeColIndex] === 'string') {
        const nome = modeloValues[i][nomeColIndex].toString().trim();
        if (nome && nome !== 'Nome') {
          modeloNomes.push(nome);
        }
      }
    }
    
    // Obtém os nomes da aba atual
    const currentNomes: string[] = [];
    for (let i = startRow; i < values.length; i++) {
      if (values[i][nomeColIndex] && typeof values[i][nomeColIndex] === 'string') {
        const nome = values[i][nomeColIndex].toString().trim();
        if (nome) {
          currentNomes.push(nome);
        }
      }
    }
    
    // Ordena os nomes conforme a ordem da aba modelo
    currentNomes.sort((a, b) => {
      const indexA = modeloNomes.indexOf(a);
      const indexB = modeloNomes.indexOf(b);
      
      // Se ambos os nomes estão na aba modelo, usa a ordem da aba modelo
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // Se apenas um dos nomes está na aba modelo, ele vem primeiro
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Se nenhum dos nomes está na aba modelo, usa ordem alfabética
      return a.localeCompare(b);
    });
    
    // TODO: Implementar a reordenação das linhas na planilha
    // Esta é uma implementação simplificada que não altera a planilha
    console.log('Nomes reordenados: %s', currentNomes.join(', '));
  } catch (e) {
    console.error('Erro ao reordenar nomes: %s', e);
  }
}

/**
 * Limpa as cores de fundo de um intervalo
 * @param range Intervalo a ter as cores limpas
 */
export function limparCores(range: GoogleAppsScript.Spreadsheet.Range): void {
  try {
    // Remove todas as cores de fundo
    range.setBackground(null);
    
    // Remove todas as cores de texto
    range.setFontColor(null);
  } catch (e) {
    console.error('Erro ao limpar cores: %s', e);
  }
}

/**
 * Limpa os dados de uma aba
 * @param modeloSheet Aba modelo
 * @param mesCorrenteSheet Aba do mês corrente
 */
export function limparDados(
  modeloSheet: GoogleAppsScript.Spreadsheet.Sheet, 
  mesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet
): void {
  try {
    // Limpa todos os dados da aba do mês corrente
    mesCorrenteSheet.clear();
    
    // Copia os dados da aba modelo para a aba do mês corrente
    const modeloRange = modeloSheet.getDataRange();
    const modeloValues = modeloRange.getValues();
    const modeloFormulas = modeloRange.getFormulas();
    
    // Combina valores e fórmulas
    const newValues = modeloValues.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        return modeloFormulas[rowIndex][colIndex] || cell;
      });
    });
    
    // Define os novos valores na aba do mês corrente
    mesCorrenteSheet.getRange(1, 1, newValues.length, newValues[0].length).setValues(newValues);
  } catch (e) {
    console.error('Erro ao limpar dados: %s', e);
  }
}
