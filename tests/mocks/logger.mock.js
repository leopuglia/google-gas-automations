/**
 * Mock para o módulo logger
 * 
 * Este mock simula as funções do logger para testes
 * Compatível com módulos ES e importações default
 */

// Função que não faz nada
const noop = () => {};

// Criar objeto logger com todas as funções necessárias
const logger = {
  error: jest.fn(noop),
  warn: jest.fn(noop),
  info: jest.fn(noop),
  verbose: jest.fn(noop),
  debug: jest.fn(noop),
  silly: jest.fn(noop),
  success: jest.fn(noop),
  // Adicionar níveis de log para testes que possam precisar deles
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    silly: 5
  },
  // Método para resetar todas as funções mock
  resetAllMocks: function() {
    Object.keys(this).forEach(key => {
      if (typeof this[key] === 'function' && this[key].mockReset) {
        this[key].mockReset();
      }
    });
  }
};

// Exportar como módulo ES
export default logger;

// Adicionar propriedade __esModule para compatibilidade
Object.defineProperty(logger, '__esModule', { value: true });
