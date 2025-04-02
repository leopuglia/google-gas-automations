/**
 * Funções para virada de ano da planilha de consumo
 * 
 * Autor: Leonardo Puglia
 * Versão: 1.0.0 | Data: 02/04/2025
 * 
 * Descrição: Implementação das funções de virada de ano para planilhas de consumo
 */

import {
  ABA_MES_CORRENTE_NAME,
  ABA_MODELO_NAME,
  getCurrentAndNextMonthYear,
  getMonthName,
  activateSheet,
  protectSheet,
  limparDados,
  inicializaMacro,
  finalizaMacro
} from '../../commons/Main';

/**
 * Função para virar o ano na planilha de consumo
 * Esta função é chamada pelo menu ou por um trigger
 */
export function virarAnoConsumo(): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Inicializa a macro
    const { mesCorrenteSheet } = inicializaMacro('Virar Ano Consumo', ss, ui, true);
    
    // Obtém a aba modelo
    const modeloSheet = ss.getSheetByName(ABA_MODELO_NAME);
    if (!modeloSheet) {
      ui.alert('Erro', 'Aba modelo não encontrada', ui.ButtonSet.OK);
      return;
    }
    
    // Calcula o mês atual e o mês anterior
    const resultado = getCurrentAndNextMonthYear();
    if (!resultado) {
      return;
    }
    
    // Extrair currentMonth e calcular lastMonth
    const { currentMonth } = resultado;
    const lastMonth = new Date(currentMonth);
    lastMonth.setFullYear(lastMonth.getFullYear() - 1);
    
    // Obter os nomes dos meses
    const currentMonthName = getMonthName(currentMonth);
    const lastMonthName = getMonthName(lastMonth);
    
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
    finalizaMacro('Virar Ano Consumo', ss);
  } catch (e) {
    console.error('Erro ao virar ano: %s', e);
    ui.alert('Erro', `Ocorreu um erro ao virar o ano: ${e}`, ui.ButtonSet.OK);
  }
}
