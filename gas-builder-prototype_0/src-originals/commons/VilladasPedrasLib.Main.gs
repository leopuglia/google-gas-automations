/** 
 * VilladasPedrasLib: Biblioteca da Villa das Pedras
 * 
 * Versão: 0.1.4 | Data: 05/09/2024
 * 
 * Autor: Leonardo Puglia
 * 
 * Descrição: Biblioteca com funções auxiliares para as macros de virada de mês e ano das planilhas de consumo e salário
 * 
 * OBS: 
 *   Documentar todas as funções
*/
/**
 * COMO DESCREVER UMA FUNÇÃO:
 * 
 * Aqui vem a descrição da função
 * @param {TIPO} nome_param1 Aqui vem a escrição do parâmetro 1
 * @param {TIPO} nome_param2 Aqui vem a escrição do parâmetro 2
 * @return {TIPO} Aqui vem a descrição do retorno
 */



/**********************************
 * 
 * DEFINIÇÕES GLOBAIS
 * 
***********************************/

// Constantes Globais
var ABA_MES_CORRENTE_NAME = 'MES CORRENTE';
var ABA_MODELO_NAME = 'MODELO';
var SHARED_FOLDER_NAME = 'Faturamento Villa';
var EMAIL_ADMIN = 'leo@villadaspedras.com';
var PLANILHA_SALARIO_NAME = 'Salário';
var PLANILHA_CONSUMO_NAME = 'Consumo';

// Variáveis Globais
// var IS_RUN_SLOW_ROUTINES = true;
// var IS_RUN_VIRAR_CONSUMO = true;
// var IS_ASK_USER_QUESTIONS = true;
// var TODAY = new Date();



/**********************************
 * 
 * CÁLCULO DE ATUAL E PRÓXIMO MES
 * 
***********************************/

/**
 * Calcula o mês atual e o próximo mês para virada de mês a partir da data de hoje e da última aba virada
 */
