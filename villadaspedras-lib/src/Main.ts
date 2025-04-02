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

/**********************************
 * 
 * DEFINIÇÕES GLOBAIS
 * 
***********************************/

// Constantes Globais
const ABA_MES_CORRENTE_NAME = 'MES CORRENTE';
// const ABA_MODELO_NAME = 'MODELO';
const SHARED_FOLDER_NAME = 'Faturamento Villa';
// const EMAIL_ADMIN = 'leo@villadaspedras.com';
// const PLANILHA_SALARIO_NAME = 'Salário';
const PLANILHA_CONSUMO_NAME = 'Consumo';

// Variáveis Globais
// const IS_RUN_SLOW_ROUTINES = true;
// const IS_RUN_VIRAR_CONSUMO = true;
// const IS_ASK_USER_QUESTIONS = true;
// const TODAY = new Date();

/**********************************
 * 
 * CÁLCULO DE ATUAL E PRÓXIMO MES
 * 
***********************************/

/**
 * Calcula o mês atual e o próximo mês para virada de mês a partir da data de hoje e da última aba virada
 * @param sheetname Nome da aba
 * @param ss Planilha ativa
 * @param ui Interface do usuário
 * @param isAskUserQuestions Flag para perguntar ao usuário
 */
function getCurrentAndNextMonth(
  sheetname: string, 
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet, 
  ui: GoogleAppsScript.Base.Ui, 
  isAskUserQuestions: boolean
): { currentMonth: Date, currentMonthName: string, lastMonth: Date, lastMonthName: string } | undefined {
  // Definindo o booleano de busca de meses anteriores
  let isSeekPreviousMonth = true;

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
  if (ss.getName().includes(TODAY.getFullYear().toString())) {
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
      const response = ui.alert('Estamos no último mês do ano... Deseja virar para o próximo ano?', ui.ButtonSet.YES_NO);
      if (response !== ui.Button.YES) {
        console.warn('O usuário selecionou não! Abortando...');
        return undefined;
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
      const response = ui.alert('A aba "MES CORRENTE" já é a aba do mês atual... Deseja realmente já virar para o próximo mês?', ui.ButtonSet.YES_NO);
      if (response !== ui.Button.YES) {
        console.warn('O usuário selecionou não! Abortando...');
        return undefined;
      }
    }

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
    const currentMonthSheet = ss.getSheetByName(currentMonthName);
    if (currentMonthSheet) {
      const errorMsg = `O mês '${currentMonthName}' já foi virado! Abortando execução...`;
      throw new Error(errorMsg);
    }
    else {
      console.info('Nenhuma aba do mês %s foi encontrada. Continuando...', currentMonthName);
    }
  }

  let found = !isSeekPreviousMonth;
  let previousMonth: Date = lastMonth;
  let previousMonthName: string;
  let previousMonthSheet: GoogleAppsScript.Spreadsheet.Sheet | null;
  
  while (!found) {
    previousMonth = getPreviousMonth(previousMonth);
    previousMonthName = getMonthName(previousMonth);
    console.info('Verificando se existe aba do mês anterior %s', previousMonthName);

    previousMonthSheet = ss.getSheetByName(previousMonthName);
    if (previousMonthSheet) {
      console.info('A aba do mês %s existe!', previousMonthName);

      // Protegendo a aba encontrada para não permitir mais alterações
      protectSheet(previousMonthSheet, previousMonthName);
      
      // Definimos o mês anterior como o último mês encontrado
      lastMonth = previousMonth;
      lastMonthName = previousMonthName;
      found = true;
    }
    else if (previousMonth.getFullYear() < TODAY.getFullYear() - 1) {
      console.warn('Não foi encontrada nenhuma aba de mês anterior nos últimos 2 anos! Abortando...');
      throw new Error('Não foi encontrada nenhuma aba de mês anterior nos últimos 2 anos!');
    }
  }

  return { currentMonth, currentMonthName, lastMonth, lastMonthName };
}

/**
 * Calcula o mês atual e o próximo mês para virada de ano a partir da data de hoje e da última aba virada
 * @param sheetName Nome da aba
 * @returns Objeto com mês atual e próximo
 */
