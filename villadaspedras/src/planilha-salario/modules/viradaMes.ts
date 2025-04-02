/**
 * Funções para virada de mês da planilha de salário
 * 
 * Autor: Leonardo Puglia
 * Versão: 1.0.0 | Data: 02/04/2025
 * 
 * Descrição: Implementação das funções de virada de mês
 */

import {
  ABA_MES_CORRENTE_NAME,
  ABA_MODELO_NAME,
  IS_RUN_VIRAR_CONSUMO,
  getCurrentAndNextMonth,
  getMonthName,
  getPreviousMonth,
  activateSheet,
  protectSheet,
  reordenarNomesSalario,
  limparCores,
  limparDados,
  getPlanilhasConsumo,
  inicializaMacro,
  finalizaMacro,
  toastInfo
} from '../../commons/Main';

/**
 * Função para virar o mês apenas na planilha de salário
 */
export function virarMesSalario(): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Inicializa a macro
    const { mesCorrenteSheet } = inicializaMacro('Virar Mês Salário', ss, ui, true);
    
    // Calcula o mês atual e o mês anterior
    const resultado = getCurrentAndNextMonth('Salário', ss, ui, true);
    if (!resultado) {
      return;
    }
    
    const { currentMonth, lastMonth } = resultado;
    
    // Executa a rotina de virada de mês
    _virarMesSalario(currentMonth, lastMonth);
    
    // Finaliza a macro
    finalizaMacro('Virar Mês Salário', ss);
  } catch (e) {
    console.error('Erro ao virar mês: %s', e);
    ui.alert('Erro', `Ocorreu um erro ao virar o mês: ${e}`, ui.ButtonSet.OK);
  }
}

/**
 * Função para virar o mês em todas as planilhas (salário e consumo)
 */
export function virarMesTudo(): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Inicializa a macro
    const { mesCorrenteSheet } = inicializaMacro('Virar Mês Tudo', ss, ui, true);
    
    // Calcula o mês atual e o mês anterior
    const resultado = getCurrentAndNextMonth('Salário', ss, ui, true);
    if (!resultado) {
      return;
    }
    
    const { currentMonth, currentMonthName, lastMonth, lastMonthName } = resultado;
    
    /**
     * EXECUTANDO A ROTINA DE VIRADA DE MÊS NA PLANILHA DE SALÁRIO
     */
    ss.toast(`Virando o mês da planilha de salário de ${lastMonthName} para ${currentMonthName}...`);
    _virarMesSalario(currentMonth, lastMonth);
    
    /**
     * EXECUTANDO A ROTINA DE VIRADA DE MÊS NAS PLANILHAS DE CONSUMO
     */
    ss.toast('Buscando planilhas de consumo...');
    
    // Obtém as planilhas de consumo
    const map = getPlanilhasConsumo(currentMonth);
    
    // Para cada planilha de consumo
    for (const [key, value] of map) {
      ss.toast(`Virando o mês da planilha ${key}`);
      const consumoSS = SpreadsheetApp.openById(value.getId());
      SpreadsheetApp.setActiveSpreadsheet(consumoSS);
      const consumoMesCorrenteSheetTemp = consumoSS.getSheetByName(ABA_MES_CORRENTE_NAME);
      const consumoModeloSheet = consumoSS.getSheetByName(ABA_MODELO_NAME);

      if (IS_RUN_VIRAR_CONSUMO && consumoMesCorrenteSheetTemp && consumoModeloSheet) {
        const consumoMesCorrenteSheet = activateSheet(consumoMesCorrenteSheetTemp, consumoSS);
        _virarMesConsumo(currentMonth, lastMonth, consumoSS, consumoMesCorrenteSheet, consumoModeloSheet);
      }
    }
    
    // Voltar para a planilha de salário e reordenar nomes
    SpreadsheetApp.setActiveSpreadsheet(ss);
    
    // Finaliza a macro
    finalizaMacro('Virar Mês Tudo', ss);
  } catch (e) {
    console.error('Erro ao virar mês em todas as planilhas: %s', e);
    ui.alert('Erro', `Ocorreu um erro ao virar o mês em todas as planilhas: ${e}`, ui.ButtonSet.OK);
  }
}

/**
 * Implementação interna da virada de mês na planilha de salário
 * @param currentMonth Mês atual
 * @param lastMonth Mês anterior
 */
export function _virarMesSalario(currentMonth: Date, lastMonth: Date): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mesCorrenteSheet = ss.getSheetByName(ABA_MES_CORRENTE_NAME);
  const modeloSheet = ss.getSheetByName(ABA_MODELO_NAME);
  
  // Verificar se as abas existem
  if (!mesCorrenteSheet || !modeloSheet) {
    console.error('Abas necessárias não encontradas');
    ss.toast('Erro: Abas necessárias não encontradas');
    return;
  }
  
  // lastMonth já é um objeto Date, não precisa converter
  const lastMonthName = getMonthName(lastMonth);
  // O nome do mês atual é usado na função _virarMesSalario para debug
  
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
  
  // Reordena os nomes na aba do mês corrente
  reordenarNomesSalario(mesCorrenteSheet, modeloSheet);
}

/**
 * Implementação interna da virada de mês na planilha de consumo
 * @param currentMonth Mês atual
 * @param lastMonth Mês anterior
 * @param ss Planilha de consumo
 * @param mesCorrenteSheet Aba de mês corrente
 * @param modeloSheet Aba modelo
 */
export function _virarMesConsumo(
  currentMonth: Date, 
  lastMonth: Date, 
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet, 
  mesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet, 
  modeloSheet: GoogleAppsScript.Spreadsheet.Sheet
): void {
  // lastMonth já é um objeto Date, não precisa converter
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
  limparCores(mesCorrenteSheet.getDataRange());
}