function getCurrentAndNextMonth(sheetname, ss, ui, isAskUserQuestions) {
  // Definindo o booleano de busca de meses anteriores
  var isSeekPreviousMonth = true;

  // Definindo o nome do mês atual e anterior
  const TODAY = new Date();
  let currentMonth = TODAY;
  // let currentMonth = sheetName.includes(TODAY.getFullYear()) ? TODAY : new Date(TODAY.getFullYear()-1,11,1);
  let currentMonthName = getMonthName(currentMonth);
  let lastMonth = getPreviousMonth(currentMonth);
  let lastMonthName = getMonthName(lastMonth);

  // Informando os dados de mês atual e anterior
  console.info('Mês Atual = %s / Mês anterior = %s', currentMonthName, lastMonthName);

  // Verificando se estamos no mesmo ano
  console.info('Verificando se estamos no mesmo ano %s que a planilha', TODAY.getFullYear());
  if (ss.getName().includes(TODAY.getFullYear())) {
    console.info('Estamos no mesmo ano %s que a planilha! Continuando...', TODAY.getFullYear());
  }
  else {
    console.info('Não estamos no mesmo ano %s que a planilha!', TODAY.getFullYear());
    
    currentMonth = new Date(TODAY.getFullYear()-1,11,1);
    currentMonthName = getMonthName(currentMonth);
    lastMonth = getPreviousMonth(currentMonth);
    lastMonthName = getMonthName(lastMonth);
    console.info('Alterando mês atual para %s', currentMonthName);
  }

  // Verificando se estamos em dezembro, janeiro OU se existe aba do mês anterior
  console.info('Verificando se estamos em dezembro, janeiro ou se existe aba do mês anterior %s', lastMonthName);
  if (currentMonth.getMonth() == 11) {
    console.info('Estamos em dezembro!');

    console.info('Perguntando ao usuário se deseja virar para o próximo ano...');
    if (isAskUserQuestions) {
      var response = ui.alert('Estamos no último mês do ano... Deseja virar para o próximo ano?', ui.ButtonSet.YES_NO);
      if (response !== ui.Button.YES) {
        console.warn('O usuário selecionou não! Abortando...');
        return;
      }
    }

    // Definimos o mês atual como o mês corrente e o mês corrente como o próximo mês
    lastMonth = currentMonth;
    lastMonthName = currentMonthName;
    currentMonth = getNextMonth(currentMonth);
    currentMonthName = getMonthName(currentMonth);

    /**
     * 
     * CHAMA A ROTINA DE VIRADA DE ANO DE SALARIO
     * 
     */
    console.info('Virando a planilha do ano de %s para %s', lastMonthName, currentMonthName);
    virarAnoSalario_(currentMonth, lastMonth);

  }
  // Se estamos em janeiro OU existe aba do mês anterior
  else if (currentMonth.getMonth() == 0 || ss.getSheetByName(lastMonthName)) {
    console.info('Estamos em janeiro ou existe aba do mês anterior %s!', lastMonthName);

    console.info('Perguntando ao usuário se deseja virar para o próximo mês...');

    if (isAskUserQuestions) {
      var response = ui.alert('A aba "MES CORRENTE" já é a aba do mês atual... Deseja realmente já virar para o próximo mês?', ui.ButtonSet.YES_NO);
      if (response !== ui.Button.YES) {
        console.warn('O usuário selecionou não! Abortando...');
        return;
      }
    }

    // if (currentMonth.getMonth() != 0) {
    //   // Protegendo a aba encontrada para não permitir mais alterações
    //   protectSheet(ss.getSheetByName(lastMonthName), lastMonthName);
    // }

    // Definimos o mês atual como o mês corrente e o mês corrente como o próximo mês
    lastMonth = currentMonth;
    lastMonthName = currentMonthName;
    currentMonth = getNextMonth(currentMonth);
    currentMonthName = getMonthName(currentMonth);

    isSeekPreviousMonth = false;
  }
  else {
    console.info('Não estamos em janeiro e não existe aba do mês anterior %s. Continuando...', lastMonthName);

    // Verificando se existe aba do mês atual
    console.info('Verificando se existe aba do mês atual %s', currentMonthName);
    let currentMonthSheet = ss.getSheetByName(currentMonthName);
    if (currentMonthSheet) {
      // console.info('A aba do mês atual %s existe!', currentMonthName);
      // // Aborta a execução se já existir a aba do mês seguinte
      // if (ss.getSheetByName(getMonthName(getNextMonth(currentMonth)))) {
      //   let errorMsg = `A aba do próximo mês já existe! Abortando execução...`;
      //   throw new Error(errorMsg);
      // }

      // if (currentMonth.getMonth() < 11) {
      //   console.info('Perguntando ao usuário se deseja virar para o próximo mês...');

      //   if (isAskUserQuestions) {
      //     var response = ui.alert('A aba do mês atual existe... Deseja já virar para o próximo mês?', ui.ButtonSet.YES_NO);
      //     if (response !== ui.Button.YES) {
      //       console.warn('O usuário selecionou não! Abortando...');
      //       return;
      //     }
      //   }

      //   // Definimos o mês atual como o mês corrente e o mês corrente como o próximo mês
      //   lastMonth = currentMonth;
      //   lastMonthName = currentMonthName;
      //   currentMonth = getNextMonth(currentMonth);
      //   currentMonthName = getMonthName(currentMonth);

      //   isSeekPreviousMonth = false;
      //   console.info('Mês Atual = %s / Mês anterior = %s', currentMonthName, lastMonthName);
      // }
      // else {
      //   let errorMsg = `O mês '${currentMonthName}' já foi virado! Abortando execução...`;
      //   throw new Error(errorMsg);
      // }

      let errorMsg = `O mês '${currentMonthName}' já foi virado! Abortando execução...`;
      throw new Error(errorMsg);
    }
    else {
      console.info('Nenhuma aba do mês %s foi encontrada. Continuando...', currentMonthName);
    }
  }

  let found = !isSeekPreviousMonth;
  let previousMonth;
  let previousMonthName;
  let previousMonthSheet;
  while (!found) {
    previousMonth = previousMonth ? getPreviousMonth(previousMonth) : lastMonth;
    previousMonthName = getMonthName(previousMonth);
    console.info('Verificando se existe aba do mês anterior %s', previousMonthName);

    previousMonthSheet = ss.getSheetByName(previousMonthName);
    if (previousMonthSheet) {
      console.info('A aba do mês %s existe!', previousMonthName);

      // Protegendo a aba encontrada para não permitir mais alterações
      protectSheet(previousMonthSheet, previousMonthName);

      lastMonth = getNextMonth(previousMonth);
      lastMonthName = getMonthName(lastMonth);
      currentMonth = getNextMonth(lastMonth);
      currentMonthName = getMonthName(currentMonth);

      found = true;
    }
    else if (previousMonth.getMonth() === 0) {
      console.info('Início do ano encontrado! %s', previousMonthName);

      lastMonth = previousMonth;
      lastMonthName = previousMonthName;
      currentMonth = getNextMonth(lastMonth);
      currentMonthName = getMonthName(currentMonth);
      console.info('Mês Atual = %s / Mês anterior = %s', currentMonthName, lastMonthName);

      found = true;
    }
    else {
      console.info('Nenhuma aba do mês %s foi encontrada. Continuando...', previousMonthName);
    }
  }

  return {
    currentMonth: currentMonth,
    currentMonthName: currentMonthName,
    lastMonth: lastMonth,
    lastMonthName: lastMonthName
  }
}



