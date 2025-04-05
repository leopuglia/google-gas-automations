/**
 * commons: biblioteca com funções auxiliares
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
export const ABA_MES_CORRENTE_NAME = 'MES CORRENTE';
export const ABA_MODELO_NAME = 'MODELO';
export const SHARED_FOLDER_NAME = 'Faturamento Villa';
export const EMAIL_ADMIN = 'leo@villadaspedras.com';
export const PLANILHA_SALARIO_NAME = 'Salário';
export const PLANILHA_CONSUMO_NAME = 'Consumo';

/**********************************
 *
 * CÁLCULO DE ATUAL E PRÓXIMO MES
 *
 ***********************************/

/**
 * Interface para retorno da função de cálculo de mês atual e próximo
 */
export interface MonthInfo {
  currentMonth: Date;
  currentMonthName: string;
  lastMonth: Date;
  lastMonthName: string;
}

/**
 * Calcula o mês atual e o próximo mês para virada de mês a partir da data de hoje e da última aba virada
 * @param sheetname Nome da aba para verificação
 * @param ss Planilha ativa
 * @param ui Interface do usuário do SpreadsheetApp
 * @param isAskUserQuestions Se deve perguntar ao usuário sobre decisões
 * @returns Informações sobre mês atual e próximo ou undefined se cancelado
 */
