/**********************************
 * 
 * FUNÇÔES DE VIRADA DE CONSUMO
 * 
***********************************/

/** 
 * 
*/
function virarMesConsumo_(currentMonth, lastMonth, ssConsumo = ss, mesCorrenteSheet = MesCorrenteSheet, modeloSheet = ModeloSheet) {
  const lastMonthName = getMonthName_(lastMonth);

  toastInfo_('Renomeando e adicionando abas');
  // console.info('Duplicando aba "MES CORRENTE"');
  // const lastMonthSheet = ssConsumo.duplicateActiveSheet();
  // console.info('Definindo nome da aba para %s', lastMonthName);
  // lastMonthSheet.setName(lastMonthName);
  
  // Alterando o nome da aba "MES CORRENTE" para o nome do mês anterior
  const lastMonthSheet = mesCorrenteSheet;
  console.info('Alterando o nome da aba "MES CORRENTE" para %s', lastMonthName);
  lastMonthSheet.setName(lastMonthName);

  // Duplicando aba "MODELO"
  console.info('Duplicando aba "MODELO"');
  activateSheet_(modeloSheet, ssConsumo);
  mesCorrenteSheet = ssConsumo.duplicateActiveSheet();
  console.info('Definindo nome da aba para %s', ABA_MES_CORRENTE_NAME);
  mesCorrenteSheet.setName(ABA_MES_CORRENTE_NAME);
  activateSheet_(mesCorrenteSheet, ssConsumo);
  ssConsumo.moveActiveSheet(0);

  // Protegendo a aba do mês anterior
  // protectSheet_(lastMonthSheet, lastMonthName);

  /**
   * 
   * ÁREA EXCLUSIVA DA PLANILHA DE CONSUMO
   * 
   */
  toastInfo_('Aplicando as alterações nas abas da planilha de consumo');

  console.info('Copiando os nomes dos funcionários para tirar a referencia');
  var lastMonthRange = lastMonthSheet.getRange('A4:B104');
  lastMonthRange.copyTo(lastMonthSheet.getRange('A4'), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);

  console.info('Colapsando os grupos de colunas da aba %s', lastMonthName);
  lastMonthSheet.collapseAllColumnGroups();

  // console.info('Resetando o conteudo da aba "MES CORRENTE" com os dados da aba MODELO');
  // modeloSheet.getRange(1, 1, modeloSheet.getMaxRows(), modeloSheet.getMaxColumns()).copyTo(mesCorrenteSheet.getRange('A1'), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);

  console.info('Definindo o valor da primeira célula para o domingo anterior ao dia 1.o do mês atual'); 
  console.info(Utilities.formatDate(getFirstTuesday_(currentMonth), "GMT -3", "yyyy-MM-dd"));
  var activeSheet = activateSheet_(mesCorrenteSheet, ssConsumo);
  activeSheet.getCurrentCell().setValue(getFirstTuesday_(currentMonth)).setNumberFormat('dd-mmm ddd');

  console.info('Colapsando os grupos de colunas da aba %s', ABA_MES_CORRENTE_NAME);
  mesCorrenteSheet.collapseAllColumnGroups();
  mesCorrenteSheet.getColumnGroup(2, 1).expand();

  // Protegendo os intervalos da aba mesCorrenteSheet
  if (IS_RUN_SLOW_ROUTINES) {
    toastInfo_('Protegendo os intervalos e a edição da nova aba %s', ABA_MES_CORRENTE_NAME);
    copyIntervalProtections_(modeloSheet, mesCorrenteSheet);
  }

  // Protegendo a aba do mês corrente
  // protectSheet_(mesCorrenteSheet, ABA_MES_CORRENTE_NAME);
}



/**
 * 
 */
