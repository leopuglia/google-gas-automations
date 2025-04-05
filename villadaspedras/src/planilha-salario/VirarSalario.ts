/**********************************
 *
 * FUNÇÔES DE VIRADA DE SALARIO
 *
 ***********************************/

import * as VilladasPedrasLib from '../commons/VilladasPedrasLib';

// Definindo variáveis para acesso via funções internas
const ABA_MES_CORRENTE_NAME = VilladasPedrasLib.ABA_MES_CORRENTE_NAME;
const ABA_MODELO_NAME = VilladasPedrasLib.ABA_MODELO_NAME;
const SHARED_FOLDER_NAME = VilladasPedrasLib.SHARED_FOLDER_NAME;
const EMAIL_ADMIN = VilladasPedrasLib.EMAIL_ADMIN;

// Variáveis declaradas no arquivo Main.ts
declare const IS_RUN_SLOW_ROUTINES: boolean;

/**
 * Executa a rotina de virada de mês para a planilha de salário
 * @param currentMonth Mês atual
 * @param lastMonth Mês anterior
 */
function virarMesSalario_(currentMonth: Date, lastMonth: Date): void {
  // Definindo variáveis
  const lastMonthName = getMonthName_(lastMonth);

  toastInfo_('Renomeando e adicionando abas');

  // Duplicando aba "MES CORRENTE"
  console.info('Duplicando aba "MES CORRENTE"');
  const lastMonthSheet = (globalThis as any).ss.duplicateActiveSheet();
  console.info('Definindo nome da aba para %s', lastMonthName);
  lastMonthSheet.setName(lastMonthName);

  /**
   *
   * ÁREA EXCLUSIVA DA PLANILHA DE SALÁRIO
   *
   */
  toastInfo_('Aplicando as alterações nas abas da planilha de salários');

  // Copiando os valores do consumo nos PDVs para tirar a referencia
  console.info('Copiando os valores do consumo nos PDVs para tirar a referencia');
  const lastMonthRange = lastMonthSheet.getRange('U3:X103');
  lastMonthRange.copyTo(
    lastMonthSheet.getRange('U3'),
    SpreadsheetApp.CopyPasteType.PASTE_VALUES,
    false
  );

  // Resetando o conteudo da aba "MES CORRENTE" com os dados da aba MODELO
  console.info('Copiando o conteudo da aba do mês anterior para a aba "MES CORRENTE"');
  const contentRange = lastMonthSheet.getRange('A3:M103');
  contentRange.copyTo(
    (globalThis as any).MesCorrenteSheet.getRange('A3'),
    SpreadsheetApp.CopyPasteType.PASTE_FORMULA,
    false
  );

  // Expandindo os grupos de colunas da aba
  console.info('Expandindo os grupos de colunas da aba %s', lastMonthName);
  lastMonthSheet.expandAllColumnGroups();

  // Expandindo os grupos de colunas da aba
  console.info('Expandindo os grupos de colunas da aba %s', ABA_MES_CORRENTE_NAME);
  (globalThis as any).MesCorrenteSheet.expandAllColumnGroups();

  if (IS_RUN_SLOW_ROUTINES) {
    toastInfo_('Protegendo os intervalos da nova aba %s', lastMonthSheet.getName());
    // Protegendo os intervalos da aba lastMonthSheet
    copyIntervalProtections_((globalThis as any).ModeloSheet, lastMonthSheet);
  }
}

/**
 * Executa a rotina de virada de ano para a planilha de salário
 * @param currentMonth Mês atual
 * @param lastMonth Mês anterior
 */
