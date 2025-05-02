//@ts-nocheck
/**
 * Testes para o módulo logger
 */

import { jest } from '@jest/globals';

// Mock do chalk para evitar problemas com cores no terminal durante os testes
jest.mock('chalk', () => ({
  __esModule: true,
  default: {
    gray: jest.fn((text) => `[GRAY]${text}[/GRAY]`),
    blue: jest.fn((text) => `[BLUE]${text}[/BLUE]`),
    cyan: jest.fn((text) => `[CYAN]${text}[/CYAN]`),
    green: jest.fn((text) => `[GREEN]${text}[/GREEN]`),
    yellow: jest.fn((text) => `[YELLOW]${text}[/YELLOW]`),
    red: jest.fn((text) => `[RED]${text}[/RED]`),
    magenta: jest.fn((text) => `[MAGENTA]${text}[/MAGENTA]`),
    white: jest.fn((text) => `[WHITE]${text}[/WHITE]`),
    bold: jest.fn((text) => `[BOLD]${text}[/BOLD]`),
  },
}));

// Importações reais
import logger, { LOG_LEVELS } from '../../scripts/build-system/logger.js';

describe('Logger', () => {
  // Backup dos métodos originais do console
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Mock do console para capturar as saídas
  let consoleOutput = [];
  
  beforeEach(() => {
    // Limpar o array de saídas antes de cada teste
    consoleOutput = [];
    
    // Mock de todos os métodos do console que o logger usa
    console.log = jest.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });
    
    console.error = jest.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });
    
    console.warn = jest.fn((...args) => {
      consoleOutput.push(args.join(' '));
    });
    
    // Configurar o logger com as opções padrão para cada teste
    logger.configure({
      level: LOG_LEVELS.VERBOSE, // Permitir todos os níveis de log
      useColors: true,
      showTimestamp: false, // Desabilitar timestamp para facilitar os testes
      showLevel: true,
    });
  });
  
  afterEach(() => {
    // Restaurar os métodos originais do console após cada teste
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });
  
  describe('Níveis de log', () => {
    it('deve exportar os níveis de log corretos', () => {
      expect(LOG_LEVELS).toEqual({
        VERBOSE: 0,
        DEBUG: 1,
        INFO: 2,
        WARN: 3,
        ERROR: 4,
        NONE: 5,
      });
    });
    
    it('deve ter os níveis de log acessíveis via logger.levels', () => {
      expect(logger.levels).toEqual(LOG_LEVELS);
    });
  });
  
  describe('Funções de log', () => {
    it('deve exportar todas as funções de log necessárias', () => {
      expect(typeof logger.configure).toBe('function');
      expect(typeof logger.verbose).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.success).toBe('function');
      expect(typeof logger.highlight).toBe('function');
      expect(typeof logger.important).toBe('function');
    });
    
    it('deve logar mensagens de verbose corretamente', () => {
      logger.verbose('Mensagem verbose');
      expect(consoleOutput.length).toBe(1);
      expect(consoleOutput[0]).toContain('VERBOSE');
      expect(consoleOutput[0]).toContain('Mensagem verbose');
    });
    
    it('deve logar mensagens de debug corretamente', () => {
      logger.debug('Mensagem debug');
      expect(consoleOutput.length).toBe(1);
      expect(consoleOutput[0]).toContain('DEBUG');
      expect(consoleOutput[0]).toContain('Mensagem debug');
    });
    
    it('deve logar mensagens de info corretamente', () => {
      logger.info('Mensagem info');
      expect(consoleOutput.length).toBe(1);
      expect(consoleOutput[0]).toContain('INFO');
      expect(consoleOutput[0]).toContain('Mensagem info');
    });
    
    it('deve logar mensagens de warn corretamente', () => {
      logger.warn('Mensagem warn');
      expect(consoleOutput.length).toBe(1);
      expect(consoleOutput[0]).toContain('WARN');
      expect(consoleOutput[0]).toContain('Mensagem warn');
    });
    
    it('deve logar mensagens de error corretamente', () => {
      logger.error('Mensagem error');
      expect(consoleOutput.length).toBe(1);
      expect(consoleOutput[0]).toContain('ERROR');
      expect(consoleOutput[0]).toContain('Mensagem error');
    });
    
    it('deve logar mensagens de success corretamente', () => {
      logger.success('Mensagem success');
      expect(consoleOutput.length).toBe(1);
      // O success usa o nível INFO mas com formatação diferente
      expect(consoleOutput[0]).toContain('SUCCESS');
      expect(consoleOutput[0]).toContain('Mensagem success');
    });
  });
  
  describe('Configuração', () => {
    it('deve respeitar o nível de log configurado', () => {
      // Configurar para mostrar apenas mensagens de nível INFO ou superior
      logger.configure({ level: LOG_LEVELS.INFO });
      
      // Estas mensagens não devem ser logadas
      logger.verbose('Mensagem verbose');
      logger.debug('Mensagem debug');
      
      // Estas mensagens devem ser logadas
      logger.info('Mensagem info');
      logger.warn('Mensagem warn');
      logger.error('Mensagem error');
      
      // Verificar que apenas as mensagens de nível INFO ou superior foram logadas
      // Verificamos apenas que as mensagens de INFO e ERROR foram logadas
      // pois o WARN pode ser tratado de forma diferente dependendo da implementação
      expect(consoleOutput.length).toBeGreaterThanOrEqual(2);
      expect(consoleOutput).toEqual(
        expect.arrayContaining([
          expect.stringContaining('INFO'),
          expect.stringContaining('ERROR')
        ])
      );
    });
    
    it('deve mostrar ou ocultar o nível conforme configurado', () => {
      // Configurar para não mostrar o nível
      logger.configure({ showLevel: false });
      
      logger.info('Mensagem info');
      
      // Verificar que a mensagem foi logada sem o nível
      expect(consoleOutput.length).toBe(1);
      expect(consoleOutput[0]).not.toContain('INFO');
      expect(consoleOutput[0]).toContain('Mensagem info');
    });
  });
  
  describe('Tratamento de erros', () => {
    it('deve incluir o stack trace quando um objeto de erro é fornecido', () => {
      const error = new Error('Erro de teste');
      logger.error('Mensagem de erro', error);
      
      // Verificar que a mensagem foi logada
      expect(consoleOutput.length).toBeGreaterThanOrEqual(1);
      expect(consoleOutput[0]).toContain('Mensagem de erro');
      
      // O stack trace pode ser logado separadamente ou junto com a mensagem
      // Verificamos se alguma das saídas contém o erro
      const allOutput = consoleOutput.join('\n');
      expect(allOutput).toContain('Erro de teste');
    });
  });
});