function getCurrentAndNextMonthYear(sheetName: string): { currentMonth: Date, nextMonth: Date } {
  const TODAY = new Date();
  const currentMonth = sheetName.includes(TODAY.getFullYear().toString()) ? TODAY : new Date(TODAY.getFullYear()-1,11,1);
  const nextMonth = getNextMonth(currentMonth);
  
  return { currentMonth, nextMonth };
}

/**********************************
 * 
 * INICIALIZAÇÃO E FINALIZAÇÃO DE MACROS
 * 
***********************************/

/**
 * Inicializa a macro com os parâmetros fornecidos
 * @param nomeMacro Nome da macro
 * @param anoMes Ano e mês
 * @param ss Planilha ativa
 * @param mesCorrenteSheet Aba do mês corrente
 * @param ui Interface do usuário
 * @param isAskUserQuestions Flag para perguntar ao usuário
 * @returns Objeto com informações da inicialização
 */
function inicializaMacroComAnoMes(
  nomeMacro: string, 
  anoMes: string, 
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet, 
  mesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet, 
  ui: GoogleAppsScript.Base.Ui, 
  isAskUserQuestions: boolean
): { anoMes: string, ss: GoogleAppsScript.Spreadsheet.Spreadsheet, mesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet } {
  console.info('Inicializando a macro %s...', nomeMacro);
  
  // Verificando se a aba do mês corrente existe
  if (!mesCorrenteSheet) {
    throw new Error(`A aba ${ABA_MES_CORRENTE_NAME} não existe!`);
  }
  
  // Verificando se o usuário deseja continuar
  if (isAskUserQuestions) {
    const response = ui.alert(`Deseja executar a macro ${nomeMacro}?`, ui.ButtonSet.YES_NO);
    if (response !== ui.Button.YES) {
      throw new Error('O usuário selecionou não! Abortando...');
    }
  }
  
  // Ativando a aba do mês corrente
  activateSheet(mesCorrenteSheet, ss);
  
  return { anoMes, ss, mesCorrenteSheet };
}

/**
 * Inicializa a macro com os parâmetros fornecidos
 * @param nomeMacro Nome da macro
 * @param ss Planilha ativa
 * @param ui Interface do usuário
 * @param isAskUserQuestions Flag para perguntar ao usuário
 * @returns Objeto com informações da inicialização
 */
function inicializaMacro(
  nomeMacro: string, 
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet, 
  ui: GoogleAppsScript.Base.Ui, 
  isAskUserQuestions: boolean
): { ss: GoogleAppsScript.Spreadsheet.Spreadsheet, mesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet } {
  console.info('Inicializando a macro %s...', nomeMacro);
  
  // Verificando se o usuário deseja continuar
  if (isAskUserQuestions) {
    const response = ui.alert(`Deseja executar a macro ${nomeMacro}?`, ui.ButtonSet.YES_NO);
    if (response !== ui.Button.YES) {
      throw new Error('O usuário selecionou não! Abortando...');
    }
  }
  
  // Buscando a aba do mês corrente
  const mesCorrenteSheet = ss.getSheetByName(ABA_MES_CORRENTE_NAME);
  if (!mesCorrenteSheet) {
    throw new Error(`A aba ${ABA_MES_CORRENTE_NAME} não existe!`);
  }
  
  // Ativando a aba do mês corrente
  activateSheet(mesCorrenteSheet, ss);
  
  return { ss, mesCorrenteSheet };
}

/**
 * Finaliza a macro
 * @param nomeMacro Nome da macro
 * @param ss Planilha ativa
 */
function finalizaMacro(nomeMacro: string, ss: GoogleAppsScript.Spreadsheet.Spreadsheet): void {
  console.info('Finalizando a macro %s...', nomeMacro);
  ss.toast(`Macro ${nomeMacro} finalizada com sucesso!`);
}

/**
 * Função personalizada para replicar a substituição de strings do console.log usando ss.toast
 * @param ss Planilha ativa
 * @param message Mensagem com placeholders (%s) para substituição
 * @param substitutions Valores a serem substituídos nos placeholders
 */
