/**
 * Script de demonstração para o sistema de logs
 *
 * Este script demonstra as diferentes opções de cores e formatação
 * disponíveis no sistema de logs.
 */

import logger from '../logger.js';

// Configurar o logger para mostrar todos os níveis
logger.configure({ level: logger.levels.VERBOSE });

console.log('\n=== DEMONSTRAÇÃO DO SISTEMA DE LOGS ===\n');

// Demonstrar os níveis padrão
console.log('\n--- Níveis padrão ---');
logger.verbose('Mensagem de nível VERBOSE');
logger.debug('Mensagem de nível DEBUG');
logger.info('Mensagem de nível INFO');
logger.warn('Mensagem de nível WARN');
logger.error('Mensagem de nível ERROR');

// Demonstrar os métodos especiais
console.log('\n--- Métodos especiais ---');
logger.success('Mensagem de SUCESSO');
logger.highlight('Mensagem DESTACADA');
logger.important('Mensagem IMPORTANTE');

// Demonstrar cores personalizadas
console.log('\n--- Cores personalizadas ---');
logger.info('Mensagem INFO com cor personalizada: branco', { color: 'white' });
logger.info('Mensagem INFO com cor personalizada: vermelho', { color: 'red' });
logger.info('Mensagem INFO com cor personalizada: azul', { color: 'blue' });
logger.info('Mensagem INFO com cor personalizada: amarelo', { color: 'yellow' });
logger.info('Mensagem INFO com cor personalizada: ciano', { color: 'cyan' });
logger.info('Mensagem INFO com cor personalizada: magenta', { color: 'magenta' });
logger.info('Mensagem INFO com cor personalizada: cinza', { color: 'gray' });

// Demonstrar formatação em negrito
console.log('\n--- Formatação em negrito ---');
logger.info('Mensagem INFO normal');
logger.info('Mensagem INFO em negrito', { bold: true });
logger.success('Mensagem SUCCESS em negrito', { bold: true });
logger.highlight('Mensagem HIGHLIGHT em negrito', { bold: true });

// Demonstrar combinação de opções
console.log('\n--- Combinação de opções ---');
logger.info('Mensagem INFO em vermelho e negrito', { color: 'red', bold: true });
logger.debug('Mensagem DEBUG em amarelo e negrito', { color: 'yellow', bold: true });

// Demonstrar configuração personalizada de cores
console.log('\n--- Configuração personalizada de cores ---');
logger.configure({
  colors: {
    INFO: 'blueBright',
    DEBUG: 'magentaBright',
  },
});
logger.info('Mensagem INFO com cor configurada para azul brilhante');
logger.debug('Mensagem DEBUG com cor configurada para magenta brilhante');

// Restaurar configuração padrão
logger.configure({ colors: undefined });

console.log('\n=== FIM DA DEMONSTRAÇÃO ===\n');
