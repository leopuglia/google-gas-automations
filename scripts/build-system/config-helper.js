/**
 * Módulo para carregamento e manipulação de configurações YAML
 *
 * Este módulo fornece funções para carregar e manipular configurações
 * a partir de arquivos YAML, usado tanto pelo deploy.js quanto pelo rollup.config.js
 *
 * Inclui validação de configuração usando schema JSON
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import logger from './logger.js';

// Caminho padrão para o arquivo de configuração
const DEFAULT_CONFIG_FILE = 'config.yml';
// Caminho para o schema JSON
const SCHEMA_FILE = path.resolve('./schema/config.schema.json');

// Caminhos padrão para diretórios
const DEFAULT_PATHS = {
  src: path.resolve('./src'),
  build: path.resolve('./build'),
  dist: path.resolve('./dist'),
  templates: path.resolve('./templates'),
  scripts: path.resolve('./scripts'),
};

/**
 * Valida a configuração usando o schema JSON
 * @param {Object} config Configuração a ser validada
 * @param {boolean} verbose Se true, exibe mensagens no console
 * @returns {boolean} True se a configuração é válida, false caso contrário
 */
export function validateConfig(config, verbose = true) {
  try {
    // Verificar se o arquivo de schema existe
    if (!fs.existsSync(SCHEMA_FILE)) {
      logger.warn(`Arquivo de schema não encontrado: ${SCHEMA_FILE}`);
      logger.warn('A validação de configuração será ignorada.');
      return true;
    }

    // Carregar o schema JSON
    const schemaContent = fs.readFileSync(SCHEMA_FILE, 'utf8');
    const schema = JSON.parse(schemaContent);

    // Inicializar o validador
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(schema);

    // Validar a configuração
    const valid = validate(config);

    if (!valid) {
      logger.error('Configuração inválida:');
      validate.errors.forEach((error) => {
        logger.error(`  - ${error.instancePath}: ${error.message}`);
      });
      return false;
    }

    if (verbose) {
      logger.debug('Configuração validada com sucesso.');
    }

    return true;
  } catch (error) {
    logger.error(`Erro ao validar configuração: ${error.message}`);
    logger.warn('A validação de configuração será ignorada.');
    return true; // Continuar mesmo com erro de validação
  }
}

/**
 * Carrega o arquivo de configuração YAML
 * @param {string} configFile Caminho para o arquivo de configuração
 * @param {boolean} verbose Se true, exibe mensagens no console
 * @param {boolean} validate Se true, valida a configuração usando o schema JSON
 * @returns {Object} Configuração carregada
 */
export function loadConfig(configFile = DEFAULT_CONFIG_FILE, verbose = true, validate = true) {
  try {
    const configPath = path.resolve(configFile);
    if (verbose) {
      logger.info(`Carregando configuração de: ${configFile}`);
    }

    // Verificar se o arquivo existe
    if (!fs.existsSync(configPath)) {
      throw new Error(`Arquivo de configuração não encontrado: ${configPath}`);
    }

    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents);

    if (!config) {
      throw new Error(`Arquivo de configuração vazio ou inválido: ${configPath}`);
    }

    logger.verbose(`Configuração carregada: ${JSON.stringify(config, null, 2)}`);

    // Validar a configuração se solicitado
    if (validate) {
      const isValid = validateConfig(config, verbose);
      if (!isValid) {
        throw new Error('A configuração não passou na validação de schema.');
      }
    }

    return config;
  } catch (error) {
    logger.error(`Erro ao carregar configuração: ${error.message}`);
    throw error;
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
    scripts: configPaths.scripts ? path.resolve(configPaths.scripts) : DEFAULT_PATHS.scripts,
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
