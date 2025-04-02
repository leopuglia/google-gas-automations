/** 
 * Villa das Pedras: Funções de inicialização e finalização de macros
 * 
 * Versão: 1.0.0 | Data: 05/09/2024
 * 
 * Autor: Leonardo Puglia
 * 
 * Descrição: Funções auxiliares para inicialização e finalização de macros
 */

import { ABA_MES_CORRENTE_NAME } from '../constants';
import { getMonthName, getPreviousMonth, getNextMonth } from '../date/dateUtils';

/**
 * Calcula o mês atual e o próximo mês para virada de mês a partir da data de hoje e da última aba virada
 * @param sheetname Nome da aba
 * @param ss Planilha ativa
 * @param ui Interface do usuário
 * @param isAskUserQuestions Flag para perguntar ao usuário
 * @returns Objeto com mês atual e próximo
 */
export function getCurrentAndNextMonth(
  sheetname: string, 
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet, 
  ui: GoogleAppsScript.Base.Ui, 
  isAskUserQuestions: boolean
): { currentMonth: Date, currentMonthName: string, lastMonth: Date, lastMonthName: string } | undefined {
  try {
    // Obtém a data atual
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthName = getMonthName(currentMonth);
    
    // Obtém o mês anterior
    const lastMonth = getPreviousMonth(currentMonth);
    const lastMonthName = getMonthName(lastMonth);
    
    // Verifica se a aba do mês anterior já existe
    const sheets = ss.getSheets();
    const sheetNames = sheets.map(sheet => sheet.getName());
    
    if (sheetNames.includes(lastMonthName)) {
      // A aba do mês anterior já existe, então pergunta ao usuário se deseja continuar
      if (isAskUserQuestions) {
        const response = ui.alert(
          'Confirmação',
          `A aba do mês anterior (${lastMonthName}) já existe. Deseja continuar mesmo assim?`,
          ui.ButtonSet.YES_NO
        );
        
        if (response !== ui.Button.YES) {
          console.log('Operação cancelada pelo usuário');
          return undefined;
        }
      }
    }
    
    // Verifica se estamos no início do mês
    const dayOfMonth = today.getDate();
    if (dayOfMonth <= 5) {
      // Estamos no início do mês, então pergunta ao usuário se deseja virar o mês
      if (isAskUserQuestions) {
        const response = ui.alert(
          'Confirmação',
          `Estamos no início do mês (dia ${dayOfMonth}). Deseja realmente virar o mês?`,
          ui.ButtonSet.YES_NO
        );
        
        if (response !== ui.Button.YES) {
          console.log('Operação cancelada pelo usuário');
          return undefined;
        }
      }
    }
    
    // Verifica se a aba do mês atual já existe
    if (sheetNames.includes(currentMonthName)) {
      // A aba do mês atual já existe, então pergunta ao usuário se deseja continuar
      if (isAskUserQuestions) {
        const response = ui.alert(
          'Confirmação',
          `A aba do mês atual (${currentMonthName}) já existe. Isso pode indicar que o mês já foi virado. Deseja continuar mesmo assim?`,
          ui.ButtonSet.YES_NO
        );
        
        if (response !== ui.Button.YES) {
          console.log('Operação cancelada pelo usuário');
          return undefined;
        }
      }
    }
    
    return {
      currentMonth,
      currentMonthName,
      lastMonth,
      lastMonthName
    };
  } catch (e) {
    console.error('Erro ao calcular mês atual e próximo: %s', e);
    ui.alert('Erro', `Ocorreu um erro ao calcular o mês atual e próximo: ${e}`, ui.ButtonSet.OK);
    return undefined;
  }
}

/**
 * Calcula o mês atual e o próximo mês para virada de ano a partir da data de hoje
 * @returns Objeto com mês atual e próximo
 */
export function getCurrentAndNextMonthYear(): { currentMonth: Date, nextMonth: Date } {
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonth = getNextMonth(currentMonth);
  
  return { currentMonth, nextMonth };
}

/**
 * Inicializa a macro com os parâmetros fornecidos
 * @param nomeMacro Nome da macro
 * @param anoMes Ano e mês
 * @param ss Planilha ativa
 * @param mesCorrenteSheet Aba do mês corrente
 * @param ui Interface do usuário
 * @param isAskUserQuestions Flag para perguntar ao usuário
 * @returns Objeto com informações da inicialização
 */