function virarAnoConsumo_(currentMonth, lastMonth, ssConsumo = ss, mesCorrenteSheet = MesCorrenteSheet, modeloSheet = ModeloSheet) {
  const lastMonthName = getMonthName_(lastMonth);
  const currentYear = currentMonth.getFullYear();
  const anoPassadoName = ssConsumo.getName();
  const anoCorrenteName = anoPassadoName.replace(currentYear-1, currentYear);
  
  console.info('Definindo nome da aba do mês anterior = %s', lastMonthName);
  var lastMonthSheet = mesCorrenteSheet.setName(lastMonthName);
  
  protectSheet_(lastMonthSheet, lastMonthName);
  // console.info('Protegendo a aba %s', lastMonthSheet.getName());
  // var modeloProtection = lastMonthSheet.protect();
  // var editors = modeloProtection.getEditors();
  // console.info('Editores antes: %s', editors.toString());
  // modeloProtection.removeEditors(editors);
  // modeloProtection.addEditor('leo@villadaspedras.com');
  // console.info('Editores depois: %s', modeloProtection.getEditors().toString());

  console.info('Criando nova planilha %s', anoCorrenteName);
  const columnCount = modeloSheet.getLastColumn();
  const rowCount = modeloSheet.getLastRow();
  const ssNew = SpreadsheetApp.create(anoCorrenteName, columnCount, rowCount);

  console.info('Mudando a localização da planilha para: %s', ssConsumo.getSpreadsheetLocale());
  ssNew.setSpreadsheetLocale(ssConsumo.getSpreadsheetLocale());

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

  console.info('Editores da planilha nova: %s', ssNew.getEditors().toString());
  let spreadsheetEditors = ssConsumo.getEditors();
  console.info('Adicionando todos os editores da planilha anterior: %s', spreadsheetEditors.toString());
  editors = ssNew.getEditors();
  console.info('Editores antes: %s', editors.toString());
  for (let editor of editors) {
    ssNew.addEditor(editor);
  }
  console.info('Editores depois: %s', ssNew.getEditors().toString());

  console.info('Copiando a aba %s para a planilha criada', ABA_MODELO_NAME);
  let newMesCorrenteSheet = modeloSheet.copyTo(ssNew);
  console.info('Alterando o nome da aba copiada para %s', ABA_MES_CORRENTE_NAME);
  newMesCorrenteSheet.setName(ABA_MES_CORRENTE_NAME);
  // ssNewActive = SpreadsheetApp.openByUrl(ssNew.getUrl());
  SpreadsheetApp.setActiveSpreadsheet(ssNew);
  newMesCorrenteSheet = activateSheet_(newMesCorrenteSheet, ssNew);
  
  if (IS_RUN_SLOW_ROUTINES) {
    copyIntervalProtections_(modeloSheet, lastMonthSheet);
  }

  console.info('Duplicando aba "MES CORRENTE"');
  const newModeloSheet = ssNew.duplicateActiveSheet();
  console.info('Definindo nome da aba para %s', ABA_MODELO_NAME);
  newModeloSheet.setName(ABA_MODELO_NAME);

  if (IS_RUN_SLOW_ROUTINES) {
    copyIntervalProtections_(modeloSheet, newModeloSheet);
  }
  
  protectSheet_(newModeloSheet, ABA_MODELO_NAME);
  // console.info('Protegendo a aba %s', newModeloSheet.getName());
  // var newModeloProtection = newModeloSheet.protect();
  // editors = newModeloProtection.getEditors();
  // console.info('Editores antes: %s', editors.toString());
  // newModeloProtection.removeEditors(editors);
  // newModeloProtection.addEditor('leo@villadaspedras.com');
  // console.info('Editores depois: %s', newModeloProtection.getEditors().toString());

  console.info('Apagando a aba original da planilha %s', 'Página1');
  ssNew.deleteSheet(ssNew.getSheetByName('Página1'));

  /**
   * 
   * ÁREA EXCLUSIVA DA PLANILHA DE CONSUMO
   * 
   */

  
  console.info('Aplicando as alterações específicas à planilha de consumo');

  console.info('Copiando os nomes dos funcionários para tirar a referencia');
  var lastMonthRange = lastMonthSheet.getRange('A4:B104');
  lastMonthRange.copyTo(lastMonthSheet.getRange('A4'), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);

  console.info('Colapsando os grupos de colunas da aba %s', lastMonthName);
  lastMonthSheet.collapseAllColumnGroups();

  console.info('Definindo o valor da primeira célula para o domingo anterior ao dia 1.o do mês atual'); 
  console.info(Utilities.formatDate(getFirstTuesday_(currentMonth), "GMT -3", "yyyy-MM-dd"));
  var activeSheet = activateSheet_(mesCorrenteSheet, ssConsumo);
  activeSheet.getCurrentCell().setValue(getFirstTuesday_(currentMonth)).setNumberFormat('dd-mmm ddd');


  console.info('Colapsando os grupos de colunas da aba %s', ABA_MES_CORRENTE_NAME);
  mesCorrenteSheet.collapseAllColumnGroups();
  mesCorrenteSheet.getColumnGroup(2, 1).expand();
}
