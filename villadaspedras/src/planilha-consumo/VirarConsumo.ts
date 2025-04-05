/**********************************
 *
 * FUNÇÔES DE VIRADA DE CONSUMO
 *
 ***********************************/

import * as VilladasPedrasLib from '../commons/VilladasPedrasLib';

// Definindo variáveis para acesso via funções internas
const ABA_MES_CORRENTE_NAME = VilladasPedrasLib.ABA_MES_CORRENTE_NAME;
const ABA_MODELO_NAME = VilladasPedrasLib.ABA_MODELO_NAME;
const SHARED_FOLDER_NAME = VilladasPedrasLib.SHARED_FOLDER_NAME;
const EMAIL_ADMIN = VilladasPedrasLib.EMAIL_ADMIN;

// Variável declarada no arquivo Main.ts
declare const IS_RUN_SLOW_ROUTINES: boolean;

/**
 * Executa a rotina de virada de mês para a planilha de consumo
 * @param currentMonth Mês atual
 * @param lastMonth Mês anterior
 * @param ssConsumo Planilha ativa
 * @param mesCorrenteSheet Aba do mês corrente
 * @param modeloSheet Aba modelo
 */
function virarMesConsumo_(
  currentMonth: Date,
  lastMonth: Date,
  ssConsumo: GoogleAppsScript.Spreadsheet.Spreadsheet = (globalThis as any).ss,
  mesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet = (globalThis as any).MesCorrenteSheet,
  modeloSheet: GoogleAppsScript.Spreadsheet.Sheet = (globalThis as any).ModeloSheet
): void {
  const lastMonthName = getMonthName_(lastMonth);

  toastInfo_('Renomeando e adicionando abas');

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

  /**
   *
   * ÁREA EXCLUSIVA DA PLANILHA DE CONSUMO
   *
   */
  toastInfo_('Aplicando as alterações nas abas da planilha de consumo');

  console.info('Copiando os nomes dos funcionários para tirar a referencia');
  const lastMonthRange = lastMonthSheet.getRange('A4:B104');
  lastMonthRange.copyTo(
    lastMonthSheet.getRange('A4'),
    SpreadsheetApp.CopyPasteType.PASTE_VALUES,
    false
  );

  console.info('Colapsando os grupos de colunas da aba %s', lastMonthName);
  lastMonthSheet.collapseAllColumnGroups();

  console.info(
    'Definindo o valor da primeira célula para o domingo anterior ao dia 1.o do mês atual'
  );
  console.info(Utilities.formatDate(getFirstTuesday_(currentMonth), 'GMT -3', 'yyyy-MM-dd'));
  const activeSheet = activateSheet_(mesCorrenteSheet, ssConsumo);
  activeSheet
    .getCurrentCell()
    .setValue(getFirstTuesday_(currentMonth))
    .setNumberFormat('dd-mmm ddd');

  console.info('Colapsando os grupos de colunas da aba %s', ABA_MES_CORRENTE_NAME);
  mesCorrenteSheet.collapseAllColumnGroups();
  mesCorrenteSheet.getColumnGroup(2, 1).expand();

  // Protegendo os intervalos da aba mesCorrenteSheet
  if (IS_RUN_SLOW_ROUTINES) {
    toastInfo_('Protegendo os intervalos e a edição da nova aba %s', ABA_MES_CORRENTE_NAME);
    copyIntervalProtections_(modeloSheet, mesCorrenteSheet);
  }
}

/**
 * Executa a rotina de virada de ano para a planilha de consumo
 * @param currentMonth Mês atual
 * @param lastMonth Mês anterior
 * @param ssConsumo Planilha ativa
 * @param mesCorrenteSheet Aba do mês corrente
 * @param modeloSheet Aba modelo
 */
