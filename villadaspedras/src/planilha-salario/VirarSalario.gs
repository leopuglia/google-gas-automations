/**********************************
 * 
 * FUNÇÔES DE VIRADA DE SALARIO
 * 
***********************************/

/** 
 * 
*/
function virarMesSalario_(currentMonth, lastMonth) {
  // Definindo variáveis
  const lastMonthName = getMonthName_(lastMonth);

  toastInfo_('Renomeando e adicionando abas');

  // Duplicando aba "MES CORRENTE"
  console.info('Duplicando aba "MES CORRENTE"');
  const lastMonthSheet = ss.duplicateActiveSheet();
  console.info('Definindo nome da aba para %s', lastMonthName);
  lastMonthSheet.setName(lastMonthName);

  // Alterando o nome da aba "MES CORRENTE" para o nome do mês anterior
  // const lastMonthSheet = MesCorrenteSheet;
  // console.info('Alterando o nome da aba "MES CORRENTE" para %s', lastMonthName);
  // lastMonthSheet.setName(lastMonthName);

  // Duplicando aba "MODELO"
  // console.info('Duplicando aba "MODELO"');
  // activateSheet_(ModeloSheet);
  // MesCorrenteSheet = ss.duplicateActiveSheet();
  // console.info('Definindo nome da aba para %s', ABA_MES_CORRENTE_NAME);
  // MesCorrenteSheet.setName(ABA_MES_CORRENTE_NAME);
  // activateSheet_(MesCorrenteSheet);
  // ss.moveActiveSheet(0);

  /**
   * 
   * ÁREA EXCLUSIVA DA PLANILHA DE SALÁRIO
   * 
   */
  toastInfo_('Aplicando as alterações nas abas da planilha de salários');

  // Copiando os valores do consumo nos PDVs para tirar a referencia
  console.info('Copiando os valores do consumo nos PDVs para tirar a referencia');
  var lastMonthRange = lastMonthSheet.getRange('U3:X103');
  lastMonthRange.copyTo(lastMonthSheet.getRange('U3'), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);

  // Resetando o conteudo da aba "MES CORRENTE" com os dados da aba MODELO
  console.info('Copiando o conteudo da aba do mês anterior para a aba "MES CORRENTE"');
  var lastMonthRange = lastMonthSheet.getRange('A3:M103');
  lastMonthSheet.getRange('A3:M103').copyTo(MesCorrenteSheet.getRange('A3'), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);

  // Expandindo os grupos de colunas da aba
  console.info('Expandindo os grupos de colunas da aba %s', lastMonthName);
  lastMonthSheet.expandAllColumnGroups();

  // Expandindo os grupos de colunas da aba
  console.info('Expandindo os grupos de colunas da aba %s', ABA_MES_CORRENTE_NAME);
  MesCorrenteSheet.expandAllColumnGroups();

  if (IS_RUN_SLOW_ROUTINES) {
    toastInfo_('Protegendo os intervalos da nova aba %s', lastMonthSheet.getName());
    // toastInfo_('Protegendo os intervalos da nova aba %s', ABA_MES_CORRENTE_NAME);

    // Protegendo os intervalos da aba lastMonthSheet
    copyIntervalProtections_(ModeloSheet, lastMonthSheet);
    // Protegendo os intervalos da aba MesCorrenteSheet
    // copyIntervalProtections_(ModeloSheet, MesCorrenteSheet);
  }
}



