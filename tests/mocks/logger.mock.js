/**
 * Mock para o módulo logger
 * 
 * Este mock simula as funções do logger para testes
 */

// Função que não faz nada
const noop = () => {};

// Exportar funções de logger mockadas
const logger = {
  error: jest.fn(noop),
  warn: jest.fn(noop),
  info: jest.fn(noop),
  verbose: jest.fn(noop),
  debug: jest.fn(noop),
  silly: jest.fn(noop)
};

export default logger;
