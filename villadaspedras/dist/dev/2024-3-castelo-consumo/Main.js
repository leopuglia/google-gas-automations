'use strict';

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
const ABA_MES_CORRENTE_NAME$1 = 'MES CORRENTE';
const ABA_MODELO_NAME$1 = 'MODELO';

/**
 * MACROS DA PLANILHA DE CONSUMO
 *
 * Autor: Leonardo Puglia
 *
 * Inclui macros para virada de mês das planilhas de consumo, além de outras macros úteis
 *
 * OBS:
 *   Preciso modificar e conferir as rotinas de virada de ano!!!
 *   Futuramente mover as subrotinas para a biblioteca VilladasPedrasLib
 *   Refatorar o código desse script pra diminuir a redundância
 */
/**********************************
 *
 * DEFINIÇÕES GLOBAIS
 *
 ***********************************/
// Constantes Globais
const ABA_MES_CORRENTE_NAME = ABA_MES_CORRENTE_NAME$1;
const ABA_MODELO_NAME = ABA_MODELO_NAME$1;
// Variáveis Globais Dinâmicas
const addGetter_ = (name, value, obj = globalThis) => {
    Object.defineProperty(obj, name, {
        enumerable: true,
        configurable: true,
        get() {
            delete this[name];
            return (this[name] = value());
        },
    });
    return obj;
};
// Define getters para objetos globais
[
    ['ss', () => SpreadsheetApp.getActive()],
    ['ui', () => SpreadsheetApp.getUi()],
    ['MesCorrenteSheet', () => globalThis.ss.getSheetByName(ABA_MES_CORRENTE_NAME)],
    ['ModeloSheet', () => globalThis.ss.getSheetByName(ABA_MODELO_NAME)],
].forEach(([n, v]) => addGetter_(n, v));
// Expondo as funções globalmente para o GAS
// Necessário para o Google Apps Script conseguir acessar as funções
// global.VIRAR_MES_CONSUMO = VIRAR_MES_CONSUMO;
// global.VIRAR_ANO_CONSUMO = VIRAR_ANO_CONSUMO;