function toastInfo(
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet, 
  message: string, 
  ...substitutions: any[]
): void {
  let formattedMessage = message;
  
  if (substitutions && substitutions.length > 0) {
    for (const substitution of substitutions) {
      formattedMessage = formattedMessage.replace('%s', substitution.toString());
    }
  }
  
  ss.toast(formattedMessage);
}

/**
 * Retorna a data da primeira terça-feira do mês
 * @param date Data de referência
 * @returns Data da primeira terça-feira do mês
 */
function getFirstTuesday(date: Date = new Date()): Date {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDay.getDay();
  const daysToAdd = (dayOfWeek <= 2) ? 2 - dayOfWeek : 9 - dayOfWeek;
  
  return new Date(date.getFullYear(), date.getMonth(), 1 + daysToAdd);
}

/**
 * Retorna o mês anterior
 * @param date Data de referência
 * @returns Data do mês anterior
 */
function getPreviousMonth(date: Date = new Date()): Date {
  const previousMonth = new Date(date);
  
  if (date.getMonth() === 0) {
    previousMonth.setFullYear(date.getFullYear() - 1);
    previousMonth.setMonth(11);
  } else {
    previousMonth.setMonth(date.getMonth() - 1);
  }
  
  return previousMonth;
}

/**
 * Retorna o próximo mês
 * @param date Data de referência
 * @returns Data do próximo mês
 */
function getNextMonth(date: Date = new Date()): Date {
  const nextMonth = new Date(date);
  
  if (date.getMonth() === 11) {
    nextMonth.setFullYear(date.getFullYear() + 1);
    nextMonth.setMonth(0);
  } else {
    nextMonth.setMonth(date.getMonth() + 1);
  }
  
  return nextMonth;
}

/**
 * Formata o nome do mês fornecido no formato "yyyy-MM"
 * @param date Data desejada ou data de hoje se nulo
 * @returns Nome do mês formatado
 */
function getMonthName(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  return `${year}-${month.toString().padStart(2, '0')}`;
}

/**
 * Ativa uma aba na planilha
 * @param sheet Aba a ser ativada
 * @param ss Planilha ativa
 */
function activateSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet, ss: GoogleAppsScript.Spreadsheet.Spreadsheet): void {
  try {
    sheet.activate();
  } catch (e) {
    console.error('Erro ao ativar a aba: %s', e);
    ss.toast(`Erro ao ativar a aba: ${e}`);
  }
}

/**
 * Busca a ID de um Drive Compartilhado pelo nome
 * @param sharedFolderName Nome da pasta compartilhada
 * @param drive Instância da classe global Drive
 * @returns ID do drive pesquisado
 */
function getDriveIDByName(
  sharedFolderName: string, 
  drive: GoogleAppsScript.Drive.DriveApp = DriveApp
): string | null {
  try {
    // Buscando a pasta compartilhada
    const query = `title = '${sharedFolderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const folders = drive.searchFolders(query);
    
    // Verificando se encontrou a pasta
    if (!folders.hasNext()) {
      console.error('Pasta compartilhada %s não encontrada!', sharedFolderName);
      return null;
    }
    
    // Retornando o ID da pasta
    const folder = folders.next();
    console.info('Pasta compartilhada %s encontrada com ID %s', sharedFolderName, folder.getId());
    
    return folder.getId();
  } catch (e) {
    console.error('Erro ao buscar a pasta compartilhada: %s', e);
    return null;
  }
}

/**
 * Retorna um Map com as planilhas de consumo localizadas na pasta SHARED_FOLDER_NAME
 * @param currentMonth Mês atual
 * @param drive Instância da classe global Drive
 * @returns Map com as planilhas de consumo
 */
function getPlanilhasConsumo(
  currentMonth: Date, 
  drive: GoogleAppsScript.Drive.DriveApp = DriveApp
): Map<string, GoogleAppsScript.Spreadsheet.Spreadsheet> {
  try {
    // Buscando a pasta compartilhada
    const sharedFolderID = getDriveIDByName(SHARED_FOLDER_NAME, drive);
    if (!sharedFolderID) {
      throw new Error(`Pasta compartilhada ${SHARED_FOLDER_NAME} não encontrada!`);
    }
    
    // Buscando as planilhas de consumo
    const sharedFolder = drive.getFolderById(sharedFolderID);
    const query = `title contains '${PLANILHA_CONSUMO_NAME}' and title contains '${currentMonth.getFullYear()}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`;
    const files = sharedFolder.searchFiles(query);
    
    // Criando o Map com as planilhas
    const planilhasConsumo = new Map<string, GoogleAppsScript.Spreadsheet.Spreadsheet>();
    while (files.hasNext()) {
      const file = files.next();
      planilhasConsumo.set(file.getName(), SpreadsheetApp.openById(file.getId()));
    }
    
    return planilhasConsumo;
  } catch (e) {
    console.error('Erro ao buscar as planilhas de consumo: %s', e);
    return new Map();
  }
}

