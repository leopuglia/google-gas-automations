/**
 * MACROS DA PLANILHA DE CONSUMO
 *
 * Autor: Leonardo Puglia
 *
 * Inclui macros para virada de mês das planilhas de consumo, além de outras macros úteis
 *
 * OBS:
 *   Preciso modificar e conferir as rotinas de virada de ano!!!
 *   Futuramente mover as subrotinas para a biblioteca VilladasPedrasLib
 *   Refatorar o código desse script pra diminuir a redundância
 */

import * as VilladasPedrasLib from '../commons/VilladasPedrasLib';

/**********************************
 *
 * DEFINIÇÕES GLOBAIS
 *
 ***********************************/

// Constantes Globais
const ABA_MES_CORRENTE_NAME = VilladasPedrasLib.ABA_MES_CORRENTE_NAME;
const ABA_MODELO_NAME = VilladasPedrasLib.ABA_MODELO_NAME;
const SHARED_FOLDER_NAME = VilladasPedrasLib.SHARED_FOLDER_NAME;
const EMAIL_ADMIN = VilladasPedrasLib.EMAIL_ADMIN;

// Variáveis Globais
let IS_RUN_SLOW_ROUTINES = true;
// let IS_RUN_VIRAR_CONSUMO = true;
let IS_ASK_USER_QUESTIONS = true;
let PLANILHA_SALARIO_NAME = 'Salário';
let PLANILHA_CONSUMO_NAME = 'Consumo';
let TODAY = new Date();

// Redefinição de Variáveis Globais para TESTES
// IS_RUN_SLOW_ROUTINES = false;
// IS_RUN_VIRAR_CONSUMO = false;
// IS_ASK_USER_QUESTIONS = false;
// PLANILHA_SALARIO_NAME = 'TESTE Salário';
// PLANILHA_CONSUMO_NAME = 'TESTE Consumo';
// TODAY = new Date(2025,0,1);

// Interface para simplificar acesso aos objetos globais
interface GlobalObjects {
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet;
  ui: GoogleAppsScript.Base.Ui;
  MesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet;
  ModeloSheet: GoogleAppsScript.Spreadsheet.Sheet;
}

// Variáveis Globais Dinâmicas
const addGetter_ = <T>(name: string, value: () => T, obj: object = globalThis): object => {
  Object.defineProperty(obj, name, {
    enumerable: true,
    configurable: true,
    get() {
      delete (this as any)[name];
      return ((this as any)[name] = value());
    },
  });
  return obj;
};

// Define getters para objetos globais
[
  ['ss', () => SpreadsheetApp.getActive()],
  ['ui', () => SpreadsheetApp.getUi()],
  ['MesCorrenteSheet', () => (globalThis as any).ss.getSheetByName(ABA_MES_CORRENTE_NAME)],
  ['ModeloSheet', () => (globalThis as any).ss.getSheetByName(ABA_MODELO_NAME)],
].forEach(([n, v]) => addGetter_(n as string, v as () => any));

/**********************************
 *
 * MACROS DE VIRADA DE MÊS
 *
 ***********************************/

/**
 * Macro para virar o mês na planilha de consumo
 */
function VIRAR_MES_CONSUMO(): void {
  const NOME_MACRO = 'VIRAR_MES_CONSUMO';
  const ANO_MES = 'mes';

  if (!inicializaMacro_(NOME_MACRO, ANO_MES)) return;

  /**
   *
   * CALCULANDO OS NOMES DO MÊS ATUAL E MÊS ANTERIOR
   *
   * Aqui estamos obtendo o nome do mês atual a partir da data de hoje e da última aba virada
   *
   */
  const monthInfo = getCurrentAndNextMonth_();

  // Se não obtiver informações de mês, aborta
  if (!monthInfo) return;

  const { currentMonth, currentMonthName, lastMonth, lastMonthName } = monthInfo;

  // Abrindo a planilha ativa
  console.info('Mês Atual = %s / Mês anterior = %s', currentMonthName, lastMonthName);

  // Abrindo a aba 'MES CORRENTE'
  if (!(globalThis as any).MesCorrenteSheet) {
    const errorMsg = `A aba '${ABA_MES_CORRENTE_NAME}' não existe! Abortando execução...`;
    throw new Error(errorMsg);
  }

  /**
   *
   * EXECUTANDO A ROTINA DE VIRADA DE MÊS NA PLANILHA DE SALARIO DE FATO
   *
   */
  console.info('Virando a aba do mês de %s para %s', lastMonthName, currentMonthName);
  virarMesConsumo_(currentMonth, lastMonth);

  finalizaMacro_(NOME_MACRO);
}

