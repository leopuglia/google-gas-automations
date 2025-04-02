/** 
 * Villa das Pedras: Funções de manipulação do Google Drive
 * 
 * Versão: 1.0.0 | Data: 05/09/2024
 * 
 * Autor: Leonardo Puglia
 * 
 * Descrição: Funções auxiliares para manipulação do Google Drive
 */

import { SHARED_FOLDER_NAME } from '../constants';
import { getMonthName } from '../date/dateUtils';

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
  try {
    // Busca por pastas com o nome especificado
    const folderIterator = drive.getFoldersByName(sharedFolderName);
    
    // Verifica se encontrou alguma pasta
    if (folderIterator.hasNext()) {
      const folder = folderIterator.next();
      return folder.getId();
    }
    
    // Tenta buscar em drives compartilhados usando Drive API v3
    try {
      // Usando DriveApp.getRootFolder() como fallback se não conseguir acessar drives compartilhados
      const rootFolder = drive.getRootFolder();
      const rootFolderIterator = rootFolder.getFoldersByName(sharedFolderName);
      
      if (rootFolderIterator.hasNext()) {
        const folder = rootFolderIterator.next();
        return folder.getId();
      }
    } catch (e) {
      console.error('Erro ao buscar em drives compartilhados: %s', e);
    }
    
    console.error('Pasta compartilhada não encontrada: %s', sharedFolderName);
    return null;
  } catch (e) {
    console.error('Erro ao buscar ID do drive: %s', e);
    return null;
  }
}

/**
 * Retorna um Map com as planilhas de consumo localizadas na pasta SHARED_FOLDER_NAME
 * @param currentMonth Mês atual
 * @param drive Instância da classe global Drive
 * @returns Map com as planilhas de consumo
 */
export function getPlanilhasConsumo(
  currentMonth: Date, 
  drive: GoogleAppsScript.Drive.DriveApp = DriveApp
): Map<string, GoogleAppsScript.Drive.File> {
  const result = new Map<string, GoogleAppsScript.Drive.File>();
  
  try {
    // Obtém o ID da pasta compartilhada
    const driveID = getDriveIDByName(SHARED_FOLDER_NAME, drive);
    if (!driveID) {
      console.error('Pasta compartilhada não encontrada');
      return result;
    }
    
    // Obtém a pasta compartilhada
    const sharedFolder = DriveApp.getFolderById(driveID);
    
    // Formata o mês atual para buscar as planilhas
    const monthName = getMonthName(currentMonth);
    const year = currentMonth.getFullYear();
    
    // Busca por arquivos que contenham "Consumo" e o ano atual no nome
    // Também registra o mês atual para fins de log
    console.log('Buscando planilhas de consumo para o mês: %s', monthName);
    const fileIterator = sharedFolder.getFilesByName(`Consumo ${year}`);
    
    // Adiciona os arquivos encontrados ao Map
    while (fileIterator.hasNext()) {
      const file = fileIterator.next();
      const fileName = file.getName();
      
      // Extrai o nome do PDV do nome do arquivo
      // Exemplo: "Consumo 2024 - Cafeteria" -> "Cafeteria"
      const match = fileName.match(/Consumo \d{4} - (.+)/);
      if (match && match[1]) {
        const pdvName = match[1].trim();
        result.set(pdvName, file);
      }
    }
  } catch (e) {
    console.error('Erro ao buscar planilhas de consumo: %s', e);
  }
  
  return result;
}