export function getCurrentAndNextMonth(
  sheetname: string,
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
  ui: GoogleAppsScript.Base.Ui,
  isAskUserQuestions: boolean
): MonthInfo | undefined {
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
  } else {
    console.info('Não estamos no mesmo ano %s que a planilha!', TODAY.getFullYear());

    currentMonth = new Date(TODAY.getFullYear() - 1, 11, 1);
    currentMonthName = getMonthName(currentMonth);
    lastMonth = getPreviousMonth(currentMonth);
    lastMonthName = getMonthName(lastMonth);
    console.info('Alterando mês atual para %s', currentMonthName);
  }

  // Verificando se estamos em dezembro, janeiro OU se existe aba do mês anterior
  console.info(
    'Verificando se estamos em dezembro, janeiro ou se existe aba do mês anterior %s',
    lastMonthName
  );
  if (currentMonth.getMonth() == 11) {
    console.info('Estamos em dezembro!');

    console.info('Perguntando ao usuário se deseja virar para o próximo ano...');
    if (isAskUserQuestions) {
      const response = ui.alert(
        'Estamos no último mês do ano... Deseja virar para o próximo ano?',
        ui.ButtonSet.YES_NO
      );
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
    // virarAnoSalario_(currentMonth, lastMonth);
  }
  // Se estamos em janeiro OU existe aba do mês anterior
  else if (currentMonth.getMonth() == 0 || ss.getSheetByName(lastMonthName)) {
    console.info('Estamos em janeiro ou existe aba do mês anterior %s!', lastMonthName);

    console.info('Perguntando ao usuário se deseja virar para o próximo mês...');

    if (isAskUserQuestions) {
      const response = ui.alert(
        'A aba "MES CORRENTE" já é a aba do mês atual... Deseja realmente já virar para o próximo mês?',
        ui.ButtonSet.YES_NO
      );
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
  } else {
    console.info(
      'Não estamos em janeiro e não existe aba do mês anterior %s. Continuando...',
      lastMonthName
    );

    // Verificando se existe aba do mês atual
    console.info('Verificando se existe aba do mês atual %s', currentMonthName);
    const currentMonthSheet = ss.getSheetByName(currentMonthName);
    if (currentMonthSheet) {
      const errorMsg = `O mês '${currentMonthName}' já foi virado! Abortando execução...`;
      throw new Error(errorMsg);
    } else {
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
      found = true;
    } else {
      console.info('A aba do mês %s não existe!', previousMonthName);
    }
  }

  console.info('Mês Atual = %s / Mês anterior = %s', currentMonthName, lastMonthName);
  return {
    currentMonth,
    currentMonthName,
    lastMonth,
    lastMonthName,
  };
}

/**
 * Calcula o mês atual e o próximo mês para virada de ano a partir da data de hoje e da última aba virada
 * @param sheetName Nome da aba para verificação
 * @returns Informações sobre mês atual e próximo
 */
export function getCurrentAndNextMonthYear(): MonthInfo {
  const TODAY = new Date();
  const lastMonth = new Date(TODAY.getFullYear(), 11, 1);
  const lastMonthName = getMonthName(lastMonth);
  const currentMonth = new Date(TODAY.getFullYear() + 1, 0, 1);
  const currentMonthName = getMonthName(currentMonth);

  return {
    currentMonth,
    currentMonthName,
    lastMonth,
    lastMonthName,
  };
}

/**********************************
 *
 * INICIALIZAÇÃO E FINALIZAÇÃO DE MACROS
 *
 ***********************************/

/**
 * Inicializa uma macro com mensagens para o usuário
 * @param nomeMacro Nome da macro para exibir mensagens
 * @param anoMes Se é macro de virada de mês ou ano
 * @param ss Planilha ativa
 * @param mesCorrenteSheet Planilha do mês corrente
 * @param ui Interface do usuário do SpreadsheetApp
 * @param isAskUserQuestions Se deve perguntar ao usuário sobre decisões
 * @returns Se a inicialização foi bem sucedida
 */
export function inicializaMacro(
  nomeMacro: string,
  anoMes: string,
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
  mesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet | null,
  ui: GoogleAppsScript.Base.Ui,
  isAskUserQuestions: boolean
): boolean {
  console.info('=================================');
  console.info('Iniciando macro %s...', nomeMacro);
  console.info('=================================');

  // Se tiver que perguntar para o usuário, pergunte se ele deseja continuar
  if (isAskUserQuestions) {
    const resposta = ui.alert(`Confirma a virada de ${anoMes} da planilha?`, ui.ButtonSet.YES_NO);
    if (resposta !== ui.Button.YES) {
      console.warn('O usuário selecionou não! Abortando...');
      return false;
    }
  }

  // Se conseguir a planilha e a interface, retorne verdadeiro
  if (ss && mesCorrenteSheet) {
    console.info('Planilha: ' + ss.getName());
    return true;
  }

  console.warn('Não foi possível encontrar a planilha! Abortando...');
  return false;
}

/**
 * Inicializa uma macro com mensagens para o usuário (versão simplificada)
 * @param nomeMacro Nome da macro para exibir mensagens
 * @param ss Planilha ativa
 * @param ui Interface do usuário do SpreadsheetApp
 * @param isAskUserQuestions Se deve perguntar ao usuário sobre decisões
 * @returns Se a inicialização foi bem sucedida
 */
export function inicializaMacroSimples(
  nomeMacro: string,
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet
): boolean {
  console.info('=================================');
  console.info('Iniciando macro %s...', nomeMacro);
  console.info('=================================');

  // Se conseguir a planilha e a interface, retorne verdadeiro
  if (ss) {
    console.info('Planilha: ' + ss.getName());
    return true;
  }

  console.warn('Não foi possível encontrar a planilha! Abortando...');
  return false;
}

/**
 * Finaliza uma macro com mensagens para o usuário
 * @param nomeMacro Nome da macro para exibir mensagens
 * @param ss Planilha ativa
 */
export function finalizaMacro(nomeMacro: string): void {
  console.info('Macro %s finalizada com sucesso!', nomeMacro);
}

/**
 * Função personalizada para replicar a substituição de strings do console.log usando ss.toast
 * @param ss Planilha ativa
 * @param message A mensagem com placeholders (%s) para substituição
 * @param substitutions Os valores a serem substituídos nos placeholders
 */
export function toastInfo(
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
  message: string,
  ...substitutions: unknown[]
): void {
  // Substituindo placeholders %s por valores reais
  let formattedMessage = message;

  if (substitutions && substitutions.length > 0) {
    substitutions.forEach((sub) => {
      formattedMessage = formattedMessage.replace(/%s/, String(sub));
    });
  }

  // Exibindo o toast
  ss.toast(formattedMessage);
}

/**
 * Obtém a data da primeira terça-feira do mês
 * @param date Data de referência (padrão: data atual)
 * @returns Data da primeira terça-feira do mês
 */
export function getFirstTuesday(date: Date = new Date()): Date {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDay.getDay();
  const daysUntilTuesday = dayOfWeek <= 2 ? 2 - dayOfWeek : 9 - dayOfWeek;

  return new Date(date.getFullYear(), date.getMonth(), 1 + daysUntilTuesday);
}

/**
 * Obtém a data do mês anterior
 * @param date Data de referência (padrão: data atual)
 * @returns Data do mês anterior
 */
export function getPreviousMonth(date: Date = new Date()): Date {
  // Se for janeiro, retorna dezembro do ano anterior
  if (date.getMonth() === 0) {
    return new Date(date.getFullYear() - 1, 11, 1);
  }

  // Caso contrário, retorna o mês anterior
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

/**
 * Obtém a data do próximo mês
 * @param date Data de referência (padrão: data atual)
 * @returns Data do próximo mês
 */
export function getNextMonth(date: Date = new Date()): Date {
  // Se for dezembro, retorna janeiro do próximo ano
  if (date.getMonth() === 11) {
    return new Date(date.getFullYear() + 1, 0, 1);
  }

  // Caso contrário, retorna o próximo mês
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

/**
 * Formata o nome do mês fornecido no formato "yyyy-MM"
 * @param date Data desejada ou data de hoje se nulo
 * @returns Nome do mês formatado
 */
export function getMonthName(date: Date = new Date()): string {
  const ano = date.getFullYear();
  const mes = date.getMonth() + 1;

  return `${ano}-${mes.toString().padStart(2, '0')}`;
}

/**
 * Ativa uma aba específica da planilha
 * @param sheet Aba a ser ativada
 * @param ss Planilha ativa
 */
export function activateSheet(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet
): void {
  ss.setActiveSheet(sheet);
  ss.moveActiveSheet(ss.getNumSheets());
}

/**
 * Busca a ID de um Drive Compartilhado pelo nome
 * @param sharedFolderName Nome da pasta compartilhada
 * @param drive Instância da classe global Drive
 * @returns ID do drive pesquisado
 */
export function getDriveIDByName(
  sharedFolderName: string,
  drive: GoogleAppsScript.Drive.DriveApp = DriveApp
): string | null {
  // Busca pela pasta compartilhada no Drive
  const folders = drive.getFolders();
  let folder = null;

  // Buscando todas as pastas visíveis ao usuário
  while (folders.hasNext()) {
    const currentFolder = folders.next();

    // Se o nome da pasta for igual ao fornecido, armazena e para a busca
    if (currentFolder.getName() === sharedFolderName) {
      folder = currentFolder;
      break;
    }
  }

  // Se não encontrou, retorna um erro
  if (!folder) {
    console.error('Pasta "%s" não encontrada!', sharedFolderName);
    return null;
  }

  // Caso contrário, retorna o ID da pasta encontrada
  return folder.getId();
}

/**
 * Retorna um Map com as planilhas de consumo localizadas na pasta SHARED_FOLDER_NAME
 * @param currentMonth Mês atual
 * @param drive Instância da classe global Drive
 * @returns Map com as planilhas de consumo encontradas
 */
export function getPlanilhasConsumo(
  currentMonth: Date,
  drive: GoogleAppsScript.Drive.DriveApp = DriveApp
): Map<string, GoogleAppsScript.Spreadsheet.Spreadsheet> {
  // Obtendo o ID da pasta compartilhada
  const folderId = getDriveIDByName(SHARED_FOLDER_NAME, drive);
  if (!folderId) return new Map();

  // Obtendo a pasta compartilhada
  const folder = drive.getFolderById(folderId);

  // Buscando todas as planilhas dentro da pasta
  const result = new Map<string, GoogleAppsScript.Spreadsheet.Spreadsheet>();
  const files = folder.getFilesByType('application/vnd.google-apps.spreadsheet');

  // Coletando apenas as planilhas de consumo
  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName();

    // Se for uma planilha de consumo e contiver o ano atual
    if (name.includes('Consumo') && name.includes(currentMonth.getFullYear().toString())) {
      const spreadsheet = SpreadsheetApp.openById(file.getId());
      result.set(name, spreadsheet);
    }
  }

  return result;
}

/**
 * Protege a aba sheet para não permitir mais alterações
 * @param sheet Aba a ser protegida
 * @param sheetName Nome da aba (padrão: nome da aba)
 */
export function protectSheet(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  sheetName: string = sheet.getName()
): void {
  // Obtém as proteções da aba
  const protecoesAba = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);

  // Se não houver proteções, protege a aba
  if (protecoesAba.length === 0) {
    console.info('Protegendo a aba %s', sheetName);
    const protection = sheet.protect();
    protection.setDescription(`Aba protegida: ${sheetName}`);
    protection.removeEditors(protection.getEditors());
    protection.addEditor(EMAIL_ADMIN);
  }
}

/**
 * Copia todos os intervalos protegidos entre abas
 * @param ss Planilha ativa
 * @param sourceSheet Aba de origem
 * @param destinationSheet Aba de destino
 */
export function copyIntervalProtections(
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
  sourceSheet: GoogleAppsScript.Spreadsheet.Sheet,
  destinationSheet: GoogleAppsScript.Spreadsheet.Sheet
): void {
  // Obtém as proteções da aba de origem
  const protectionsFonte = sourceSheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);

  // Se houver proteções, copia para a aba de destino
  if (protectionsFonte.length > 0) {
    console.info(
      'Copiando %s proteção(ões) da aba %s para %s',
      protectionsFonte.length,
      sourceSheet.getName(),
      destinationSheet.getName()
    );

    // Para cada proteção, cria uma nova na aba de destino
    for (let i = 0; i < protectionsFonte.length; i++) {
      const protectionFonte = protectionsFonte[i];
      const range = protectionFonte.getRange();

      // Se tivermos um intervalo válido, criamos a proteção
      if (range) {
        const a1Notation = range.getA1Notation();
        const targetRange = destinationSheet.getRange(a1Notation);

        // Cria a proteção e configura
        const newProtection = targetRange.protect();
        const description =
          protectionFonte.getDescription() ||
          `Intervalo protegido: ${destinationSheet.getName()}.${a1Notation}`;

        newProtection.setDescription(description);
        newProtection.removeEditors(newProtection.getEditors());
        newProtection.addEditor(EMAIL_ADMIN);
      }
    }
  }
}