/** 
 * 
*/
function virarAnoSalario_(currentMonth, lastMonth) {
  const lastMonthName = getMonthName_(lastMonth);
  const currentYear = currentMonth.getFullYear();
  const anoPassadoName = ss.getName();
  const anoCorrenteName = anoPassadoName.replace(currentYear-1, currentYear);
  
  toastInfo_('Renomeando e protegendo as abas da planilha do ano anterior %s', anoPassadoName);

  // Protegendo a aba do mês 11, se existir
  previousMonth = getPreviousMonth_(lastMonth);
  previousMonthName = getMonthName_(previousMonth);
  previousMonthSheet = ss.getSheetByName(previousMonthName);
  // Abrindo a aba 'MES CORRENTE'
  if (! previousMonthSheet) {
    let errorMsg = `A aba '${previousMonthName}' não existe! É necessário virar o mês antes! Abortando execução...`;
    throw new Error(errorMsg);
  }
  protectSheet_(previousMonthSheet, previousMonthName);

  console.info('Definindo nome da aba do mês anterior = %s', lastMonthName);
  var lastMonthSheet = MesCorrenteSheet.setName(lastMonthName);
  
  protectSheet_(lastMonthSheet, lastMonthName);
  // console.info('Protegendo a aba %s', lastMonthSheet.getName());
  // var modeloProtection = lastMonthSheet.protect();
  // var editors = modeloProtection.getEditors();
  // console.info('Editores antes: %s', editors.toString());
  // modeloProtection.removeEditors(editors);
  // modeloProtection.addEditor('leo@villadaspedras.com');
  // console.info('Editores depois: %s', modeloProtection.getEditors().toString());


  toastInfo_('Criando nova planilha %s, movendo pro drive compartilhado %s e criando as abas %s e %s', anoCorrenteName, SHARED_FOLDER_NAME, ABA_MODELO_NAME, ABA_MES_CORRENTE_NAME);
  const columnCount = ModeloSheet.getLastColumn();
  const rowCount = ModeloSheet.getLastRow();
  const ssNew = SpreadsheetApp.create(anoCorrenteName, columnCount, rowCount);

  console.info('Mudando a localização da planilha para: %s', ss.getSpreadsheetLocale());
  ssNew.setSpreadsheetLocale(ss.getSpreadsheetLocale());

  console.info('Movendo a planilha criada para o drive compartilhado %s', SHARED_FOLDER_NAME);
  const fileId = ssNew.getId();
  const driveId = getDriveIDByName_(SHARED_FOLDER_NAME, Drive);
  const parentsId = DriveApp.getFileById(ssNew.getId()).getParents().next().getId();
  const data = Drive.Files.update({}, fileId, null, {
    addParents: driveId,
    removeParents: parentsId,
    supportsAllDrives: true,
    fields: 'driveId,name,id',
  });

  console.info('Dados do update:');
  console.info(data);



  /*****REVISAR ESSA PARTE *******/
  // let spreadsheetEditors = ss.getEditors();
  // console.info('Adicionando todos os editores da planilha anterior: %s', spreadsheetEditors.toString());
  // editors = ssNew.getEditors();
  // console.info('Editores antes: %s', editors.toString());
  // for (let editor of editors) {
  //   ssNew.addEditor(editor);
  // }
  // console.info('Editores depois: %s', ssNew.getEditors().toString());




  console.info('Copiando a aba %s para a planilha criada', ABA_MODELO_NAME);
  let newMesCorrenteSheet = ModeloSheet.copyTo(ssNew);
  console.info('Alterando o nome da aba copiada para %s', ABA_MES_CORRENTE_NAME);
  newMesCorrenteSheet.setName(ABA_MES_CORRENTE_NAME);
  // ssNewActive = SpreadsheetApp.openByUrl(ssNew.getUrl());
  SpreadsheetApp.setActiveSpreadsheet(ssNew);
  newMesCorrenteSheet = activateSheet_(newMesCorrenteSheet, ssNew);
  
  if (IS_RUN_SLOW_ROUTINES) {
    toastInfo_('Copiando os intervalos protegidos da aba %s da planilha original para a aba %s da nova planilha', ABA_MODELO_NAME, ABA_MES_CORRENTE_NAME)
    copyIntervalProtections_(ModeloSheet, newMesCorrenteSheet);
  }

  console.info('Duplicando aba "MES CORRENTE"');
  const newModeloSheet = ssNew.duplicateActiveSheet();
  console.info('Definindo nome da aba para %s', ABA_MODELO_NAME);
  newModeloSheet.setName(ABA_MODELO_NAME);

  if (IS_RUN_SLOW_ROUTINES) {
    toastInfo_('Copiando os intervalos protegidos da aba %s da planilha original para a aba %s da nova planilha', ABA_MODELO_NAME, ABA_MES_CORRENTE_NAME)
    copyIntervalProtections_(ModeloSheet, newModeloSheet);
  }
  
  protectSheet_(newModeloSheet, newModeloSheet.getName());

  console.info('Apagando a aba original da planilha %s', 'Página1');
  ssNew.deleteSheet(ssNew.getSheetByName('Página1'));

  /**
   * 
   * ÁREA EXCLUSIVA DA PLANILHA DE SALÁRIOS
   * 
   */
  toastInfo_('Aplicando as alterações específicas à planilha de salários');

  console.info('Copiando os valores do consumo nos PDVs para tirar a referencia');
  var lastMonthRange = lastMonthSheet.getRange('U3:X103');
  lastMonthRange.copyTo(lastMonthSheet.getRange('U3'), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);

  console.info('Copiando os dados dos funcionários para a aba %s', ABA_MES_CORRENTE_NAME);
  var lastMonthValues = lastMonthSheet.getRange('A3:M103').getValues();
  var lastMonthFuncionariosAtivos = [];
  for (let lastMonthValue of lastMonthValues) {
    if (lastMonthValue[0] != 'D') {
      lastMonthFuncionariosAtivos.push(lastMonthValue);
    }
  }
  newMesCorrenteSheet.getRange(
      3, 1, //A3
      lastMonthFuncionariosAtivos.length, lastMonthFuncionariosAtivos[0].length
    ).setValues(lastMonthFuncionariosAtivos);
  var lastMonthValues = lastMonthSheet.getRange('O3:O103').getValues();
  var lastMonthFuncionariosAtivos = [];
  for (let lastMonthValue of lastMonthValues) {
    if (lastMonthValue[0] != 'D') {
      lastMonthFuncionariosAtivos.push(lastMonthValue);
    }
  }
  newMesCorrenteSheet.getRange(
      3, 15, //O3
      lastMonthFuncionariosAtivos.length, lastMonthFuncionariosAtivos[0].length
    ).setValues(lastMonthFuncionariosAtivos);

  // console.info('Ordenando os nomes dos funcionários na aba %s', ABA_MES_CORRENTE_NAME);
  // reordenarNomes_(newMesCorrenteSheet.getRange('3:103'));

  console.info('Expandindo os grupos de colunas da aba %s', lastMonthName);
  lastMonthSheet.expandAllColumnGroups();

  console.info('Expandindo os grupos de colunas da aba %s', ABA_MES_CORRENTE_NAME);
  newMesCorrenteSheet.expandAllColumnGroups();
}
