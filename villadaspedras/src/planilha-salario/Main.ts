/**
 * MACROS DA PLANILHA DE SALÁRIOS
 *
 * Autor: Leonardo Puglia
 *
 * Inclui macros para virada de mês e de ano da planilha de salários e das planilhas de consumo, além de outras macros úteis
 *
 * OBS:
 *   Preciso modificar e conferir as rotinas de virada de ano!!!
 *   Refatorar o código desse script pra diminuir a redundância
 *   Documentar todas as funções
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
const PLANILHA_SALARIO_NAME = VilladasPedrasLib.PLANILHA_SALARIO_NAME;
const PLANILHA_CONSUMO_NAME = VilladasPedrasLib.PLANILHA_CONSUMO_NAME;
// const PLANILHA_SALARIO_NAME = 'TESTE Salário';
// const PLANILHA_CONSUMO_NAME = 'TESTE Consumo';

// Variáveis Globais
let IS_RUN_SLOW_ROUTINES = true;
let IS_RUN_VIRAR_CONSUMO = true;
let IS_ASK_USER_QUESTIONS = true;
let TODAY = new Date();

// Redefinição de Variáveis Globais para TESTES
// IS_RUN_SLOW_ROUTINES = false;
// IS_RUN_VIRAR_CONSUMO = false;
// IS_ASK_USER_QUESTIONS = false;
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
 * Macro para virar o mês na planilha de salário
 */
function VIRAR_MES_SALARIO(): void {
  const NOME_MACRO = 'VIRAR_MES_SALARIO';
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

  /**
   *
   * EXECUTANDO A ROTINA DE VIRADA DE MÊS NA PLANILHA DE SALARIO DE FATO
   *
   */
  toastInfo_('Virando a aba do mês de %s para %s', lastMonthName, currentMonthName);
  virarMesSalario_(currentMonth, lastMonth);

  finalizaMacro_(NOME_MACRO);
}

/**
 * Macro para virar o mês em todas as planilhas (salário e consumo)
 */
function VIRAR_MES_TUDO(): void {
  const NOME_MACRO = 'VIRAR_MES_TUDO';
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

  /**
   *
   * EXECUTANDO A ROTINA DE VIRADA DE MÊS NA PLANILHA DE SALARIO DE FATO
   *
   */
  toastInfo_('Virando a aba do mês de %s para %s', lastMonthName, currentMonthName);
  virarMesSalario_(currentMonth, lastMonth);

  /**
   *
   * BUSCANDO E ALTERANDO AS PLANILHAS DE CONSUMO
   *
   */
  const map = getPlanilhasConsumo_(currentMonth);

  // Vira as planilhas de consumo salvas no map
  const sortedMap = new Map([...map.entries()].sort());
  for (const [key, value] of sortedMap) {
    toastInfo_('Virando o mês da planilha %s', key);
    const consumoSS = SpreadsheetApp.openById(value.getId());
    SpreadsheetApp.setActiveSpreadsheet(consumoSS);
    const consumoMesCorrenteSheet = activateSheet_(
      consumoSS.getSheetByName(ABA_MES_CORRENTE_NAME) as GoogleAppsScript.Spreadsheet.Sheet,
      consumoSS
    );
    const consumoModeloSheet = consumoSS.getSheetByName(ABA_MODELO_NAME);

    /**
     *
     * EXECUTANDO A ROTINA DE VIRADA DE MÊS NA PLANILHA DE CONSUMO DE FATO
     *
     */
    if (IS_RUN_VIRAR_CONSUMO && consumoModeloSheet) {
      virarMesConsumo_(
        currentMonth,
        lastMonth,
        consumoSS,
        consumoMesCorrenteSheet,
        consumoModeloSheet
      );
    }
  }

  reordenarNomesSalario_((globalThis as any).MesCorrenteSheet);

  finalizaMacro_(NOME_MACRO);
}

/**********************************
 *
 * VIRADA DE ANO
 *
 ***********************************/

