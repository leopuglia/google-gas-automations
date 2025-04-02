/**
 * Macros para planilha de salário
 * 
 * Autor: Leonardo Puglia
 * Versão: 1.0.0 | Data: 02/04/2025
 * 
 * Descrição: Automações para a planilha de salário
 */

// Importação dos módulos
import { virarMesSalario, virarMesTudo } from './modules/viradaMes';
import { virarAnoSalario, virarAnoTudo } from './modules/viradaAno';
import { 
  limparCoresSheet, 
  reordenarNomes, 
  limparDadosSheet, 
  bloquearAlteracoes 
} from './modules/salarioUtils';

/**
 * Exportação das funções para o ambiente global do Google Apps Script
 */

// Funções de virada de mês
declare global {
  function virarMesSalario(): void;
  function virarMesTudo(): void;
}

// Funções de virada de ano
declare global {
  function virarAnoSalario(): void;
  function virarAnoTudo(): void;
}

// Funções utilitárias
declare global {
  function limparCoresSheet(): void;
  function reordenarNomes(): void;
  function limparDadosSheet(): void;
  function bloquearAlteracoes(): void;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const global: any;
}

// Exportando as funções para o escopo global
global.virarMesSalario = virarMesSalario;
global.virarMesTudo = virarMesTudo;
global.virarAnoSalario = virarAnoSalario;
global.virarAnoTudo = virarAnoTudo;
global.limparCoresSheet = limparCoresSheet;
global.reordenarNomes = reordenarNomes;
global.limparDadosSheet = limparDadosSheet;
global.bloquearAlteracoes = bloquearAlteracoes;
