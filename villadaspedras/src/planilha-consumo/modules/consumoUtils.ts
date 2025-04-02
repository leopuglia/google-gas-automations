/**
 * Funções utilitárias para a planilha de consumo
 * 
 * Autor: Leonardo Puglia
 * Versão: 1.0.0 | Data: 02/04/2025
 * 
 * Descrição: Implementação das funções utilitárias para a planilha de consumo
 */

import {
  ABA_MES_CORRENTE_NAME,
  ABA_MODELO_NAME,
  limparDados,
  inicializaMacro,
  finalizaMacro
} from '../../commons/Main';

/**
 * Função para limpar os dados da planilha
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
 * Função para criar o menu na planilha
 * Esta função é chamada quando a planilha é aberta
 */
export function onOpen(): void {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('🔄 Automações');
  
  menu.addItem('Virar Mês', 'virarMesConsumo');
  menu.addItem('Virar Ano', 'virarAnoConsumo');
  menu.addSeparator();
  menu.addItem('Limpar Dados', 'limparDadosSheet');
  
  menu.addToUi();
}