/**
 * Calcula o mês atual e o próximo mês para virada de ano a partir da data de hoje e da última aba virada
 */
function getCurrentAndNextMonthYear(sheetName) {
  // Definindo o nome do mês atual e anterior
  const TODAY = new Date();
  let currentMonth = sheetName.includes(TODAY.getFullYear()) ? new Date(TODAY.getFullYear()+1,0,1) : new Date(TODAY.getFullYear(), 0, 1);
  let currentMonthName = getMonthName(currentMonth);
  let lastMonth = getPreviousMonth(currentMonth);
  let lastMonthName = getMonthName(lastMonth);

  return {
    currentMonth: currentMonth,
    currentMonthName: currentMonthName,
    lastMonth: lastMonth,
    lastMonthName: lastMonthName
  }
}



/**********************************
 * 
 * FUNÇÔES AUXILIARES
 * 
***********************************/

/**
 * 
 */
function inicializaMacro(nomeMacro, anoMes, ss, mesCorrenteSheet, ui, isAskUserQuestions) {
  toastInfo(ss, `Iniciando execução da macro ${nomeMacro}`);

  // Abrindo a planilha atual
  if (! ss) {
    let errorMsg = 'Não foi possível abrir a planilha ativa! Abortando execução...';
    console.error(errorMsg);
    ui.alert(errorMsg);

    throw new Error(errorMsg);
  }
  
  // if (anoMes == 'mes') {
    // Abrindo a aba 'MES CORRENTE'
    if (! mesCorrenteSheet) {
      let errorMsg = `A aba '${ABA_MES_CORRENTE_NAME}' não existe! Abortando execução...`;
      throw new Error(errorMsg);
    }
    // Ativando a aba mes corrente na planilha atual
    activateSheet(mesCorrenteSheet, ss);
  // }

  if (isAskUserQuestions) {
    var msg = `Iniciando a macro ${nomeMacro}. Deseja realmente virar o ${anoMes}?`;
    console.info('POP-UP (YES/NO): %s', msg);
    var response = ui.alert(msg, ui.ButtonSet.YES_NO);
    if (response !== ui.Button.YES) {
      console.warn('O usuário selecionou não! Abortando...');
      return false;
    }
  }

  return true;
}

function inicializaMacro(nomeMacro, ss, ui, isAskUserQuestions) {
  toastInfo(ss, `Iniciando execução da macro ${nomeMacro}`);

  // Abrindo a planilha atual
  if (! ss) {
    let errorMsg = 'Não foi possível abrir a planilha ativa! Abortando execução...';
    console.error(errorMsg);
    ui.alert(errorMsg);

    throw new Error(errorMsg);
  }
  
  if (isAskUserQuestions) {
    var msg = `Iniciando a macro ${nomeMacro}. Deseja continuar?`;
    console.info('POP-UP (YES/NO): %s', msg);
    var response = ui.alert(msg, ui.ButtonSet.YES_NO);
    if (response !== ui.Button.YES) {
      console.warn('O usuário selecionou não! Abortando...');
      return false;
    }
  }

  return true;
}


/**
 * 
 */
function finalizaMacro(nomeMacro, ss) {
  toastInfo(ss, 'Finalizando execução da macro %s', nomeMacro);
}



