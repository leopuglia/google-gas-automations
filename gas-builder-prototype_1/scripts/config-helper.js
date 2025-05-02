/**
 * Módulo para carregamento e manipulação de configurações YAML
 * 
 * Este módulo fornece funções para carregar e manipular configurações
 * a partir de arquivos YAML, usado tanto pelo deploy.js quanto pelo rollup.config.js
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import logger from './logger.js';

// Caminho padrão para o arquivo de configuração
const DEFAULT_CONFIG_FILE = 'config.yml';

// Caminhos padrão para diretórios
const DEFAULT_PATHS = {
  src: path.resolve('./src'),
  build: path.resolve('./build'),
  dist: path.resolve('./dist'),
  templates: path.resolve('./templates'),
  scripts: path.resolve('./scripts')
};

/**
 * Carrega o arquivo de configuração YAML
 * @param {string} configFile Caminho para o arquivo de configuração
 * @param {boolean} verbose Se true, exibe mensagens no console
 * @returns {Object} Configuração carregada
 */
export function loadConfig(configFile = DEFAULT_CONFIG_FILE, verbose = true) {
  try {
    const configPath = path.resolve(configFile);
    if (verbose) {
      logger.info(`Carregando configuração de: ${configFile}`);
    }
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents);

    // logger.verbose(`Configuração carregada: ${JSON.stringify(config)}`);
    logger.verbose(`Configuração carregada: ${JSON.stringify(config, null, 2)}`);

    return config;
  } catch (error) {
    logger.error(`Erro ao carregar configuração: ${error.message}`, error);
    process.exit(1);
  }
}

/**
 * Inicializa os caminhos a partir da configuração
 * @param {Object} config Configuração carregada
 * @param {boolean} verbose Se true, exibe mensagens no console
 * @returns {Object} Objeto com os caminhos inicializados
 */
export function initializePaths(config, verbose = true) {
  // Obter os caminhos da configuração ou usar os valores padrão
  const configPaths = config.defaults && config.defaults.paths || {};
  
  // Inicializar cada caminho, usando o valor da configuração ou o valor padrão
  const paths = {
    src: configPaths.src ? path.resolve(configPaths.src) : DEFAULT_PATHS.src,
    build: configPaths.build ? path.resolve(configPaths.build) : DEFAULT_PATHS.build,
    dist: configPaths.dist ? path.resolve(configPaths.dist) : DEFAULT_PATHS.dist,
    templates: configPaths.templates ? path.resolve(configPaths.templates) : DEFAULT_PATHS.templates,
    scripts: configPaths.scripts ? path.resolve(configPaths.scripts) : DEFAULT_PATHS.scripts
  };
  
  if (verbose) {
    logger.info('Inicializando caminhos de diretórios...');
    logger.debug(` - SRC_DIR: ${paths.src}`);
    logger.debug(` - BUILD_DIR: ${paths.build}`);
    logger.debug(` - DIST_DIR: ${paths.dist}`);
    logger.debug(` - TEMPLATES_DIR: ${paths.templates}`);
    logger.debug(` - SCRIPTS_DIR: ${paths.scripts}`);
  }
  
  return paths;
}

/**
 * Carrega a configuração e inicializa os caminhos
 * @param {string} configFile Caminho para o arquivo de configuração
 * @param {boolean} verbose Se true, exibe mensagens no console
 * @returns {Object} Objeto com a configuração e os caminhos
 */
export function loadConfigAndInitializePaths(configFile = DEFAULT_CONFIG_FILE, verbose = true) {
  const config = loadConfig(configFile, verbose);
  const paths = initializePaths(config, verbose);
  return { config, paths };
}
