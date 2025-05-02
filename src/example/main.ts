/**
 * Arquivo principal para as automações do Google Apps Script
 */
// import { formatarData } from "./utils";
// Removida importação não utilizada

// Exportação vazia para tornar este arquivo um módulo ES
export {};

// Função que será exposta ao GAS
global.onOpen = (): void => {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Villa das Pedras').addItem('Executar Exemplo', 'executarExemplo').addToUi();
};

// Função de exemplo que será exposta ao GAS
global.executarExemplo = (): void => {
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