/**
 * Macro para virar o ano na planilha de salário
 */
function VIRAR_ANO_SALARIO(): void {
  const NOME_MACRO = 'VIRAR_ANO_SALARIO';
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

  /**
   *
   * EXECUTANDO A ROTINA DE VIRADA DE ANO NA PLANILHA DE SALARIO DE FATO
   *
   */
  toastInfo_('Virando a planilha do ano de %s para %s', lastMonthName, currentMonthName);
  virarAnoSalario_(currentMonth, lastMonth);

  toastInfo_('Ordenando os nomes dos funcionários na aba %s', lastMonthName);
  const lastMonthSheet = (globalThis as any).ss.getSheetByName(lastMonthName);
  if (lastMonthSheet) {
    reordenarNomesSalario_(lastMonthSheet);
  }

  finalizaMacro_(NOME_MACRO);
}

/**
 * Macro para virar o ano em todas as planilhas (salário e consumo)
 */
function VIRAR_ANO_TUDO(): void {
  const NOME_MACRO = 'VIRAR_ANO_TUDO';
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

  /**
   *
   * EXECUTANDO A ROTINA DE VIRADA DE ANO NA PLANILHA DE SALARIO DE FATO
   *
   */
  toastInfo_('Virando a planilha do ano de %s para %s', lastMonthName, currentMonthName);
  virarAnoSalario_(currentMonth, lastMonth);

  /**
   *
   * BUSCANDO E ALTERANDO AS PLANILHAS DE CONSUMO
   *
   */
  const map = getPlanilhasConsumo_(lastMonth);

  // Vira as planilhas de consumo salvas no map
  const sortedMap = new Map([...map.entries()].sort());
  for (const [key, value] of sortedMap) {
    toastInfo_('Virando o ano da planilha %s', key);
    const consumoSS = SpreadsheetApp.openById(value.getId());
    SpreadsheetApp.setActiveSpreadsheet(consumoSS);
    const consumoMesCorrenteSheet = activateSheet_(
      consumoSS.getSheetByName(ABA_MES_CORRENTE_NAME) as GoogleAppsScript.Spreadsheet.Sheet,
      consumoSS
    );
    const consumoModeloSheet = consumoSS.getSheetByName(ABA_MODELO_NAME);

    /**
     *
     * EXECUTANDO A ROTINA DE VIRADA DE ANO NA PLANILHA DE CONSUMO DE FATO
     *
     */
    if (IS_RUN_VIRAR_CONSUMO && consumoModeloSheet) {
      virarAnoConsumo_(
        currentMonth,
        lastMonth,
        consumoSS,
        consumoMesCorrenteSheet,
        consumoModeloSheet
      );
    }
  }

  toastInfo_('Ordenando os nomes dos funcionários na aba %s', lastMonthName);
  const lastMonthSheet = (globalThis as any).ss.getSheetByName(lastMonthName);
  if (lastMonthSheet) {
    reordenarNomesSalario_(lastMonthSheet);
  }

  finalizaMacro_(NOME_MACRO);
}

/**********************************
 *
 * OUTRAS MACROS
 *
 ***********************************/

/**
 * Macro para bloquear alterações na aba atual
 */
function BLOQUEAR_ALTERACOES(): void {
  const NOME_MACRO = 'BLOQUEAR_ALTERACOES';

  if (!inicializaMacroSimples_(NOME_MACRO)) return;

  // Bloqueando a aba atual
  toastInfo_('Protegendo a aba atual %s', (globalThis as any).ss.getActiveSheet().getName());
  protectSheet_((globalThis as any).ss.getActiveSheet());

  finalizaMacro_(NOME_MACRO);
}

/**
 * Macro para reordenar os nomes na aba atual
 */