/**
 * Função personalizada para replicar a substituição de strings do console.log usando ss.toast
 * @param {string} message - A mensagem com placeholders (%s) para substituição.
 * @param {...*} substitutions - Os valores a serem substituídos nos placeholders.
 */
function toastInfo(ss, message, ...substitutions) {
  // Substituir os placeholders na mensagem pelos valores fornecidos
  let formattedMessage = String(message).replace(/%s/g, function() {
    return substitutions.shift();
  });
  // let formattedMessage = String(message);
  // substitutions.forEach(substitution => {
    // formattedMessage = formattedMessage.replace('%s', substitution);
  // });

  // Mostrar a mensagem formatada
  console.info('TOAST: %s', formattedMessage);
  ss.toast(formattedMessage, 'INFORMAÇÃO', 3);
}



/** 
 * 
*/
function getFirstTuesday(date = new Date()) {
  // var date = new Date();
  date.setDate(1);
  var day = date.getDay(); // 0 - Sunday, 1 - Monday, 2 - Tuesday, etc...
  var tuesday = new Date(date.getTime() - 24*60*60*1000*(day-2));
  return tuesday;
}



/** 
 * 
*/
function getPreviousMonth(date = new Date()) {
  let currentMonth = date.getMonth();
  if (currentMonth > 0) {
    return new Date(date.getFullYear(),currentMonth-1,1);
  }
  else {
    return new Date(date.getFullYear()-1,11,1);
  }
}



/** 
 * 
*/
function getNextMonth(date = new Date()) {
  let currentMonth = date.getMonth();
  if (currentMonth > 10) {
    return new Date(date.getFullYear()+1,0,1);
  }
  else {
    return new Date(date.getFullYear(),currentMonth+1,1);
  }
}



/**
 * Formata o nome do mês fornecido no formato "yyyy-MM"
 * 
 * @param {Date} date Data desejada ou data de hoje se nulo.
 * @return {String} Nome do mês.
 */
function getMonthName(date = new Date()) {
  return Utilities.formatDate(date, "GMT -3", "yyyy-MM");
}



/** 
 * 
*/
function activateSheet(sheet, ss) {
  let activeSheet = ss.setActiveSheet(sheet, true);
  ss.setActiveSheet(sheet, true);
  ss.getRange('A1').activate();

  return activeSheet;
}



/**
 * Busca a ID de um Drive Compartilhado pelo nome.
 * 
 * @param {String} sharedFolderName Nome da pasta compartilhada.
 * @param {Object} drive Instância da classe global Drive.
 * @return {Integer} ID do drive pesquisado.
 */
function getDriveIDByName(sharedFolderName, drive) {
  // Cria um objeto options
  const options = {
    q: `name = '${sharedFolderName}'`,
    useDomainAdminAccess: true
  };

  // Lista os drives
  const search = drive.Drives.list(options);

  if (search.drives.length !== 1) {
    throw new Error('A pasta não foi encontrada!');
  }
  let id;
  // Percorre a lista de drives
  for (const drive of search.drives) {
    // Exibe o nome e o ID do drive
    console.info(`
      Nome: ${drive.name}
      ID: ${drive.id}`);
    id = drive.id;
  }

  return id;
}



/**
 * Retorna um Map com as planilhas de consumo localizadas na pasta SHARED_FOLDER_NAME
 */
function getPlanilhasConsumo(currentMonth, drive) {
  // Busca o ID do drive "Faturamento Villa" (SHARED_FOLDER_NAME) e verifica se tem arquivos na pasta
  const driveId = getDriveIDByName(SHARED_FOLDER_NAME, drive);
  var drive = DriveApp.getFolderById(driveId);
  var files = drive.searchFiles(`title contains '${PLANILHA_CONSUMO_NAME}'`);
  if (!files.hasNext()) {
    throw new Error('A pasta não foi encontrada!');
  }

  // Percorre a lista de arquivos no drive e salva em um map somente as planilhas de consumo do ano atual
  var map = new Map();
  while (files.hasNext()) {
    var file = files.next();
    if (file.getName().startsWith(PLANILHA_CONSUMO_NAME) && file.getName().endsWith(currentMonth.getFullYear())) {
      // Exibe o nome e o ID do drive
      console.info(`
        Nome: ${file.getName()}
        ID: ${file.getId()}`);
      
      map.set(file.getName(), file);
    }
  }

  return map;
}



