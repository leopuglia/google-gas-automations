// Configurações padrão do projeto

import { ISpreadsheetConfig } from './types';

export const defaultConfig: ISpreadsheetConfig = {
  currentSheetName: 'MES CORRENTE',
  modelSheetName: 'MODELO',
  protectedRanges: ['A1:Z100'],
  sharedFolderName: 'Faturamento Villa',
  emailAdmin: 'leo@villadaspedras.com',
};