function REORDENAR_NOMES(): void {
  const NOME_MACRO = 'REORDENAR_NOMES';

  if (!inicializaMacroSimples_(NOME_MACRO)) return;

  // Reordenando os nomes da aba atual
  toastInfo_(
    'Reordenando os nomes da aba atual %s',
    (globalThis as any).ss.getActiveSheet().getName()
  );
  reordenarNomesSalario_((globalThis as any).ss.getActiveSheet());

  finalizaMacro_(NOME_MACRO);
}

/**
 * Macro para limpar as cores da aba atual
 */
function LIMPAR_CORES(): void {
  const NOME_MACRO = 'LIMPAR_CORES';

  if (!inicializaMacroSimples_(NOME_MACRO)) return;

  // Limpando as cores da aba atual
  toastInfo_(
    'Limpando as cores da aba atual %s',
    (globalThis as any).ss.getActiveSheet().getName()
  );
  limparCores_((globalThis as any).ss.getActiveSheet().getDataRange());

  finalizaMacro_(NOME_MACRO);
}

/**
 * Macro para limpar os dados da aba atual
 */
function LIMPAR_DADOS(): void {
  const NOME_MACRO = 'LIMPAR_DADOS';

  if (!inicializaMacroSimples_(NOME_MACRO)) return;

  // Limpando os dados da aba atual
  toastInfo_(
    'Limpando os dados da aba atual %s',
    (globalThis as any).ss.getActiveSheet().getName()
  );
  limparDados_((globalThis as any).ModeloSheet, (globalThis as any).ss.getActiveSheet());

  finalizaMacro_(NOME_MACRO);
}

/**
 * Macro para desproteger a aba atual
 */
function DESPROTEGER_ABA_ATUAL(): void {
  const NOME_MACRO = 'DESPROTEGER_ABA_ATUAL';

  if (!inicializaMacroSimples_(NOME_MACRO)) return;

  // Desprotegendo a aba atual
  toastInfo_('Desprotegendo a aba atual %s', (globalThis as any).ss.getActiveSheet().getName());
  unprotectSheet_((globalThis as any).ss.getActiveSheet());

  finalizaMacro_(NOME_MACRO);
}

/**
 * Macro para copiar a proteção de intervalos da aba modelo para a aba atual
 */
function COPIAR_PROTECAO_INTERVALOS_MODELO_PARA_ABA_ATUAL(): void {
  const NOME_MACRO = 'COPIAR_PROTECAO_INTERVALOS_MODELO_PARA_ABA_ATUAL';

  if (!inicializaMacroSimples_(NOME_MACRO)) return;

  // Copiando a proteção dos intervalos da aba modelo para a aba atual
  toastInfo_(
    'Copiando a proteção dos intervalos da aba %s para a aba %s',
    ABA_MODELO_NAME,
    (globalThis as any).ss.getActiveSheet().getName()
  );
  copyIntervalProtections_(
    (globalThis as any).ModeloSheet,
    (globalThis as any).ss.getActiveSheet()
  );

  finalizaMacro_(NOME_MACRO);
}

/**********************************
 *
 * FUNÇÕES AUXILIARES
 *
 ***********************************/

// Importação das funções de outros arquivos
declare function virarMesSalario_(currentMonth: Date, lastMonth: Date): void;
declare function virarAnoSalario_(currentMonth: Date, lastMonth: Date): void;
declare function virarMesConsumo_(
  currentMonth: Date,
  lastMonth: Date,
  ssConsumo?: GoogleAppsScript.Spreadsheet.Spreadsheet,
  mesCorrenteSheet?: GoogleAppsScript.Spreadsheet.Sheet,
  modeloSheet?: GoogleAppsScript.Spreadsheet.Sheet
): void;
declare function virarAnoConsumo_(
  currentMonth: Date,
  lastMonth: Date,
  ssConsumo?: GoogleAppsScript.Spreadsheet.Spreadsheet,
  mesCorrenteSheet?: GoogleAppsScript.Spreadsheet.Sheet,
  modeloSheet?: GoogleAppsScript.Spreadsheet.Sheet
): void;

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
 * Inicializa uma macro simples (sem perguntas)
 * @param nomeMacro Nome da macro para log
 * @returns true se inicialização bem sucedida, false caso contrário
 */