/** 
 * Protege a aba sheet para não permitir mais alterações
*/
function protectSheet(sheet, sheetName = sheet.getName()) {
  // Protegendo a aba encontrada para não permitir mais alterações
  console.info('Protegendo a aba %s', sheetName);
  console.info('Editores originais: %s', 
    sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET) ? 'o intervalo não está protegido' : sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0].getEditors());
  var sheetNewProtection = sheet.protect();
  var newProtectionEditors = sheetNewProtection.getEditors();
  console.info('Editores ini(): %s', newProtectionEditors.toString());
  sheetNewProtection.removeEditors(newProtectionEditors);
  sheetNewProtection.addEditor(EMAIL_ADMIN);
  console.info('Editores fim: %s', sheetNewProtection.getEditors().toString());
}



/** 
 * Copia todos os intervalos protegidos entre abas
*/
function copyIntervalProtections(ss, sourceSheet, destinationSheet) {
  var sourceProtections = sourceSheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  console.info('Protegendo os intervalos da aba %s', destinationSheet.getName());
  for (let sourceProtection of sourceProtections) {
    var sourceRange = sourceProtection.getRange();
    toastInfo(ss, '%s: R%s:C%s a R%s:C%s', 
      sourceProtection.getDescription(),
      sourceRange.getRow(), 
      sourceRange.getColumn(), 
      sourceRange.getLastRow(), 
      sourceRange.getLastColumn());
    console.info('Editores da origem: %s', sourceProtection.getEditors().toString());
    
    var destinationRange = destinationSheet.getRange(
      sourceRange.getRow(), 
      sourceRange.getColumn(), 
      sourceRange.getLastRow() - sourceRange.getRow()+1, 
      sourceRange.getLastColumn() - sourceRange.getColumn()+1);

    // SpreadsheetApp.getActiveSheet().getActiveRange().protect().setWarningOnly(sourceProtection.isWarningOnly()).addEditors(SpreadsheetApp.getActiveSheet().getProtections()[0].getEditors()
    let editors = [];
    for (let editor of sourceProtection.getEditors()) {
      editors.push(editor.getEmail());
    }
    var destinationProtection = destinationRange.protect();
    if (sourceProtection.isWarningOnly()) {
      console.info('Intervalo apenas de alerta');
      destinationProtection.setWarningOnly(true);
    }
    else {
      console.info('Editores do destino ini: %s', destinationProtection.getEditors().toString());
      destinationProtection.setDescription(sourceProtection.getDescription()).removeEditors(destinationProtection.getEditors()).addEditors(editors);
      // destinationProtection.removeEditors(destinationProtection.getEditors());
      // for (let editor of sourceProtection.getEditors()) {
        // destinationProtection.addEditor(editor);
      // }
      console.info('Editores do destino fim: %s', destinationProtection.getEditors().toString());
    }
  }
}



/**
 * Função destinada a desbloquear uma aba bloqueada
 */
function unprotectSheet(sheet) {
  console.info('Desprotegendo a aba %s', sheet.getName());

  console.info('Editores ini: %s', sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0].getEditors());
  var protection = sheet.protect();
  protection.addEditor(Session.getEffectiveUser());
  console.info('Editores fim: %s', protection.getEditors());
}



/**
 * Função destinada a desbloquear os intervalos de uma aba bloqueada
 */
function unprotectIntervals(sheet) {
  var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  console.info('Desprotegendo os intervalos da aba %s', sheet.getName());

  for (let protection of protections) {
    var range = protection.getRange();
    toastInfo(ss, '%s: R%s:C%s a R%s:C%s', 
      sourceProtection.getDescription(),
      range.getRow(), 
      range.getColumn(), 
      range.getLastRow(), 
      range.getLastColumn());
    console.info('Editores ini: %s', protection.getEditors().toString());
    
    var newProtection = range.protect();
    console.info('Editores do destino ini: %s', newProtection.getEditors().toString());
    newProtection.addEditor(Session.getEffectiveUser());
    console.info('Editores fim: %s', newProtection.getEditors());
  }
}



/**
 * 
 */
