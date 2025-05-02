//@ts-nocheck
/**
 * Testes para o módulo clasp-helper
 */

import { jest } from '@jest/globals';

// Mocks
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

// Mock para o logger relativo ao clasp-helper.js
jest.mock('../../scripts/build-system/logger.js', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    success: jest.fn(),
    highlight: jest.fn(),
    important: jest.fn(),
    configure: jest.fn(),
  },
  LOG_LEVELS: {
    VERBOSE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    NONE: 5,
  },
}));

// Importações
import { execSync } from 'child_process';
import logger from '../../scripts/build-system/logger.js';

// Importar o módulo a ser testado
import * as claspHelper from '../../scripts/build-system/clasp-helper.js';

describe('Clasp Helper', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('pushProject', () => {
    it('deve executar clasp push com sucesso e retornar true', () => {
      // Configurar mock para simular execução bem-sucedida
      (execSync as jest.Mock).mockImplementation(() => {});

      // Chamar a função
      const projectDir = '/caminho/para/projeto';
      const result = claspHelper.pushProject(projectDir);

      // Verificar o resultado
      expect(result).toBe(true);

      // Verificar se execSync foi chamado corretamente
      expect(execSync).toHaveBeenCalledWith(
        'clasp push',
        { cwd: projectDir, stdio: 'inherit' }
      );

      // Verificar se logger.info foi chamado
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining(projectDir));
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Push concluído'));
    });

    it('deve lidar com erros e retornar false', () => {
      // Configurar mock para simular erro
      const errorMessage = 'Erro ao executar clasp push';
      (execSync as jest.Mock).mockImplementation(() => {
        throw new Error(errorMessage);
      });

      // Chamar a função
      const projectDir = '/caminho/para/projeto';
      const result = claspHelper.pushProject(projectDir);

      // Verificar o resultado
      expect(result).toBe(false);

      // Verificar se execSync foi chamado
      expect(execSync).toHaveBeenCalledWith(
        'clasp push',
        { cwd: projectDir, stdio: 'inherit' }
      );

      // Verificar se logger.error foi chamado
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(errorMessage),
        expect.any(Error)
      );
    });
  });
});
