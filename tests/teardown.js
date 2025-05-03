/**
 * Arquivo de teardown global para o Jest
 * 
 * Este arquivo é executado após todos os testes para garantir que recursos
 * sejam liberados corretamente, evitando vazamentos de memória e processos.
 */

// Função de teardown global do Jest
module.exports = async () => {
  try {
    // Garantir que não há listeners de eventos pendentes
    if (process && typeof process.removeAllListeners === 'function') {
      process.removeAllListeners();
    }
    
    // Fechar qualquer conexão pendente
    if (global.gc) {
      global.gc();
    }
    
    // Log para indicar que o teardown foi executado
    console.log('Teardown global executado com sucesso');
    
    // Pequena pausa para garantir que todos os recursos sejam liberados
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Erro durante o teardown global:', error);
  }
};
