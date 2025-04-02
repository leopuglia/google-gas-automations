/**
 * Funções para virada de ano da planilha de salário
 * 
 * Autor: Leonardo Puglia
 * Versão: 1.0.0 | Data: 02/04/2025
 * 
 * Descrição: Implementação das funções de virada de ano
 */

import {
  ABA_MES_CORRENTE_NAME,
  ABA_MODELO_NAME,
  IS_RUN_VIRAR_CONSUMO,
  getCurrentAndNextMonthYear,
  getMonthName,
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
 * Função para virar o ano na planilha de salário
 */
export function virarAnoSalario(): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Inicializa a macro
    const { mesCorrenteSheet } = inicializaMacro('Virar Ano Salário', ss, ui, true);
    
    /**
     * CALCULANDO OS NOMES DO MÊS ATUAL E MÊS ANTERIOR
     */
    const resultado = getCurrentAndNextMonthYear();
    if (!resultado) {
      return;
    }
    
    // Extrair currentMonth e calcular lastMonth
    const { currentMonth } = resultado;
    const lastMonth = new Date(currentMonth);
    lastMonth.setFullYear(lastMonth.getFullYear() - 1);
    
    // Executa a rotina de virada de ano
    _virarAnoSalario(currentMonth, lastMonth);
    
    // Finaliza a macro
    finalizaMacro('Virar Ano Salário', ss);
  } catch (e) {
    console.error('Erro ao virar ano: %s', e);
    ui.alert('Erro', `Ocorreu um erro ao virar o ano: ${e}`, ui.ButtonSet.OK);
  }
}

/**
 * Função para virar o ano em todas as planilhas (salário e consumo)
 */
export function virarAnoTudo(): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Inicializa a macro
    const { mesCorrenteSheet } = inicializaMacro('Virar Ano Tudo', ss, ui, true);
    
    /**
     * CALCULANDO OS NOMES DO MÊS ATUAL E MÊS ANTERIOR
     */
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
    
    /**
     * EXECUTANDO A ROTINA DE VIRADA DE ANO NA PLANILHA DE SALÁRIO
     */
    ss.toast(`Virando o ano da planilha de salário de ${lastMonthName} para ${currentMonthName}...`);
    _virarAnoSalario(currentMonth, lastMonth);
    
    /**
     * EXECUTANDO A ROTINA DE VIRADA DE ANO NAS PLANILHAS DE CONSUMO
     */
    ss.toast('Buscando planilhas de consumo...');
    
    // Obtém as planilhas de consumo
    const map = getPlanilhasConsumo(currentMonth);
    
    // Para cada planilha de consumo
    for (const [key, value] of map) {
      ss.toast(`Virando o ano da planilha ${key}`);
      const consumoSS = SpreadsheetApp.openById(value.getId());
      SpreadsheetApp.setActiveSpreadsheet(consumoSS);
      const consumoMesCorrenteSheetTemp = consumoSS.getSheetByName(ABA_MES_CORRENTE_NAME);
      const consumoModeloSheet = consumoSS.getSheetByName(ABA_MODELO_NAME);

      if (IS_RUN_VIRAR_CONSUMO && consumoMesCorrenteSheetTemp && consumoModeloSheet) {
        const consumoMesCorrenteSheet = activateSheet(consumoMesCorrenteSheetTemp, consumoSS);
        _virarAnoConsumo(currentMonth, lastMonth, consumoSS, consumoMesCorrenteSheet, consumoModeloSheet);
      }
    }
    
    // Voltar para a planilha de salário
    SpreadsheetApp.setActiveSpreadsheet(ss);
    
    // Finaliza a macro
    finalizaMacro('Virar Ano Tudo', ss);
  } catch (e) {
    console.error('Erro ao virar ano em todas as planilhas: %s', e);
    ui.alert('Erro', `Ocorreu um erro ao virar o ano em todas as planilhas: ${e}`, ui.ButtonSet.OK);
  }
}

/**
 * Implementação interna da virada de ano na planilha de salário
 * @param currentMonth Mês atual
 * @param lastMonth Mês anterior
 */
export function _virarAnoSalario(currentMonth: Date, lastMonth: Date): void {
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
 * Implementação interna da virada de ano na planilha de consumo
 * @param currentMonth Mês atual
 * @param lastMonth Mês anterior
 * @param ss Planilha de consumo
 * @param mesCorrenteSheet Aba de mês corrente
 * @param modeloSheet Aba modelo
 */
export function _virarAnoConsumo(
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
