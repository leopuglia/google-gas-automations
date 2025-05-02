/**
 * Arquivo principal para as automações do Google Apps Script
 */
import * as utils from '../commons/utils';

// Exportação vazia para tornar este arquivo um módulo ES
export {};

// Função que será exposta ao GAS
global.onOpen = (): void => {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Villa das Pedras').addItem('Executar Exemplo', 'executarExemplo').addToUi();
};

// Função de exemplo que será exposta ao GAS
global.executarExemplo = (): void => {
  const hoje = new Date();
  const dataFormatada = utils.formatarData(hoje);

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getActiveSheet();

  aba.getRange('A1').setValue(`Exemplo executado em: ${dataFormatada}`);

  SpreadsheetApp.getUi().alert('Exemplo executado com sucesso!');
};

// Certifique-se de expor todas as funções que serão usadas pelo GAS
// Isso é necessário devido à forma como o GAS funciona
declare global {
  // eslint-disable-next-line no-var
  var global: {
    onOpen: () => void;
    executarExemplo: () => void;
  };
}
