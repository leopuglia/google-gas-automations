/**********************************
 * 
 * FUNÇÔES AUXILIARES
 * 
***********************************/

/**
 * Calcula o mês atual e o próximo mês para virada de mês a partir da data de hoje e da última aba virada
 */
function getCurrentAndNextMonth_() {
  return VilladasPedrasLib.getCurrentAndNextMonth(ss.getName(), ss, ui, IS_ASK_USER_QUESTIONS);
}


/**
 * Calcula o mês atual e o próximo mês para virada de mês a partir da data de hoje e da última aba virada
 */
function getCurrentAndNextMonthYear_() {
  return VilladasPedrasLib.getCurrentAndNextMonthYear(ss.getName());
}



/**
 * 
 */
function inicializaMacro_(nomeMacro, anoMes) {
  return VilladasPedrasLib.inicializaMacro(nomeMacro, anoMes, ss, MesCorrenteSheet, ui, IS_ASK_USER_QUESTIONS);
}



/**
 * 
 */
function inicializaMacro_(nomeMacro) {
  return VilladasPedrasLib.inicializaMacro(nomeMacro, ss, ui, IS_ASK_USER_QUESTIONS);
}



/**
 * 
 */
function finalizaMacro_(nomeMacro) {
  VilladasPedrasLib.finalizaMacro(nomeMacro, ss);
}



/**
 * 
 */
function toastInfo_(message, ...substitutions) {
  VilladasPedrasLib.toastInfo(ss, message, substitutions);
}



/** 
 * 
*/
function getFirstTuesday_(date = new Date()) {
  return VilladasPedrasLib.getFirstTuesday(date);
}



/** 
 * 
*/
function getPreviousMonth_(date = new Date()) {
  return VilladasPedrasLib.getPreviousMonth(date);
}



/** 
 * 
*/
function getNextMonth_(date = new Date()) {
  return VilladasPedrasLib.getNextMonth(date);
}



/**
 * Formata o nome do mês fornecido no formato "yyyy-MM"
 * 
 * @param {Date} date Data desejada ou data de hoje se nulo.
 * @return {String} Nome do mês.
 */
function getMonthName_(date = new Date()) {
  return VilladasPedrasLib.getMonthName(date)
}



/** 
 * 
*/
function activateSheet_(sheet, spreadsheet = ss) {
  return VilladasPedrasLib.activateSheet(sheet, spreadsheet);
}



/**
 * Busca a ID de um Drive Compartilhado pelo nome.
 * 
 * @param {String} sharedFolderName Nome da pasta compartilhada.
 * @param {Object} drive Instância da classe global Drive.
 * @return {Integer} ID do drive pesquisado.
 */
function getDriveIDByName_(sharedFolderName) {
  return VilladasPedrasLib.getDriveIDByName(sharedFolderName, Drive);
}



/**
 * 
 */
function getPlanilhasConsumo_(currentMonth) {
  return VilladasPedrasLib.getPlanilhasConsumo(currentMonth, Drive);
}



/** 
 * Protege a aba sheet para não permitir mais alterações
*/
function protectSheet_(sheet, sheetName = sheet.getName()) {
  VilladasPedrasLib.protectSheet(sheet, sheetName);
}



/** 
 * Copia todos os intervalos protegidos entre abas
*/
function copyIntervalProtections_(sourceSheet, destinationSheet) {
  VilladasPedrasLib.copyIntervalProtections(ss, sourceSheet, destinationSheet);
}



/**
 * Função destinada a desbloquear uma aba bloqueada
 */
function unprotectSheet_(sheet) {
  VilladasPedrasLib.unprotectSheet(sheet);
}



/**
 * Função destinada a desbloquear os intervalos de uma aba bloqueada
 */
function unprotectIntervals_(sheet) {
  VilladasPedrasLib.unprotectIntervals(sheet);
}



/**
 * 
 */
function reordenarNomesSalario_(sheet = ss.getActiveSheet()) {
  VilladasPedrasLib.reordenarNomesSalario(sheet, ModeloSheet);
}



/**
 * 
 */
function limparCores_(range) {
  VilladasPedrasLib.limparCores(range);
}



/**
 * 
 */
function limparDados_() {
  VilladasPedrasLib.limparDados(ModeloSheet, MesCorrenteSheet);
}