/**
 * Protege a aba sheet para não permitir mais alterações
 * @param sheet Aba a ser protegida
 * @param sheetName Nome da aba
 */
function protectSheet(
  sheet: GoogleAppsScript.Spreadsheet.Sheet, 
  sheetName: string = sheet.getName()
): void {
  try {
    // Protegendo a aba
    const protection = sheet.protect().setDescription(`Proteção da aba ${sheetName}`);
    
    // Removendo todos os editores exceto o usuário atual
    const me = Session.getEffectiveUser();
    protection.addEditor(me);
    protection.removeEditors(protection.getEditors());
    if (protection.canDomainEdit()) {
      protection.setDomainEdit(false);
    }
  } catch (e) {
    console.error('Erro ao proteger a aba %s: %s', sheetName, e);
  }
}

/**
 * Copia todos os intervalos protegidos entre abas
 * @param ss Planilha ativa
 * @param sourceSheet Aba de origem
 * @param destinationSheet Aba de destino
 */
function copyIntervalProtections(
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet, 
  sourceSheet: GoogleAppsScript.Spreadsheet.Sheet, 
  destinationSheet: GoogleAppsScript.Spreadsheet.Sheet
): void {
  try {
    // Buscando as proteções da aba de origem
    const protections = sourceSheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    if (protections.length === 0) {
      console.info('Nenhuma proteção encontrada na aba de origem!');
      return;
    }
    
    // Copiando as proteções para a aba de destino
    for (const protection of protections) {
      const range = protection.getRange();
      if (!range) continue;
      
      const rangeA1Notation = range.getA1Notation();
      const destinationRange = destinationSheet.getRange(rangeA1Notation);
      
      const newProtection = destinationRange.protect().setDescription(protection.getDescription());
      
      // Configurando os editores
      const editors = protection.getEditors();
      if (editors.length > 0) {
        editors.forEach(editor => newProtection.addEditor(editor));
      }
      
      // Configurando as permissões de domínio
      if (protection.canDomainEdit()) {
        newProtection.setDomainEdit(true);
      }
    }
  } catch (e) {
    console.error('Erro ao copiar as proteções: %s', e);
  }
}

/**
 * Função destinada a desbloquear uma aba bloqueada
 * @param sheet Aba a ser desbloqueada
 */
function unprotectSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
  try {
    // Buscando as proteções da aba
    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    
    // Removendo as proteções
    for (const protection of protections) {
      protection.remove();
    }
  } catch (e) {
    console.error('Erro ao desbloquear a aba: %s', e);
  }
}

/**
 * Função destinada a desbloquear os intervalos de uma aba bloqueada
 * @param sheet Aba a ter os intervalos desbloqueados
 */
function unprotectIntervals(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
  try {
    // Buscando as proteções de intervalos da aba
    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    
    // Removendo as proteções
    for (const protection of protections) {
      protection.remove();
    }
  } catch (e) {
    console.error('Erro ao desbloquear os intervalos da aba: %s', e);
  }
}

/**
 * Reordena os nomes na planilha de salário
 * @param sheet Aba a ser reordenada
 * @param modeloSheet Aba modelo
 */