function inicializaMacroSimples_(nomeMacro: string): boolean {
  return VilladasPedrasLib.inicializaMacroSimples(nomeMacro, (globalThis as any).ss);
}

/**
 * Finaliza a macro com mensagem de sucesso
 * @param nomeMacro Nome da macro para log
 */
function finalizaMacro_(nomeMacro: string): void {
  VilladasPedrasLib.finalizaMacro(nomeMacro);
}

/**
 * Função personalizada para replicar a substituição de strings do console.log usando ss.toast
 * @param message A mensagem com placeholders (%s) para substituição
 * @param substitutions Os valores a serem substituídos nos placeholders
 */
function toastInfo_(message: string, ...substitutions: unknown[]): void {
  VilladasPedrasLib.toastInfo((globalThis as any).ss, message, ...substitutions);
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

/**
 * Retorna um Map com as planilhas de consumo localizadas na pasta SHARED_FOLDER_NAME
 * @param currentMonth Mês atual
 * @returns Map com as planilhas de consumo encontradas
 */
function getPlanilhasConsumo_(
  currentMonth: Date
): Map<string, GoogleAppsScript.Spreadsheet.Spreadsheet> {
  return VilladasPedrasLib.getPlanilhasConsumo(currentMonth);
}

/**
 * Ativa uma aba específica da planilha
 * @param sheet Aba a ser ativada
 * @param ss Planilha ativa
 * @returns A aba ativada
 */
function activateSheet_(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet
): GoogleAppsScript.Spreadsheet.Sheet {
  VilladasPedrasLib.activateSheet(sheet, ss);
  return sheet;
}

/**
 * Protege a aba sheet para não permitir mais alterações
 * @param sheet Aba a ser protegida
 * @param sheetName Nome da aba (padrão: nome da aba)
 */
function protectSheet_(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  sheetName: string = sheet.getName()
): void {
  VilladasPedrasLib.protectSheet(sheet, sheetName);
}

/**
 * Copia todos os intervalos protegidos entre abas
 * @param sourceSheet Aba de origem
 * @param destinationSheet Aba de destino
 */
function copyIntervalProtections_(
  sourceSheet: GoogleAppsScript.Spreadsheet.Sheet,
  destinationSheet: GoogleAppsScript.Spreadsheet.Sheet
): void {
  VilladasPedrasLib.copyIntervalProtections((globalThis as any).ss, sourceSheet, destinationSheet);
}

/**
 * Função destinada a desbloquear uma aba bloqueada
 * @param sheet Aba a ser desprotegida
 */
function unprotectSheet_(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
  VilladasPedrasLib.unprotectSheet(sheet);
}

/**
 * Função destinada a desbloquear os intervalos de uma aba bloqueada
 * @param sheet Aba a ter os intervalos desprotegidos
 */
function unprotectIntervals_(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
  VilladasPedrasLib.unprotectIntervals(sheet);
}

/**
 * Reordena os nomes na planilha de salário
 * @param sheet Aba a ser reordenada
 */
function reordenarNomesSalario_(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
  VilladasPedrasLib.reordenarNomesSalario(sheet, (globalThis as any).ModeloSheet);
}

/**
 * Limpa as cores de um intervalo
 * @param range Intervalo a ter as cores limpas
 */
function limparCores_(range: GoogleAppsScript.Spreadsheet.Range): void {
  VilladasPedrasLib.limparCores(range);
}

/**
 * Limpa os dados entre abas
 * @param modeloSheet Aba modelo para referência
 * @param mesCorrenteSheet Aba do mês corrente
 */
function limparDados_(
  modeloSheet: GoogleAppsScript.Spreadsheet.Sheet,
  mesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet
): void {
  VilladasPedrasLib.limparDados(modeloSheet, mesCorrenteSheet);
}
