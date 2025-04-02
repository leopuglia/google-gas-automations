/**
 * Funções para virada de mês da planilha de consumo
 * 
 * Autor: Leonardo Puglia
 * Versão: 1.0.0 | Data: 02/04/2025
 * 
 * Descrição: Implementação das funções de virada de mês para planilhas de consumo
 */

import {
  ABA_MES_CORRENTE_NAME,
  ABA_MODELO_NAME,
  getCurrentAndNextMonth,
  getMonthName,
  activateSheet,
  protectSheet,
  limparDados,
  inicializaMacro,
  finalizaMacro
} from '../../commons/Main';

/**
 * Função para virar o mês na planilha de consumo
 * Esta função é chamada pelo menu ou por um trigger
 */
export function virarMesConsumo(): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Inicializa a macro
    const { mesCorrenteSheet } = inicializaMacro('Virar Mês Consumo', ss, ui, true);
    
    // Obtém a aba modelo
    const modeloSheet = ss.getSheetByName(ABA_MODELO_NAME);
    if (!modeloSheet) {
      ui.alert('Erro', 'Aba modelo não encontrada', ui.ButtonSet.OK);
      return;
    }
    
    // Calcula o mês atual e o mês anterior
    const resultado = getCurrentAndNextMonth('Consumo', ss, ui, true);
    if (!resultado) {
      return;
    }
    
    const { currentMonth, currentMonthName, lastMonth, lastMonthName } = resultado;
    
    // Verifica se já existe aba com o nome do mês anterior
    let lastMonthSheet = ss.getSheetByName(lastMonthName);
    if (!lastMonthSheet) {
      // Criando aba para o mês anterior
      lastMonthSheet = ss.insertSheet(lastMonthName, ss.getSheets().length);
      
      // Copiando as informações do mês corrente para a nova aba
      mesCorrenteSheet.getRange('A1:Z1000').copyTo(lastMonthSheet.getRange('A1'), {contentsOnly: false});
      
      // Protege a aba do mês anterior (somente leitura)
      protectSheet(lastMonthSheet, lastMonthName);
    }
    
    // Limpa o mês corrente
    limparDados(modeloSheet, mesCorrenteSheet);
    
    // Atualiza o título da aba MES CORRENTE
    mesCorrenteSheet.getRange('A1').setValue(currentMonthName);
    
    // Finaliza a macro
    finalizaMacro('Virar Mês Consumo', ss);
  } catch (e) {
    console.error('Erro ao virar mês: %s', e);
    ui.alert('Erro', `Ocorreu um erro ao virar o mês: ${e}`, ui.ButtonSet.OK);
  }
}