function virarAnoConsumo_(
  currentMonth: Date,
  lastMonth: Date,
  ssConsumo: GoogleAppsScript.Spreadsheet.Spreadsheet = (globalThis as any).ss,
  mesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet = (globalThis as any).MesCorrenteSheet,
  modeloSheet: GoogleAppsScript.Spreadsheet.Sheet = (globalThis as any).ModeloSheet
): void {
  const lastMonthName = getMonthName_(lastMonth);
  const currentYear = currentMonth.getFullYear();
  const anoPassadoName = ssConsumo.getName();
  const anoCorrenteName = anoPassadoName.replace(
    (currentYear - 1).toString(),
    currentYear.toString()
  );

  console.info('Definindo nome da aba do mês anterior = %s', lastMonthName);
  const lastMonthSheet = mesCorrenteSheet;
  lastMonthSheet.setName(lastMonthName);

  protectSheet_(lastMonthSheet, lastMonthName);

  console.info('Criando nova planilha %s', anoCorrenteName);
  const columnCount = modeloSheet.getLastColumn();
  const rowCount = modeloSheet.getLastRow();
  const ssNew = SpreadsheetApp.create(anoCorrenteName, rowCount, columnCount);

  console.info('Mudando a localização da planilha para: %s', ssConsumo.getSpreadsheetLocale());
  ssNew.setSpreadsheetLocale(ssConsumo.getSpreadsheetLocale());

  console.info('Movendo a planilha criada para o drive compartilhado %s', SHARED_FOLDER_NAME);
  const fileId = ssNew.getId();
  const driveId = getDriveIDByName_(SHARED_FOLDER_NAME);
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
  const spreadsheetEditors = ssConsumo.getEditors();
  console.info(
    'Adicionando todos os editores da planilha anterior: %s',
    spreadsheetEditors.toString()
  );
  const editors = ssNew.getEditors();
  console.info('Editores antes: %s', editors.toString());
  for (const editor of spreadsheetEditors) {
    ssNew.addEditor(editor);
  }
  console.info('Editores depois: %s', ssNew.getEditors().toString());

  console.info('Copiando a aba %s para a planilha criada', ABA_MODELO_NAME);
  let newMesCorrenteSheet = modeloSheet.copyTo(ssNew);
  console.info('Alterando o nome da aba copiada para %s', ABA_MES_CORRENTE_NAME);
  newMesCorrenteSheet.setName(ABA_MES_CORRENTE_NAME);
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

  console.info('Apagando a aba original da planilha %s', 'Página1');
  const originalSheet = ssNew.getSheetByName('Página1');
  if (originalSheet) {
    ssNew.deleteSheet(originalSheet);
  }

  /**
   *
   * ÁREA EXCLUSIVA DA PLANILHA DE CONSUMO
   *
   */
  console.info('Aplicando as alterações específicas à planilha de consumo');

  console.info('Copiando os nomes dos funcionários para tirar a referencia');
  const lastMonthRange = lastMonthSheet.getRange('A4:B104');
  lastMonthRange.copyTo(
    lastMonthSheet.getRange('A4'),
    SpreadsheetApp.CopyPasteType.PASTE_VALUES,
    false
  );

  console.info('Colapsando os grupos de colunas da aba %s', lastMonthName);
  lastMonthSheet.collapseAllColumnGroups();

  console.info(
    'Definindo o valor da primeira célula para o domingo anterior ao dia 1.o do mês atual'
  );
  console.info(Utilities.formatDate(getFirstTuesday_(currentMonth), 'GMT -3', 'yyyy-MM-dd'));
  const activeSheet = activateSheet_(mesCorrenteSheet, ssConsumo);
  activeSheet
    .getCurrentCell()
    .setValue(getFirstTuesday_(currentMonth))
    .setNumberFormat('dd-mmm ddd');

  console.info('Colapsando os grupos de colunas da aba %s', ABA_MES_CORRENTE_NAME);
  mesCorrenteSheet.collapseAllColumnGroups();
  mesCorrenteSheet.getColumnGroup(2, 1).expand();
}

/**
 * Obtém a data da primeira terça-feira do mês
 * @param date Data de referência (padrão: data atual)
 * @returns Data da primeira terça-feira do mês
 */
function getFirstTuesday_(date: Date = new Date()): Date {
  return VilladasPedrasLib.getFirstTuesday(date);
}

/**
 * Formata o nome do mês fornecido no formato "yyyy-MM"
 * @param date Data desejada ou data de hoje se nulo
 * @returns Nome do mês formatado
 */
function getMonthName_(date: Date = new Date()): string {
  return VilladasPedrasLib.getMonthName(date);
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
 * Busca a ID de um Drive Compartilhado pelo nome
 * @param sharedFolderName Nome da pasta compartilhada
 * @param drive Instância da classe global Drive
 * @returns ID do drive pesquisado
 */
function getDriveIDByName_(
  sharedFolderName: string,
  drive: GoogleAppsScript.Drive.DriveApp = DriveApp
): string | null {
  return VilladasPedrasLib.getDriveIDByName(sharedFolderName, drive);
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
 * Função personalizada para replicar a substituição de strings do console.log usando ss.toast
 * @param message A mensagem com placeholders (%s) para substituição
 * @param substitutions Os valores a serem substituídos nos placeholders
 */
function toastInfo_(message: string, ...substitutions: unknown[]): void {
  VilladasPedrasLib.toastInfo((globalThis as any).ss, message, ...substitutions);
}

// Expondo as funções para uso pelo GAS
// @ts-ignore
// global.virarMesConsumo_ = virarMesConsumo_;
// @ts-ignore
// global.virarAnoConsumo_ = virarAnoConsumo_;