function virarAnoSalario_(currentMonth: Date, lastMonth: Date): void {
  const lastMonthName = getMonthName_(lastMonth);
  const currentYear = currentMonth.getFullYear();
  const anoPassadoName = (globalThis as any).ss.getName();
  const anoCorrenteName = anoPassadoName.replace(
    (currentYear - 1).toString(),
    currentYear.toString()
  );

  toastInfo_('Renomeando e protegendo as abas da planilha do ano anterior %s', anoPassadoName);

  // Protegendo a aba do mês 11, se existir
  const previousMonth = getPreviousMonth_(lastMonth);
  const previousMonthName = getMonthName_(previousMonth);
  const previousMonthSheet = (globalThis as any).ss.getSheetByName(previousMonthName);

  // Abrindo a aba 'MES CORRENTE'
  if (!previousMonthSheet) {
    const errorMsg = `A aba '${previousMonthName}' não existe! É necessário virar o mês antes! Abortando execução...`;
    throw new Error(errorMsg);
  }
  protectSheet_(previousMonthSheet, previousMonthName);

  console.info('Definindo nome da aba do mês anterior = %s', lastMonthName);
  const lastMonthSheet = (globalThis as any).MesCorrenteSheet;
  lastMonthSheet.setName(lastMonthName);

  protectSheet_(lastMonthSheet, lastMonthName);

  toastInfo_(
    'Criando nova planilha %s, movendo pro drive compartilhado %s e criando as abas %s e %s',
    anoCorrenteName,
    SHARED_FOLDER_NAME,
    ABA_MODELO_NAME,
    ABA_MES_CORRENTE_NAME
  );
  const columnCount = (globalThis as any).ModeloSheet.getLastColumn();
  const rowCount = (globalThis as any).ModeloSheet.getLastRow();
  const ssNew = SpreadsheetApp.create(anoCorrenteName, rowCount, columnCount);

  console.info(
    'Mudando a localização da planilha para: %s',
    (globalThis as any).ss.getSpreadsheetLocale()
  );
  ssNew.setSpreadsheetLocale((globalThis as any).ss.getSpreadsheetLocale());

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

  console.info('Copiando a aba %s para a planilha criada', ABA_MODELO_NAME);
  let newMesCorrenteSheet = (globalThis as any).ModeloSheet.copyTo(ssNew);
  console.info('Alterando o nome da aba copiada para %s', ABA_MES_CORRENTE_NAME);
  newMesCorrenteSheet.setName(ABA_MES_CORRENTE_NAME);
  SpreadsheetApp.setActiveSpreadsheet(ssNew);
  newMesCorrenteSheet = activateSheet_(newMesCorrenteSheet, ssNew);

  if (IS_RUN_SLOW_ROUTINES) {
    toastInfo_(
      'Copiando os intervalos protegidos da aba %s da planilha original para a aba %s da nova planilha',
      ABA_MODELO_NAME,
      ABA_MES_CORRENTE_NAME
    );
    copyIntervalProtections_((globalThis as any).ModeloSheet, newMesCorrenteSheet);
  }

  console.info('Duplicando aba "MES CORRENTE"');
  const newModeloSheet = ssNew.duplicateActiveSheet();
  console.info('Definindo nome da aba para %s', ABA_MODELO_NAME);
  newModeloSheet.setName(ABA_MODELO_NAME);

  if (IS_RUN_SLOW_ROUTINES) {
    toastInfo_(
      'Copiando os intervalos protegidos da aba %s da planilha original para a aba %s da nova planilha',
      ABA_MODELO_NAME,
      ABA_MES_CORRENTE_NAME
    );
    copyIntervalProtections_((globalThis as any).ModeloSheet, newModeloSheet);
  }

  protectSheet_(newModeloSheet, newModeloSheet.getName());

  console.info('Apagando a aba original da planilha %s', 'Página1');
  const originalSheet = ssNew.getSheetByName('Página1');
  if (originalSheet) {
    ssNew.deleteSheet(originalSheet);
  }

  /**
   *
   * ÁREA EXCLUSIVA DA PLANILHA DE SALÁRIOS
   *
   */
  toastInfo_('Aplicando as alterações específicas à planilha de salários');

  console.info('Copiando os valores do consumo nos PDVs para tirar a referencia');
  const lastMonthRange = lastMonthSheet.getRange('U3:X103');
  lastMonthRange.copyTo(
    lastMonthSheet.getRange('U3'),
    SpreadsheetApp.CopyPasteType.PASTE_VALUES,
    false
  );

  console.info('Copiando os dados dos funcionários para a aba %s', ABA_MES_CORRENTE_NAME);
  const lastMonthValues = lastMonthSheet.getRange('A3:M103').getValues();
  const lastMonthFuncionariosAtivos: any[][] = [];
  for (const lastMonthValue of lastMonthValues) {
    if (lastMonthValue[0] !== 'D') {
      lastMonthFuncionariosAtivos.push(lastMonthValue);
    }
  }

  newMesCorrenteSheet
    .getRange(
      3,
      1, // A3
      lastMonthFuncionariosAtivos.length,
      lastMonthFuncionariosAtivos[0].length
    )
    .setValues(lastMonthFuncionariosAtivos);

  const lastMonthValuesO = lastMonthSheet.getRange('O3:O103').getValues();
  const lastMonthFuncionariosAtivosO: any[][] = [];
  for (const lastMonthValue of lastMonthValuesO) {
    if (lastMonthValue[0] !== 'D') {
      lastMonthFuncionariosAtivosO.push(lastMonthValue);
    }
  }

  newMesCorrenteSheet
    .getRange(
      3,
      15, // O3
      lastMonthFuncionariosAtivosO.length,
      lastMonthFuncionariosAtivosO[0].length
    )
    .setValues(lastMonthFuncionariosAtivosO);

  SpreadsheetApp.setActiveSpreadsheet((globalThis as any).ss);
}

/**
 * Obtém a data do mês anterior
 * @param date Data de referência (padrão: data atual)
 * @returns Data do mês anterior
 */
function getPreviousMonth_(date: Date = new Date()): Date {
  return VilladasPedrasLib.getPreviousMonth(date);
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
// global.virarMesSalario_ = virarMesSalario_;
// @ts-ignore
// global.virarAnoSalario_ = virarAnoSalario_;