/**
 * Função destinada a desbloquear uma aba bloqueada
 * @param sheet Aba a ser desprotegida
 */
export function unprotectSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
  // Obtém as proteções da aba
  const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);

  // Para cada proteção, remove
  for (let i = 0; i < protections.length; i++) {
    protections[i].remove();
  }
}

/**
 * Função destinada a desbloquear os intervalos de uma aba bloqueada
 * @param sheet Aba a ter os intervalos desprotegidos
 */
export function unprotectIntervals(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
  // Obtém as proteções de intervalo da aba
  const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);

  // Se houver proteções
  if (protections.length > 0) {
    console.info('Removendo %s proteção(ões) da aba %s', protections.length, sheet.getName());

    // Para cada proteção, remove
    for (let i = 0; i < protections.length; i++) {
      const protection = protections[i];
      protection.remove();
    }
  }
}

/**
 * Reordena os nomes na planilha de salário
 * @param sheet Aba a ser reordenada
 * @param modeloSheet Aba modelo para referência
 */
export function reordenarNomesSalario(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  modeloSheet: GoogleAppsScript.Spreadsheet.Sheet
): void {
  // Verificando se as abas são válidas
  if (!sheet || !modeloSheet) {
    console.error('Abas inválidas!');
    return;
  }

  // Variáveis de posição
  const LINHA_INICIAL = 5;
  const LINHA_FINAL = sheet.getLastRow();
  const COLUNA_NOMES = 2;

  if (LINHA_FINAL < LINHA_INICIAL) {
    console.warn('Nenhum nome para ordenar!');
    return;
  }

  console.info('Reordenando lista de nomes...');

  // Obtém valores da aba atual e da aba modelo
  const valoresAbaAtual = sheet
    .getRange(LINHA_INICIAL, 1, LINHA_FINAL - LINHA_INICIAL + 1, sheet.getLastColumn())
    .getValues();
  const valoresAbaModelo = modeloSheet
    .getRange(
      LINHA_INICIAL,
      1,
      modeloSheet.getLastRow() - LINHA_INICIAL + 1,
      modeloSheet.getLastColumn()
    )
    .getValues();

  // Prepara o mapa de correspondência entre nomes e linhas na aba atual
  const mapaLinhas = new Map<string, number[]>();

  // Para cada linha na aba atual
  for (let i = 0; i < valoresAbaAtual.length; i++) {
    const nome = valoresAbaAtual[i][COLUNA_NOMES - 1];
    if (nome && typeof nome === 'string' && nome.trim().length > 0) {
      if (!mapaLinhas.has(nome)) {
        mapaLinhas.set(nome, []);
      }
      mapaLinhas.get(nome)?.push(i);
    }
  }

  // Para cada linha na aba modelo
  for (let i = 0; i < valoresAbaModelo.length; i++) {
    const nome = valoresAbaModelo[i][COLUNA_NOMES - 1];
    if (nome && typeof nome === 'string' && nome.trim().length > 0) {
      // Se o nome existir na aba atual
      if (mapaLinhas.has(nome) && mapaLinhas.get(nome)?.length) {
        // Obtem o índice da linha na aba atual
        const idxLinha = mapaLinhas.get(nome)?.shift();
        if (idxLinha !== undefined) {
          // Se a linha já estiver na posição correta, continua
          if (idxLinha === i) continue;

          // Caso contrário, move os dados para a posição correta
          sheet
            .getRange(LINHA_INICIAL + idxLinha, 1, 1, sheet.getLastColumn())
            .moveTo(sheet.getRange(LINHA_INICIAL + i, 1, 1, sheet.getLastColumn()));
        }
      }
    }
  }

  console.info('Lista de nomes reordenada com sucesso!');
}

/**
 * Limpa as cores de um intervalo
 * @param range Intervalo a ter as cores limpas
 */
export function limparCores(range: GoogleAppsScript.Spreadsheet.Range): void {
  range.setBackground(null);
  range.setFontColor(null);
}

/**
 * Limpa os dados entre abas
 * @param modeloSheet Aba modelo para referência
 * @param mesCorrenteSheet Aba do mês corrente
 */
export function limparDados(
  modeloSheet: GoogleAppsScript.Spreadsheet.Sheet,
  mesCorrenteSheet: GoogleAppsScript.Spreadsheet.Sheet
): void {
  const fonte = modeloSheet.getRange('C5:AA1000');
  const destino = mesCorrenteSheet.getRange('C5:AA1000');
  fonte.copyTo(destino, { contentsOnly: true });
}
