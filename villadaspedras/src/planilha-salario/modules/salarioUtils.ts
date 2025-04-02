/**
 * Funções utilitárias para a planilha de salário
 * 
 * Autor: Leonardo Puglia
 * Versão: 1.0.0 | Data: 02/04/2025
 * 
 * Descrição: Implementação das funções utilitárias para a planilha de salário
 */

import {
  ABA_MES_CORRENTE_NAME,
  ABA_MODELO_NAME,
  activateSheet,
  protectSheet,
  reordenarNomesSalario,
  limparCores,
  limparDados,
  inicializaMacro,
  finalizaMacro,
  toastInfo
} from '../../commons/Main';

/**
 * Limpa as cores de uma área da planilha
 */
export function limparCoresSheet(): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Inicializa a macro
    const { mesCorrenteSheet } = inicializaMacro('Limpar Cores', ss, ui, false);
    
    // Limpa as cores da planilha
    limparCores(mesCorrenteSheet.getDataRange());
    
    // Finaliza a macro
    finalizaMacro('Limpar Cores', ss);
  } catch (e) {
    console.error('Erro ao limpar cores: %s', e);
    ui.alert('Erro', `Ocorreu um erro ao limpar as cores: ${e}`, ui.ButtonSet.OK);
  }
}

/**
 * Reordena os nomes na planilha de salário
 */
export function reordenarNomes(): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Inicializa a macro
    const { mesCorrenteSheet } = inicializaMacro('Reordenar Nomes', ss, ui, false);
    
    // Obtém a aba modelo
    const modeloSheet = ss.getSheetByName(ABA_MODELO_NAME);
    if (!modeloSheet) {
      ui.alert('Erro', 'Aba modelo não encontrada', ui.ButtonSet.OK);
      return;
    }
    
    // Reordena os nomes
    reordenarNomesSalario(mesCorrenteSheet, modeloSheet);
    
    // Finaliza a macro
    finalizaMacro('Reordenar Nomes', ss);
  } catch (e) {
    console.error('Erro ao reordenar nomes: %s', e);
    ui.alert('Erro', `Ocorreu um erro ao reordenar os nomes: ${e}`, ui.ButtonSet.OK);
  }
}

/**
 * Limpa dados da planilha
 */
export function limparDadosSheet(): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Inicializa a macro
    const { mesCorrenteSheet } = inicializaMacro('Limpar Dados', ss, ui, true);
    
    // Obtém a aba modelo
    const modeloSheet = ss.getSheetByName(ABA_MODELO_NAME);
    if (!modeloSheet) {
      ui.alert('Erro', 'Aba modelo não encontrada', ui.ButtonSet.OK);
      return;
    }
    
    // Limpa os dados
    limparDados(modeloSheet, mesCorrenteSheet);
    
    // Finaliza a macro
    finalizaMacro('Limpar Dados', ss);
  } catch (e) {
    console.error('Erro ao limpar dados: %s', e);
    ui.alert('Erro', `Ocorreu um erro ao limpar os dados: ${e}`, ui.ButtonSet.OK);
  }
}

/**
 * Bloqueia todas as alterações na aba atual
 */
export function bloquearAlteracoes(): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Inicializa a macro
    const { mesCorrenteSheet } = inicializaMacro('Bloquear Alterações', ss, ui, false);
    
    // Protege a aba
    protectSheet(mesCorrenteSheet, mesCorrenteSheet.getName());
    
    // Finaliza a macro
    finalizaMacro('Bloquear Alterações', ss);
  } catch (e) {
    console.error('Erro ao bloquear alterações: %s', e);
    ui.alert('Erro', `Ocorreu um erro ao bloquear as alterações: ${e}`, ui.ButtonSet.OK);
  }
}
