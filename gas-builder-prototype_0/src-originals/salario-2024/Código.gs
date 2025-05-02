/** 
 * MACROS DA PLANILHA DE SALÁRIOS
 * 
 * Versão: 0.1.4 | Data: 05/09/2024
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
var IS_RUN_SLOW_ROUTINES = true;
var IS_RUN_VIRAR_CONSUMO = true;
var IS_ASK_USER_QUESTIONS = true;
var TODAY = new Date();

// Redefinição de Variáveis Globais para TESTES
// IS_RUN_SLOW_ROUTINES = false;
// IS_RUN_VIRAR_CONSUMO = false;
// IS_ASK_USER_QUESTIONS = false;
// TODAY = new Date(2025,0,1);

// Variáveis Globais Dinâmicas
const addGetter_ = (name, value, obj = this) => {
  Object.defineProperty(obj, name, {
    enumerable: true,
    configurable: true,
    get() {
      delete this[name];
      return (this[name] = value());
    },
  });
  return obj;
};
[
  ['ss', () => SpreadsheetApp.getActive()],
  ['ui', () => SpreadsheetApp.getUi()],
  ['MesCorrenteSheet', () => ss.getSheetByName(ABA_MES_CORRENTE_NAME)],
  ['ModeloSheet', () => ss.getSheetByName(ABA_MODELO_NAME)],
].forEach(([n, v]) => addGetter_(n, v));



/**********************************
 * 
 * MACROS DE VIRADA DE MÊS
 * 
***********************************/

