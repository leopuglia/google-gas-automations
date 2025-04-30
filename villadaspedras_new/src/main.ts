/**
 * Arquivo principal para as automações do Google Apps Script
 */
// import { formatarData } from "./utils";
import * as utils from './utils';

// Função que será exposta ao GAS
global.onOpen = (): void => {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Villa das Pedras')
    .addItem('Executar Exemplo', 'executarExemplo')
    .addToUi();
};

// Função de exemplo que será exposta ao GAS
global.executarExemplo = (): void => {
  const hoje = new Date();
  const dataFormatada = utils.formatarData(hoje);
  // const dataFormatada = formatarData(hoje);
  // const dataFormatada = import('./utils').then(mod => {
  //   mod.formatarData(hoje)
  // })

  // const dataFormatada2 = utils.Utils.formatarData(hoje);
  // const dataFormatada2 = Utils.formatarData(hoje);
  
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getActiveSheet();
  
  aba.getRange('A1').setValue(`Exemplo executado em: ${dataFormatada}`);
  // aba.getRange('A2').setValue(`Exemplo executado em: ${dataFormatada2}`);
  
  SpreadsheetApp.getUi().alert('Exemplo executado com sucesso!');
};

// Certifique-se de expor todas as funções que serão usadas pelo GAS
// Isso é necessário devido à forma como o GAS funciona
declare global {
  // typescript-ignore-next-line no-var
  var global: {
    onOpen: () => void;
    executarExemplo: () => void;
  };
}
