/**
 * Macros para planilha de consumo
 * 
 * Autor: Leonardo Puglia
 * Versão: 1.0.0 | Data: 02/04/2025
 * 
 * Descrição: Automações para as planilhas de consumo dos PDVs da Villa das Pedras
 */

// Importação dos módulos
import { virarMesConsumo } from './modules/viradaMes';
import { virarAnoConsumo } from './modules/viradaAno';
import { limparDadosSheet, onOpen } from './modules/consumoUtils';

/**
 * Exportação das funções para o ambiente global do Google Apps Script
 */

// Funções de virada de mês e ano
declare global {
  function virarMesConsumo(): void;
  function virarAnoConsumo(): void;
  function limparDadosSheet(): void;
  function onOpen(): void;
}

// Exportando funções para uso global
export {
  virarMesConsumo,
  virarAnoConsumo,
  limparDadosSheet,
  onOpen
};

// Definindo funções no contexto global para o Google Apps Script
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;
global.virarMesConsumo = virarMesConsumo;
global.virarAnoConsumo = virarAnoConsumo;
global.limparDadosSheet = limparDadosSheet;
global.onOpen = onOpen;
