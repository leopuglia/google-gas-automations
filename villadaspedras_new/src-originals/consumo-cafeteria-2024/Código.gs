/** 
 * MACROS DA PLANILHA DE CONSUMO
 * 
 * Versão: 0.1.4 | Data: 05/09/2024
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
var IS_RUN_SLOW_ROUTINES = true;
// var IS_RUN_VIRAR_CONSUMO = true;
var IS_ASK_USER_QUESTIONS = true;
var PLANILHA_SALARIO_NAME = 'Salário';
var PLANILHA_CONSUMO_NAME = 'Consumo';
var TODAY = new Date();

// Redefinição de Variáveis Globais para TESTES
// IS_RUN_SLOW_ROUTINES = false;
// IS_RUN_VIRAR_CONSUMO = false;
// IS_ASK_USER_QUESTIONS = false;
// PLANILHA_SALARIO_NAME = 'TESTE Salário';
// PLANILHA_CONSUMO_NAME = 'TESTE Consumo';
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
function VIRAR_MES_CONSUMO() {
  const NOME_MACRO = 'VIRAR_MES_CONSUMO';
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

  // Abrindo a planilha ativa
  console.info('Mês Atual = %s / Mês anterior = %s', currentMonthName, lastMonthName);

  // Abrindo a aba 'MES CORRENTE'
  if (! MesCorrenteSheet) {
    let errorMsg = `A aba '${ABA_MES_CORRENTE_NAME}' não existe! Abortando execução...`;

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
 * 
*/
function VIRAR_ANO_CONSUMO() {
  const NOME_MACRO = 'VIRAR_ANO_CONSUMO';
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

  // Abrindo a planilha ativa
  console.info('Mês Atual = %s / Mês anterior = %s', currentMonthName, lastMonthName);

  // Abrindo a aba 'MES CORRENTE'
  if (! MesCorrenteSheet) {
    let errorMsg = `A aba '${ABA_MES_CORRENTE_NAME}' não existe! Abortando execução...`;

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
