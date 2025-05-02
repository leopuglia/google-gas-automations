/**
 * Sistema de logs para scripts de build e deploy
 *
 * Este módulo fornece funções para exibir logs categorizados por nível
 * (verbose, debug, info, warn, error) e permite controlar quais níveis
 * são exibidos através de variáveis de ambiente ou configuração.
 *
 * Também suporta personalização de cores para mensagens específicas.
 */

import chalk from 'chalk';

// Níveis de log disponíveis
export const LOG_LEVELS = {
  VERBOSE: 0, // Logs detalhados para depuração profunda
  DEBUG: 1,   // Informações úteis para depuração
  INFO: 2,    // Informações gerais sobre o processo
  WARN: 3,    // Avisos que não interrompem o processo
  ERROR: 4,   // Erros que podem interromper o processo
  NONE: 5,     // Nenhum log (silencioso)
};

// Cores padrão para cada nível
const DEFAULT_COLORS = {
  VERBOSE: 'gray',
  DEBUG: 'blue',
  // DEBUG: 'cyan',
  // INFO: 'green',
  INFO: 'cyan',
  WARN: 'yellow',
  ERROR: 'red',
  // SUCCESS: 'greenBright',
  SUCCESS: 'green',
  // HIGHLIGHT: 'cyan',
  HIGHLIGHT: 'yellow',
  IMPORTANT: 'magenta',
  // IMPORTANT: 'cyan'
};

// Configuração padrão
const DEFAULT_CONFIG = {
  level: LOG_LEVELS.INFO, // Nível padrão: INFO
  useColors: true,        // Usar cores nos logs
  showTimestamp: true,    // Mostrar timestamp nos logs
  showLevel: true,        // Mostrar nível nos logs
  colors: { ...DEFAULT_COLORS }, // Cores personalizadas
};

// Configuração atual
let config = { ...DEFAULT_CONFIG };

/**
 * Configura o logger
 * @param {Object} options Opções de configuração
 * @param {number} options.level Nível mínimo de log a ser exibido
 * @param {boolean} options.useColors Usar cores nos logs
 * @param {boolean} options.showTimestamp Mostrar timestamp nos logs
 * @param {boolean} options.showLevel Mostrar nível nos logs
 * @param {Object} options.colors Cores personalizadas para cada nível
 */
export function configure(options = {}) {
  // Se houver cores personalizadas, mesclar com as cores padrão
  if (options.colors) {
    options.colors = { ...config.colors, ...options.colors };
  }

  config = { ...config, ...options };

  // Verificar se há variáveis de ambiente que sobrescrevem a configuração
  if (process.env.LOG_LEVEL) {
    const envLevel = process.env.LOG_LEVEL.toUpperCase();
    if (LOG_LEVELS[envLevel] !== undefined) {
      config.level = LOG_LEVELS[envLevel];
    }
  }

  if (process.env.LOG_COLORS === 'false') {
    config.useColors = false;
  }

  if (process.env.LOG_TIMESTAMP === 'false') {
    config.showTimestamp = false;
  }

  if (process.env.LOG_SHOW_LEVEL === 'false') {
    config.showLevel = false;
  }
}

/**
 * Formata uma mensagem de log
 * @param {string} level Nível do log
 * @param {string} message Mensagem a ser logada
 * @returns {string} Mensagem formatada
 */
export function formatMessage(level, message) {
  const parts = [];

  // Adicionar timestamp
  if (config.showTimestamp) {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    parts.push(`[${timestamp}]`);
  }

  // Adicionar nível
  if (config.showLevel) {
    parts.push(`[${level}]`);
  }

  // Adicionar mensagem
  parts.push(message);

  return parts.join(' ');
}

/**
 * Loga uma mensagem se o nível for maior ou igual ao configurado
 * @param {number} level Nível do log
 * @param {string} levelName Nome do nível
 * @param {string} message Mensagem a ser logada
 * @param {Object} options Opções adicionais
 * @param {string} options.color Cor personalizada para esta mensagem específica
 * @param {Error} options.error Objeto de erro para exibir stack trace
 * @param {boolean} options.bold Exibir mensagem em negrito
 */