export function inicializaMacroComAnoMes(
  nomeMacro: string, 
  anoMes: string, 
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet, 
  mesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet, 
  ui: GoogleAppsScript.Base.Ui, 
  isAskUserQuestions: boolean
): { anoMes: string, ss: GoogleAppsScript.Spreadsheet.Spreadsheet, mesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet } {
  try {
    console.log('Iniciando macro %s...', nomeMacro);
    ss.toast(`Iniciando macro ${nomeMacro}...`);
    
    // Verifica se a aba do mês corrente existe
    if (!mesCorrenteSheet) {
      const errorMessage = `A aba ${ABA_MES_CORRENTE_NAME} não foi encontrada`;
      console.error(errorMessage);
      
      if (isAskUserQuestions) {
        ui.alert('Erro', errorMessage, ui.ButtonSet.OK);
      }
      
      throw new Error(errorMessage);
    }
    
    // Se o ano/mês não foi fornecido, pergunta ao usuário
    if (!anoMes && isAskUserQuestions) {
      const today = new Date();
      const defaultAnoMes = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const response = ui.prompt(
        'Ano e Mês',
        'Informe o ano e mês no formato YYYY-MM:',
        ui.ButtonSet.OK_CANCEL
      );
      
      if (response.getSelectedButton() === ui.Button.CANCEL) {
        throw new Error('Operação cancelada pelo usuário');
      }
      
      anoMes = response.getResponseText() || defaultAnoMes;
    }
    
    return { anoMes, ss, mesCorrenteSheet };
  } catch (e) {
    console.error('Erro ao inicializar macro: %s', e);
    throw e;
  }
}

/**
 * Inicializa a macro com os parâmetros fornecidos
 * @param nomeMacro Nome da macro
 * @param ss Planilha ativa
 * @param ui Interface do usuário
 * @param isAskUserQuestions Flag para perguntar ao usuário
 * @returns Objeto com informações da inicialização
 */
export function inicializaMacro(
  nomeMacro: string, 
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet, 
  ui: GoogleAppsScript.Base.Ui, 
  isAskUserQuestions: boolean
): { ss: GoogleAppsScript.Spreadsheet.Spreadsheet, mesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet } {
  try {
    console.log('Iniciando macro %s...', nomeMacro);
    ss.toast(`Iniciando macro ${nomeMacro}...`);
    
    // Obtém a aba do mês corrente
    const mesCorrenteSheet = ss.getSheetByName(ABA_MES_CORRENTE_NAME);
    
    // Verifica se a aba do mês corrente existe
    if (!mesCorrenteSheet) {
      const errorMessage = `A aba ${ABA_MES_CORRENTE_NAME} não foi encontrada`;
      console.error(errorMessage);
      
      if (isAskUserQuestions) {
        ui.alert('Erro', errorMessage, ui.ButtonSet.OK);
      }
      
      throw new Error(errorMessage);
    }
    
    return { ss, mesCorrenteSheet };
  } catch (e) {
    console.error('Erro ao inicializar macro: %s', e);
    throw e;
  }
}

/**
 * Finaliza a macro
 * @param nomeMacro Nome da macro
 * @param ss Planilha ativa
 */
export function finalizaMacro(nomeMacro: string, ss: GoogleAppsScript.Spreadsheet.Spreadsheet): void {
  console.log('Finalizando macro %s...', nomeMacro);
  ss.toast(`Macro ${nomeMacro} finalizada com sucesso!`);
}

/**
 * Função personalizada para replicar a substituição de strings do console.log usando ss.toast
 * @param ss Planilha ativa
 * @param message Mensagem com placeholders (%s) para substituição
 * @param substitutions Valores a serem substituídos nos placeholders
 */
export function toastInfo(
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet, 
  message: string, 
  ...substitutions: (string | number | boolean | Date | null | undefined)[]
): void {
  let formattedMessage = message;
  
  if (substitutions && substitutions.length > 0) {
    for (const substitution of substitutions) {
      if (substitution !== null && substitution !== undefined) {
        formattedMessage = formattedMessage.replace('%s', substitution.toString());
      } else {
        formattedMessage = formattedMessage.replace('%s', '');
      }
    }
  }
  
  ss.toast(formattedMessage);
}
