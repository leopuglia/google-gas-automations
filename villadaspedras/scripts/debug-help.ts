/**
 * Script de ajuda para depuração do projeto
 * 
 * Autor: Leonardo Puglia
 * Versão: 1.0.0 | Data: 02/04/2025
 * 
 * Descrição: Este script fornece instruções sobre como depurar o projeto
 */

// Função para exibir instruções de depuração
function showDebugInstructions(): void {
  console.log('\n=== INSTRUÇÕES PARA DEPURAÇÃO DO PROJETO ===\n');
  
  console.log('Este projeto oferece várias opções para depuração do código:');
  
  console.log('\n1. DEPURAÇÃO LOCAL COM LOGS:');
  console.log('   - Adicione declarações console.log() em pontos estratégicos do seu código TypeScript');
  console.log('   - Execute o script de execução remota para ver os logs no terminal');
  console.log('   - Exemplo: pnpm run execute:salario');
  
  console.log('\n2. DEPURAÇÃO NO EDITOR DO GOOGLE APPS SCRIPT:');
  console.log('   - Use os scripts de debug para enviar o código para o Google Apps Script');
  console.log('   - Exemplo: pnpm run debug:salario');
  console.log('   - Acesse o editor do Google Apps Script no navegador');
  console.log('   - Adicione breakpoints clicando na margem esquerda do editor');
  console.log('   - Execute a função desejada no menu suspenso');
  
  console.log('\n3. EXECUÇÃO REMOTA COM LOGS:');
  console.log('   - Use os scripts de execução remota para executar funções e ver logs');
  console.log('   - Exemplo: pnpm run execute:salario');
  console.log('   - Selecione a função que deseja executar');
  console.log('   - Escolha se deseja ver os logs após a execução');
  
  console.log('\n4. DICAS PARA DEPURAÇÃO EFICIENTE:');
  console.log('   - Use console.log() para valores importantes: console.log("Valor:", valor)');
  console.log('   - Registre o início e fim de funções: console.log("Iniciando função xyz")');
  console.log('   - Para objetos complexos, use JSON.stringify(): console.log(JSON.stringify(obj, null, 2))');
  console.log('   - Adicione try/catch em blocos críticos e registre erros: console.error("Erro:", e)');
  
  console.log('\n5. COMANDOS DISPONÍVEIS:');
  console.log('   - Debug (envia código para o GAS):');
  console.log('     * pnpm run debug:salario');
  console.log('     * pnpm run debug:consumo:cafeteria');
  console.log('     * pnpm run debug:consumo:saara');
  console.log('     * pnpm run debug:consumo:castelo');
  console.log('     * pnpm run debug:consumo:stones');
  console.log('   - Execução remota (envia, executa e mostra logs):');
  console.log('     * pnpm run execute:salario');
  console.log('     * pnpm run execute:consumo:cafeteria');
  console.log('     * pnpm run execute:consumo:saara');
  console.log('     * pnpm run execute:consumo:castelo');
  console.log('     * pnpm run execute:consumo:stones');
  
  console.log('\nLembre-se: O Google Apps Script executa o código JavaScript compilado, não o TypeScript original.');
  console.log('Para uma depuração mais eficiente, mantenha o código modular e bem documentado.\n');
}

// Executa a função principal
showDebugInstructions();