function reordenarNomesSalario(sheet, modeloSheet) {
  // let sheet = ss.getActiveSheet();

  // Salvando os dados dos funcionários afastados nas células em A110:M119 no array funcionariosAfastados
  console.info('Salvando os dados dos funcionários afastados');
  var funcionariosAfastados = [];
  var values = sheet.getRange('A110:M119').getValues();
  for (let value of values) {
    // Se coluna C não é nulo E coluna A != D
    if (value[2] && value[2] !== '' && value[0] != 'D') {
      if (value[0] == 'A') {
        funcionariosAfastados.push(value);
      }
    }
  }

  // Salvando os dados dos funcionários ativos nas células em A3:M103 no array funcionariosAtivos
  console.info('Salvando os dados dos funcionários ativos');
  var funcionariosAtivos = [];
  var values = sheet.getRange('A3:M103').getValues();
  for (let value of values) {
    // Se coluna C não é nulo E coluna A != D
    if (value[2] && value[2] !== '' && value[0] != 'D') {
      if (value[0] != 'A') {
        funcionariosAtivos.push(value);
      }
      else {
        funcionariosAfastados.push(value);
      }
    }
  }
  // Salvando os dados dos funcionários ativos nas células em O3:O103 no array funcionariosAtivos
  var values2 = sheet.getRange('O3:O103').getValues();
  var funcionariosAtivos2 = [];
  var i = 0;
  for (let value of values) {
    // Se coluna C não é nulo E coluna A != D
    if (value[2] && value[2] !== '' && value[0] != 'D') {
      if (value[0] != 'A') {
        funcionariosAtivos2.push(values2[i]);
      }
      // else {
      //   funcionariosAfastados.push(values2[i]);
      // }
      i++;
    }
  }

  // Resetando o conteudo da aba "MES CORRENTE" com os dados da aba MODELO
  // console.info('Resetando o conteudo da aba "MES CORRENTE" com os dados da aba MODELO');
  // ModeloSheet.getRange(1, 1, ModeloSheet.getMaxRows(), ModeloSheet.getMaxColumns()).copyTo(MesCorrenteSheet.getRange('A1'), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  limparDados(modeloSheet, sheet);

  // Setando os valores somente dos funcionários ativos nas células A3:M103 da aba 
  console.info('Copiando os dados dos funcionários ativos para a aba %s', sheet.getName());
  sheet.getRange(
      3, 1, //A3
      funcionariosAtivos.length, funcionariosAtivos[0].length
    ).setValues(funcionariosAtivos);  
  // Setando os dados somente dos funcionários ativos nas células O3:O103 da aba
  sheet.getRange(
      3, 15, //O3
      funcionariosAtivos2.length, funcionariosAtivos2[0].length
    ).setValues(funcionariosAtivos2);

  // Setando os dados somente dos funcionários ativos nas células A110:M109 da aba
  console.info('Copiando os dados dos funcionários afastados para a aba %s', sheet.getName());
  sheet.getRange(
      110, 1, //A110
      funcionariosAfastados.length, funcionariosAfastados[0].length
    ).setValues(funcionariosAfastados);

  // Ordenando os nomes dos funcionários na aba
  console.info('Ordenando os nomes dos funcionários na aba %s', sheet.getName());
  sheet.getRange('3:103').sort(
    [{column: 4, ascending: true}, 
    {column: 3, ascending: true}]);

  // Ordenando os nomes dos funcionários na aba
  console.info('Ordenando os nomes dos funcionários na aba %s', sheet.getName());
  sheet.getRange('3:103').sort(
    [{column: 4, ascending: true}, 
    {column: 3, ascending: true}]);
}



/**
 * 
 */
function limparCores(range) {
  // SpreadsheetApp.getSelection().getActiveRange().setBackground(null);
  range.setBackground(null);
}



/**
 * 
 */
function limparDados(modeloSheet, mesCorrenteSheet) {
  console.info('Resetando o conteudo da aba "%s" com os dados da aba "%s"', modeloSheet.getName(), mesCorrenteSheet.getName());
  modeloSheet.getRange(1, 1, modeloSheet.getMaxRows(), modeloSheet.getMaxColumns()).copyTo(mesCorrenteSheet.getRange('A1'), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
}



