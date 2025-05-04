#!/usr/bin/env node

/**
 * Script para executar testes de forma controlada e segura
 * Evita problemas de sobrecarga do sistema ao executar todos os testes de uma vez
 * Usa uma abordagem sequencial com melhor tratamento de erros
 */

import { spawn } from 'child_process';
import { readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import chalk from 'chalk';

// Diretório de testes
const testsDir = resolve(process.cwd(), 'tests');
const buildSystemDir = join(testsDir, 'build-system');

// Configurações
const TIMEOUT_MS = 30000; // 30 segundos de timeout por teste
const PAUSE_BETWEEN_TESTS_MS = 2000; // 2 segundos de pausa entre testes

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
      ...options,
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
        error: `Timeout excedido (${TIMEOUT_MS / 1000}s)`,
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
        code: code,
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
        error: error.message,
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
      readdirSync(testsDir).forEach((file) => {
        if ((file.endsWith('.test.ts') || file.endsWith('.test.js')) && file !== 'teardown.js') {
          testFiles.push(join(testsDir, file));
        }
      });
    }

    // Arquivos no diretório build-system
    const buildSystemPath = join(testsDir, 'build-system');
    if (existsSync(buildSystemPath)) {
      readdirSync(buildSystemPath).forEach((file) => {
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
 * Função principal
 */
async function main() {
  console.log(chalk.blue('\n=== Executando testes de forma controlada e segura ===\n'));

  const testFiles = getTestFiles();
  if (testFiles.length === 0) {
    console.log(chalk.yellow('Nenhum arquivo de teste encontrado!'));
    return;
  }

  console.log(chalk.yellow(`Encontrados ${testFiles.length} arquivos de teste`));
  console.log(chalk.yellow(`Timeout por teste: ${TIMEOUT_MS / 1000} segundos`));
  console.log(chalk.yellow(`Pausa entre testes: ${PAUSE_BETWEEN_TESTS_MS / 1000} segundos\n`));

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  // Executar cada teste individualmente
  for (let i = 0; i < testFiles.length; i++) {
    const testFile = testFiles[i];
    console.log(chalk.cyan(`\n[${i + 1}/${testFiles.length}] Executando teste: ${testFile}`));

    // Executar o teste com Jest
    const result = await runCommandSafe('pnpm', [
      'jest',
      testFile,
      '--no-cache',
      '--forceExit',
      '--detectOpenHandles',
      '--runInBand',
      '--testTimeout=20000',
    ]);

    if (result.success) {
      successCount++;
      console.log(chalk.green(`\n✓ Teste concluído com sucesso: ${testFile}`));
    } else {
      failCount++;
      console.log(chalk.red(`\n✗ Teste falhou: ${testFile}`));
    }

    // Limpar memória e processos
    if (global.gc) {
      global.gc();
    }

    // Pequena pausa entre os testes para garantir que os recursos sejam liberados
    if (i < testFiles.length - 1) {
      console.log(
        chalk.gray(
          `\nAguardando ${PAUSE_BETWEEN_TESTS_MS / 1000} segundos antes do próximo teste...`,
        ),
      );
      await new Promise((resolve) => setTimeout(resolve, PAUSE_BETWEEN_TESTS_MS));
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
main().catch((error) => {
  console.error(chalk.red('\nErro ao executar os testes:'));
  console.error(chalk.red(error.message));
  process.exit(1);
});