function reordenarNomesSalario(
  sheet: GoogleAppsScript.Spreadsheet.Sheet, 
  modeloSheet: GoogleAppsScript.Spreadsheet.Sheet
): void {
  try {
    // Definindo as constantes
    const COLUNA_NOMES = 'B';
    const LINHA_INICIAL = 7;
    const LINHA_FINAL = 30;
    
    // Obtendo os nomes da aba atual
    const rangeNomes = sheet.getRange(`${COLUNA_NOMES}${LINHA_INICIAL}:${COLUNA_NOMES}${LINHA_FINAL}`);
    const valuesNomes = rangeNomes.getValues();
    
    // Filtrando os nomes não vazios
    const nomes: string[] = [];
    for (const row of valuesNomes) {
      const nome = row[0]?.toString().trim();
      if (nome) {
        nomes.push(nome);
      }
    }
    
    // Ordenando os nomes
    nomes.sort();
    
    // Preparando o array para atualização
    const newValues: string[][] = [];
    for (let i = 0; i < (LINHA_FINAL - LINHA_INICIAL + 1); i++) {
      if (i < nomes.length) {
        newValues.push([nomes[i]]);
      } else {
        newValues.push(['']);
      }
    }
    
    // Atualizando a aba atual
    rangeNomes.setValues(newValues);
    
    // Copiando os valores da aba modelo para a aba atual
    const rangeModelo = modeloSheet.getRange(`C${LINHA_INICIAL}:L${LINHA_FINAL}`);
    const valuesModelo = rangeModelo.getValues();
    
    // Atualizando a aba atual com os valores da aba modelo
    const rangeAtual = sheet.getRange(`C${LINHA_INICIAL}:L${LINHA_FINAL}`);
    rangeAtual.setValues(valuesModelo);
    
    // Copiando as fórmulas da aba modelo para a aba atual
    const rangeFormulaModelo = modeloSheet.getRange(`M${LINHA_INICIAL}:V${LINHA_FINAL}`);
    const formulasModelo = rangeFormulaModelo.getFormulas();
    
    // Atualizando a aba atual com as fórmulas da aba modelo
    const rangeFormulaAtual = sheet.getRange(`M${LINHA_INICIAL}:V${LINHA_FINAL}`);
    rangeFormulaAtual.setFormulas(formulasModelo);
    
    // Limpando as cores de fundo
    limparCores(sheet.getRange(`B${LINHA_INICIAL}:V${LINHA_FINAL}`));
  } catch (e) {
    console.error('Erro ao reordenar os nomes: %s', e);
  }
}

/**
 * Limpa as cores de fundo de um intervalo
 * @param range Intervalo a ter as cores limpas
 */
function limparCores(range: GoogleAppsScript.Spreadsheet.Range): void {
  try {
    range.setBackground(null);
  } catch (e) {
    console.error('Erro ao limpar as cores: %s', e);
  }
}

/**
 * Limpa os dados de uma aba
 * @param modeloSheet Aba modelo
 * @param mesCorrenteSheet Aba do mês corrente
 */
function limparDados(
  modeloSheet: GoogleAppsScript.Spreadsheet.Sheet, 
  mesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet
): void {
  try {
    // Copiando os dados da aba modelo para a aba do mês corrente
    const range = modeloSheet.getDataRange();
    const values = range.getValues();
    
    mesCorrenteSheet.getDataRange().setValues(values);
  } catch (e) {
    console.error('Erro ao limpar os dados: %s', e);
  }
}

// Função para virar o ano do salário (implementação a ser adicionada)
function virarAnoSalario_(currentMonth: Date, lastMonth: Date): void {
  // Implementação a ser adicionada
  console.info('Virando o ano do salário de %s para %s', getMonthName(lastMonth), getMonthName(currentMonth));
}

// Exportando as funções para uso global
export {
  getCurrentAndNextMonth,
  getCurrentAndNextMonthYear,
  inicializaMacro,
  inicializaMacroComAnoMes,
  finalizaMacro,
  toastInfo,
  getFirstTuesday,
  getPreviousMonth,
  getNextMonth,
  getMonthName,
  activateSheet,
  getDriveIDByName,
  getPlanilhasConsumo,
  protectSheet,
  copyIntervalProtections,
  unprotectSheet,
  unprotectIntervals,
  reordenarNomesSalario,
  limparCores,
  limparDados
};