export function log(level, levelName, message, options = {}) {
  if (level < config.level) {
    return; // Ignorar logs abaixo do nível configurado
  }

  let formattedMessage = formatMessage(levelName, message);

  // Aplicar cores se configurado
  if (config.useColors) {
    // Se uma cor personalizada foi especificada para esta mensagem
    if (options.color) {
      if (typeof chalk[options.color] === 'function') {
        formattedMessage = chalk[options.color](formattedMessage);
      }
    } else {
      // Usar a cor configurada para o nível
      const colorName = config.colors[levelName] || DEFAULT_COLORS[levelName];
      if (colorName && typeof chalk[colorName] === 'function') {
        formattedMessage = chalk[colorName](formattedMessage);
      }
    }

    // Aplicar negrito se solicitado
    if (options.bold && formattedMessage) {
      formattedMessage = chalk.bold(formattedMessage);
    }
  }

  // Determinar o método de console a ser usado
  let consoleMethod = 'log';
  if (level === LOG_LEVELS.WARN) {
    consoleMethod = 'warn';
  } else if (level === LOG_LEVELS.ERROR) {
    consoleMethod = 'error';
  }

  // Exibir a mensagem
  console[consoleMethod](formattedMessage);

  // Se for um erro e tiver um objeto de erro, exibir o stack trace
  if (level === LOG_LEVELS.ERROR && options.error) {
    console.error(options.error.stack || options.error);
  }
}

/**
 * Loga uma mensagem de nível VERBOSE
 * @param {string} message Mensagem a ser logada
 * @param {Object} options Opções adicionais
 * @param {string} options.color Cor personalizada para esta mensagem
 * @param {boolean} options.bold Exibir mensagem em negrito
 */
export function verbose(message, options = {}) {
  log(LOG_LEVELS.VERBOSE, 'VERBOSE', message, options);
}

/**
 * Loga uma mensagem de nível DEBUG
 * @param {string} message Mensagem a ser logada
 * @param {Object} options Opções adicionais
 * @param {string} options.color Cor personalizada para esta mensagem
 * @param {boolean} options.bold Exibir mensagem em negrito
 */
export function debug(message, options = {}) {
  log(LOG_LEVELS.DEBUG, 'DEBUG', message, options);
}

/**
 * Loga uma mensagem de nível INFO
 * @param {string} message Mensagem a ser logada
 * @param {Object} options Opções adicionais
 * @param {string} options.color Cor personalizada para esta mensagem
 * @param {boolean} options.bold Exibir mensagem em negrito
 */
export function info(message, options = {}) {
  log(LOG_LEVELS.INFO, 'INFO', message, options);
}

/**
 * Loga uma mensagem de nível WARN
 * @param {string} message Mensagem a ser logada
 * @param {Object} options Opções adicionais
 * @param {string} options.color Cor personalizada para esta mensagem
 * @param {boolean} options.bold Exibir mensagem em negrito
 */
export function warn(message, options = {}) {
  log(LOG_LEVELS.WARN, 'WARN', message, options);
}

/**
 * Loga uma mensagem de nível ERROR
 * @param {string} message Mensagem a ser logada
 * @param {Error} error Objeto de erro opcional
 * @param {Object} options Opções adicionais
 * @param {string} options.color Cor personalizada para esta mensagem
 * @param {boolean} options.bold Exibir mensagem em negrito
 */
export function error(message, error = null, options = {}) {
  log(LOG_LEVELS.ERROR, 'ERROR', message, { ...options, error });
}

// Configurar o logger com as opções padrão
configure();

/**
 * Loga uma mensagem de sucesso (nível INFO com cor verde brilhante)
 * @param {string} message Mensagem a ser logada
 * @param {Object} options Opções adicionais
 */
export function success(message, options = {}) {
  log(LOG_LEVELS.INFO, 'SUCCESS', message, { ...options, color: DEFAULT_COLORS.SUCCESS });
}

/**
 * Loga uma mensagem destacada (nível INFO com cor ciano)
 * @param {string} message Mensagem a ser logada
 * @param {Object} options Opções adicionais
 */
export function highlight(message, options = {}) {
  log(LOG_LEVELS.INFO, 'HIGHLIGHT', message, { ...options, color: DEFAULT_COLORS.HIGHLIGHT });
}

/**
 * Loga uma mensagem importante (nível INFO com cor magenta)
 * @param {string} message Mensagem a ser logada
 * @param {Object} options Opções adicionais
 */
export function important(message, options = {}) {
  log(LOG_LEVELS.INFO, 'IMPORTANT', message, { ...options, color: DEFAULT_COLORS.IMPORTANT, bold: true });
}

// Exportar um objeto logger para uso simplificado
export default {
  configure,
  verbose,
  debug,
  info,
  warn,
  error,
  success,
  highlight,
  important,
  levels: LOG_LEVELS,
};