/**********************************
 *
 * VIRADA DE ANO
 *
 ***********************************/

/**
 * Macro para virar o ano na planilha de consumo
 */
function VIRAR_ANO_CONSUMO(): void {
  const NOME_MACRO = 'VIRAR_ANO_CONSUMO';
  const ANO_MES = 'ano';

  if (!inicializaMacro_(NOME_MACRO, ANO_MES)) return;

  /**
   *
   * CALCULANDO OS NOMES DO MÊS ATUAL E MÊS ANTERIOR
   *
   * Aqui estamos obtendo o nome do mês atual a partir da data de hoje e da última aba virada
   *
   */
  const monthInfo = getCurrentAndNextMonthYear_();
  const { currentMonth, currentMonthName, lastMonth, lastMonthName } = monthInfo;

  // Abrindo a planilha ativa
  console.info('Mês Atual = %s / Mês anterior = %s', currentMonthName, lastMonthName);

  // Abrindo a aba 'MES CORRENTE'
  if (!(globalThis as any).MesCorrenteSheet) {
    const errorMsg = `A aba '${ABA_MES_CORRENTE_NAME}' não existe! Abortando execução...`;
    throw new Error(errorMsg);
  }

  /**
   *
   * EXECUTANDO A ROTINA DE VIRADA DE ANO NA PLANILHA DE SALARIO DE FATO
   *
   */
  console.info('Virando a planilha do ano de %s para %s', lastMonthName, currentMonthName);
  virarAnoConsumo_(currentMonth, lastMonth);

  finalizaMacro_(NOME_MACRO);
}

/**
 * Inicializa uma macro
 * @param nomeMacro Nome da macro para log
 * @param anoMes Tipo de virada: 'ano' ou 'mes'
 * @returns true se inicialização bem sucedida, false caso contrário
 */
function inicializaMacro_(nomeMacro: string, anoMes: string): boolean {
  return VilladasPedrasLib.inicializaMacro(
    nomeMacro,
    anoMes,
    (globalThis as any).ss,
    (globalThis as any).MesCorrenteSheet,
    (globalThis as any).ui,
    IS_ASK_USER_QUESTIONS
  );
}

/**
 * Finaliza a macro com mensagem de sucesso
 * @param nomeMacro Nome da macro para log
 */
function finalizaMacro_(nomeMacro: string): void {
  VilladasPedrasLib.finalizaMacro(nomeMacro);
}

/**
 * Obtém informações sobre mês atual e próximo
 * @returns Objeto com informações dos meses ou undefined se operação cancelada
 */
function getCurrentAndNextMonth_(): VilladasPedrasLib.MonthInfo | undefined {
  return VilladasPedrasLib.getCurrentAndNextMonth(
    (globalThis as any).ss.getName(),
    (globalThis as any).ss,
    (globalThis as any).ui,
    IS_ASK_USER_QUESTIONS
  );
}

/**
 * Obtém informações sobre mês atual e próximo para virada de ano
 * @returns Objeto com informações dos meses
 */
function getCurrentAndNextMonthYear_(): VilladasPedrasLib.MonthInfo {
  return VilladasPedrasLib.getCurrentAndNextMonthYear();
}

// Expondo as funções globalmente para o GAS
// Necessário para o Google Apps Script conseguir acessar as funções
// global.VIRAR_MES_CONSUMO = VIRAR_MES_CONSUMO;
// global.VIRAR_ANO_CONSUMO = VIRAR_ANO_CONSUMO;
