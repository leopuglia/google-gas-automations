#!/usr/bin/env node

/**
 * Script para executar testes com paralelismo controlado
 * Executa testes em pequenos grupos paralelos para melhorar o desempenho
 * mantendo a estabilidade do sistema
 */

import { spawn } from 'child_process';
import { readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import chalk from 'chalk';
import os from 'os';

// Diretório de testes
const testsDir = resolve(process.cwd(), 'tests');
const buildSystemDir = join(testsDir, 'build-system');

// Configurações
const TIMEOUT_MS = 30000; // 30 segundos de timeout por teste
const PAUSE_BETWEEN_BATCHES_MS = 2000; // 2 segundos de pausa entre lotes
const MAX_PARALLEL_TESTS = Math.max(1, Math.min(os.cpus().length - 1, 3)); // Máximo de testes paralelos (CPUs - 1, máximo 3)

console.log(chalk.blue(`Configurado para executar até ${MAX_PARALLEL_TESTS} testes em paralelo`));

/**
 * Função para executar um comando de forma segura usando spawn
 * @param {string} command - Comando a ser executado
 * @param {string[]} args - Argumentos do comando
 * @param {Object} options - Opções adicionais
 * @returns {Promise<{success: boolean, output: string}>} - Resultado da execução
 */
function runCommandSafe(command, args, options = {}) {
  return new Promise((resolve) => {
    console.log(chalk.blue(`Executando: ${command} ${args.join(' ')}`));
    
    // Iniciar o processo
    const childProcess = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options
    });
    
    let output = '';
    let errorOutput = '';
    let hasTimedOut = false;
    
    // Coletar saída padrão
    childProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      process.stdout.write(chunk);
    });
    
    // Coletar saída de erro
    childProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      process.stderr.write(chunk);
    });
    
    // Configurar timeout
    const timeoutId = setTimeout(() => {
      hasTimedOut = true;
      console.error(chalk.red(`\nTIMEOUT: Teste excedeu ${TIMEOUT_MS / 1000} segundos`));
      
      // Tentar encerrar o processo de forma limpa
      childProcess.kill('SIGTERM');
      
      // Forçar encerramento após 2 segundos se não terminar
      setTimeout(() => {
        if (!childProcess.killed) {
          childProcess.kill('SIGKILL');
        }
      }, 2000);
      
      resolve({
        success: false,
        output: output,
        error: `Timeout excedido (${TIMEOUT_MS / 1000}s)`
      });
    }, TIMEOUT_MS);
    
    // Quando o processo terminar
    childProcess.on('close', (code) => {
      clearTimeout(timeoutId);
      
      if (hasTimedOut) return; // Já resolvido pelo timeout
      
      resolve({
        success: code === 0,
        output: output,
        error: errorOutput,
        code: code
      });
    });
    
    // Tratar erros do processo
    childProcess.on('error', (error) => {
      clearTimeout(timeoutId);
      
      if (hasTimedOut) return; // Já resolvido pelo timeout
      
      console.error(chalk.red(`\nERRO: ${error.message}`));
      resolve({
        success: false,
        output: output,
        error: error.message
      });
    });
  });
}

/**
 * Função para obter todos os arquivos de teste
 * @returns {string[]} - Lista de caminhos para os arquivos de teste
 */
function getTestFiles() {
  const testFiles = [];
  
  try {
    // Arquivos na raiz do diretório de testes
    if (existsSync(testsDir)) {
      readdirSync(testsDir).forEach(file => {
        if ((file.endsWith('.test.ts') || file.endsWith('.test.js')) && file !== 'teardown.js') {
          testFiles.push(join(testsDir, file));
        }
      });
    }
    
    // Arquivos no diretório build-system
    const buildSystemPath = join(testsDir, 'build-system');
    if (existsSync(buildSystemPath)) {
      readdirSync(buildSystemPath).forEach(file => {
        if (file.endsWith('.test.ts') || file.endsWith('.test.js')) {
          testFiles.push(join(buildSystemPath, file));
        }
      });
    }
  } catch (error) {
    console.error(chalk.red(`Erro ao buscar arquivos de teste: ${error.message}`));
  }
  
  return testFiles;
}

/**
 * Divide um array em lotes de tamanho específico
 * @param {Array} array - Array a ser dividido
 * @param {number} batchSize - Tamanho de cada lote
 * @returns {Array<Array>} - Array de lotes
 */
function batchArray(array, batchSize) {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Função principal
 */
async function main() {
  console.log(chalk.blue('\n=== Executando testes com paralelismo controlado ===\n'));
  
  const testFiles = getTestFiles();
  if (testFiles.length === 0) {
    console.log(chalk.yellow('Nenhum arquivo de teste encontrado!'));
    return;
  }
  
  console.log(chalk.yellow(`Encontrados ${testFiles.length} arquivos de teste`));
  console.log(chalk.yellow(`Executando em lotes de até ${MAX_PARALLEL_TESTS} testes em paralelo`));
  console.log(chalk.yellow(`Timeout por teste: ${TIMEOUT_MS / 1000} segundos`));
  console.log(chalk.yellow(`Pausa entre lotes: ${PAUSE_BETWEEN_BATCHES_MS / 1000} segundos\n`));
  
  // Dividir os testes em lotes
  const batches = batchArray(testFiles, MAX_PARALLEL_TESTS);
  
  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;
  
  // Executar cada lote de testes
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(chalk.cyan(`\n=== Executando lote ${batchIndex + 1}/${batches.length} (${batch.length} testes) ===\n`));
    
    // Executar todos os testes do lote em paralelo
    const promises = batch.map(async (testFile, index) => {
      console.log(chalk.cyan(`[Lote ${batchIndex + 1}, Teste ${index + 1}/${batch.length}] Executando: ${testFile}`));
      
      // Executar o teste com Jest
      const result = await runCommandSafe('pnpm', [
        'jest',
        testFile,
        '--no-cache',
        '--forceExit',
        '--detectOpenHandles',
        '--testTimeout=20000'
      ]);
      
      if (result.success) {
        successCount++;
        console.log(chalk.green(`\n✓ Teste concluído com sucesso: ${testFile}`));
      } else {
        failCount++;
        console.log(chalk.red(`\n✗ Teste falhou: ${testFile}`));
      }
      
      return result;
    });
    
    // Aguardar todos os testes do lote terminarem
    await Promise.all(promises);
    
    // Limpar memória
    if (global.gc) {
      global.gc();
    }
    
    // Pausa entre lotes
    if (batchIndex < batches.length - 1) {
      console.log(chalk.gray(`\nAguardando ${PAUSE_BETWEEN_BATCHES_MS / 1000} segundos antes do próximo lote...\n`));
      await new Promise(resolve => setTimeout(resolve, PAUSE_BETWEEN_BATCHES_MS));
    }
  }
  
  // Resumo final
  console.log(chalk.blue('\n=== Resumo dos testes ==='));
  console.log(chalk.green(`✓ Testes bem-sucedidos: ${successCount}`));
  console.log(chalk.red(`✗ Testes com falha: ${failCount}`));
  if (skippedCount > 0) {
    console.log(chalk.yellow(`✓ Testes ignorados: ${skippedCount}`));
  }
  console.log(chalk.blue(`Total de testes: ${testFiles.length}`));
  
  // Retornar código de saída adequado
  process.exit(failCount > 0 ? 1 : 0);
}

// Executar o script
main().catch(error => {
  console.error(chalk.red('\nErro ao executar os testes:'));
  console.error(chalk.red(error.message));
  process.exit(1);
});