/** 
 * 
*/
function VIRAR_MES_SALARIO() {
  const NOME_MACRO = 'VIRAR_MES_SALARIO';
  const ANO_MES = 'mes';

  if (! inicializaMacro_(NOME_MACRO, ANO_MES)) return;

  /**
   * 
   * CALCULANDO OS NOMES DO MÊS ATUAL E MÊS ANTERIOR
   * 
   * Aqui estamos obtendo o nome do mês atual a partir da data de hoje e da última aba virada
   * 
   */
  const { currentMonth, currentMonthName, lastMonth, lastMonthName} = getCurrentAndNextMonth_();

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
 * 
*/
function VIRAR_MES_TUDO() {
  const NOME_MACRO = 'VIRAR_MES_TUDO';
  const ANO_MES = 'mes';

  if (! inicializaMacro_(NOME_MACRO, ANO_MES)) return;

  /**
   * 
   * CALCULANDO OS NOMES DO MÊS ATUAL E MÊS ANTERIOR
   * 
   * Aqui estamos obtendo o nome do mês atual a partir da data de hoje e da última aba virada
   * 
   */
  const { currentMonth, currentMonthName, lastMonth, lastMonthName} = getCurrentAndNextMonth_();

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
  var map = getPlanilhasConsumo_(currentMonth);

  // Vira as planilhas de consumo salvas no map
  // var i = 0;
  map = new Map([...map.entries()].sort());
  for (let [key, value] of map) {
    toastInfo_('Virando o mês da planilha %s', key);
    // break;
    var consumoSS = SpreadsheetApp.openById(value.getId());
    SpreadsheetApp.setActiveSpreadsheet(consumoSS);
    var consumoMesCorrenteSheet = activateSheet_(consumoSS, consumoSS.getSheetByName(ABA_MES_CORRENTE_NAME));
    var consumoModeloSheet = consumoSS.getSheetByName(ABA_MODELO_NAME);

    /**
     * 
     * EXECUTANDO A ROTINA DE VIRADA DE MÊS NA PLANILHA DE CONSUMO DE FATO
     * 
     */
    if (IS_RUN_VIRAR_CONSUMO) {
      virarMesConsumo_(currentMonth, lastMonth, consumoSS, consumoMesCorrenteSheet, consumoModeloSheet);
    }
  }

  reordenarNomesSalario_(MesCorrenteSheet);

  finalizaMacro_(NOME_MACRO);
}



/**********************************
 * 
 * VIRADA DE ANO
 * 
***********************************/

/** 
 * 
*/
function VIRAR_ANO_SALARIO() {
  const NOME_MACRO = 'VIRAR_ANO_SALARIO';
  const ANO_MES = 'ano';

  if (! inicializaMacro_(NOME_MACRO, ANO_MES)) return;

  /**
   * 
   * CALCULANDO OS NOMES DO MÊS ATUAL E MÊS ANTERIOR
   * 
   * Aqui estamos obtendo o nome do mês atual a partir da data de hoje e da última aba virada
   * 
   */
  const { currentMonth, currentMonthName, lastMonth, lastMonthName} = getCurrentAndNextMonthYear_();

  // // Ativando a aba mes corrente na planilha atual
  // activateSheet_(MesCorrenteSheet);

  /**
   * 
   * EXECUTANDO A ROTINA DE VIRADA DE ANO NA PLANILHA DE SALARIO DE FATO
   * 
   */
  toastInfo_('Virando a planilha do ano de %s para %s', lastMonthName, currentMonthName);
  virarAnoSalario_(currentMonth, lastMonth);

  constoastInfo_('Ordenando os nomes dos funcionários na aba %s', lastMonthName);
  reordenarNomesSalario_(ss.getSheetByName(lastMonthName).getRange('3:103'));

  finalizaMacro_(NOME_MACRO);
}



/** 
 * 
*/
function VIRAR_ANO_TUDO() {
  const NOME_MACRO = 'VIRAR_ANO_TUDO';
  const ANO_MES = 'ano';

  if (! inicializaMacro_(NOME_MACRO, ANO_MES)) return;

  /**
   * 
   * CALCULANDO OS NOMES DO MÊS ATUAL E MÊS ANTERIOR
   * 
   * Aqui estamos obtendo o nome do mês atual a partir da data de hoje e da última aba virada
   * 
   */
  const { currentMonth, currentMonthName, lastMonth, lastMonthName} = getCurrentAndNextMonthYear_();

  // // Ativando a aba mes corrente na planilha atual
  // activateSheet_(MesCorrenteSheet);

  /**
   * 
   * EXECUTANDO A ROTINA DE VIRADA DE ANO NA PLANILHA DE SALARIO DE FATO
   * 
   */
  console.info('Virando a planilha do ano de %s para %s', lastMonthName, currentMonthName);
  virarAnoSalario_(currentMonth, lastMonth);

  /**
   * 
   * BUSCANDO E ALTERANDO AS PLANILHAS DE CONSUMO
   * 
   */
  var map = getPlanilhasConsumo_(currentMonth);

  var i = 0;
  map = new Map([...map.entries()].sort());
  for (let [key, value] of map) {
    console.info('Virando o ano da planilha %s', key);

    // if (i < 1) {
    //   i++;
    //   continue;
    // }

    var importRange = `=IMPORTRANGE("${value.getUrl()}"; "${ABA_MES_CORRENTE_NAME}!$AQ$4:$AQ$104")`;
    console.info(importRange);
    newMesCorrenteSheet.getRange(3, 21 + i).setValue(importRange);
    newModeloSheet.getRange(3, 21 + i).setValue(importRange);

    var consumoSS = SpreadsheetApp.openById(value.getId());
    SpreadsheetApp.setActiveSpreadsheet(consumoSS);
    var consumoMesCorrenteSheet = activateSheet_(consumoSS, consumoSS.getSheetByName(ABA_MES_CORRENTE_NAME));
    var consumoModeloSheet = consumoSS.getSheetByName(ABA_MODELO_NAME);

    virarAnoConsumo_(currentMonth, lastMonth, consumoSS, consumoMesCorrenteSheet, consumoModeloSheet);

    importRange = `=IMPORTRANGE("${ssNew.getUrl()}"; "${ABA_MES_CORRENTE_NAME}!$AB$3:$AB$104")`;
    console.info(importRange);
    consumoMesCorrenteSheet.getRange('A4').setValue(importRange);
    consumoModeloSheet.getRange('A4').setValue(importRange);

    importRange = `=IMPORTRANGE("${ssNew.getUrl()}"; "${ABA_MES_CORRENTE_NAME}!$C$3:$C$103")`;
    console.info(importRange);
    consumoMesCorrenteSheet.getRange('B4').setValue(importRange);
    consumoModeloSheet.getRange('B4').setValue(importRange);

    i++;
  }

  console.info('Ordenando os nomes dos funcionários na aba %s', lastMonthName);
  reordenarNomesSalario_(lastMonthSheet.getRange('3:103'));

  finalizaMacro_(NOME_MACRO);
}



/**********************************
 * 
 * MACROS ADICIONAIS
 * 
***********************************/

/** 
 * 
*/
function BLOQUEAR_ALTERACOES() {
  const NOME_MACRO = 'BLOQUEAR_ALTERACOES';

  if (! inicializaMacro_(NOME_MACRO)) return;

  protectSheet_(ss.getActiveSheet());

  finalizaMacro_(NOME_MACRO);
}



/** 
 * 
*/
function REORDENAR_NOMES() {
  const NOME_MACRO = 'REORDENAR_NOMES';

  if (! inicializaMacro_(NOME_MACRO)) return;

  reordenarNomesSalario_();

  finalizaMacro_(NOME_MACRO);
}



/** 
 * 
*/
function LIMPAR_CORES() {
  const NOME_MACRO = 'LIMPAR_CORES';

  if (! inicializaMacro_(NOME_MACRO)) return;

  limparCores_(ss.getRange('3:103').activate());

  finalizaMacro_(NOME_MACRO);
}



/** 
 * 
*/
function LIMPAR_DADOS() {
  const NOME_MACRO = 'LIMPAR_DADOS';

  if (! inicializaMacro_(NOME_MACRO)) return;

  limparDados_();

  finalizaMacro_(NOME_MACRO);
}



/** 
 * 
*/
function DESPROTEGER_ABA_ATUAL() {
  const NOME_MACRO = 'DESPROTEGER_ABA_ATUAL';

  if (! inicializaMacro_(NOME_MACRO)) return;

  unprotectSheet_(ss.getActiveSheet());

  finalizaMacro_(NOME_MACRO);
}



/** 
 * 
*/
function COPIAR_PROTECAO_INTERVALOS_MODELO_PARA_ABA_ATUAL() {
  const NOME_MACRO = 'COPIAR_PROTECAO_INTERVALOS_MODELO_PARA_ABA_ATUAL';

  if (! inicializaMacro_(NOME_MACRO)) return;

  var sourceSheet = ModeloSheet;
  var destinationSheet = ss.getActiveSheet();

  copyIntervalProtections_(sourceSheet, destinationSheet);

  finalizaMacro_(NOME_MACRO);
}



/**********************************
 * 
 * SESSAO PARA TESTES
 * 
***********************************/

// function TESTE() {
//   // SpreadsheetApp.getActive().toast('Teste');
//   // SpreadsheetApp.getActiveSpreadsheet().toast('Teste', 'Titulo');
//   ss.toast('Teste', 'Titulo', 1);
// }
