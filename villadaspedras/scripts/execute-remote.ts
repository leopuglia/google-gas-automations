/**
 * Script para executar macros remotamente no Google Apps Script
 * 
 * Autor: Leonardo Puglia
 * Versão: 1.0.0 | Data: 02/04/2025
 * 
 * Descrição: Este script permite executar macros remotamente no Google Apps Script
 * e visualizar os logs de execução.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import * as yaml from 'js-yaml';
import * as readline from 'readline';

// Caminho para o arquivo de configuração
const CONFIG_PATH = path.join(__dirname, '..', 'config.test.yml');
const ORIGINAL_CONFIG_PATH = path.join(__dirname, '..', 'config.yml');
const CLASP_PATH = path.join(__dirname, '..', 'node_modules', '.bin', 'clasp');

// Função para backup do arquivo de configuração original
function backupOriginalConfig(): void {
  if (!fs.existsSync(`${ORIGINAL_CONFIG_PATH}.bak`)) {
    fs.copyFileSync(ORIGINAL_CONFIG_PATH, `${ORIGINAL_CONFIG_PATH}.bak`);
    console.log('Backup do arquivo de configuração original criado.');
  }
}

// Função para restaurar o arquivo de configuração original
function restoreOriginalConfig(): void {
  if (fs.existsSync(`${ORIGINAL_CONFIG_PATH}.bak`)) {
    fs.copyFileSync(`${ORIGINAL_CONFIG_PATH}.bak`, ORIGINAL_CONFIG_PATH);
    console.log('Arquivo de configuração original restaurado.');
  }
}

// Função para usar o arquivo de configuração de teste
function useTestConfig(): void {
  backupOriginalConfig();
  fs.copyFileSync(CONFIG_PATH, ORIGINAL_CONFIG_PATH);
  console.log('Usando arquivo de configuração de teste.');
}

// Função para executar o build e preparar os arquivos
function buildAndPrepare(type: string, target?: string): string {
  console.log('Executando build e preparando arquivos...');
  execSync('pnpm run build', { stdio: 'inherit' });
  
  let buildPath = '';
  
  if (type === 'salario') {
    execSync('pnpm run prepare:salario', { stdio: 'inherit' });
    buildPath = path.join(__dirname, '..', 'build', 'salario-2024');
  } else if (type === 'consumo' && target) {
    execSync(`pnpm run prepare:consumo:${target.toLowerCase()}`, { stdio: 'inherit' });
    buildPath = path.join(__dirname, '..', 'build', `consumo-${target}-Cafeteria`);
  } else {
    throw new Error('Tipo ou alvo inválido para execução remota.');
  }
  
  console.log('Build e preparação concluídos com sucesso!');
  return buildPath;
}

// Função para enviar o código para o Google Apps Script
function pushCode(buildPath: string): void {
  console.log('Enviando código para o Google Apps Script...');
  execSync(`cd ${buildPath} && ${CLASP_PATH} push -f`, { stdio: 'inherit' });
  console.log('Código enviado com sucesso!');
}

// Função para executar uma macro remotamente
function executeRemoteMacro(buildPath: string, functionName: string): void {
  console.log(`Executando função "${functionName}" remotamente...`);
  execSync(`cd ${buildPath} && ${CLASP_PATH} run "${functionName}"`, { stdio: 'inherit' });
  console.log('Execução concluída!');
}

// Função para mostrar os logs do Google Apps Script
function showLogs(buildPath: string): void {
  console.log('Mostrando logs do Google Apps Script...');
  execSync(`cd ${buildPath} && ${CLASP_PATH} logs`, { stdio: 'inherit' });
}

// Função para criar interface de linha de comando
function createCLI(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Função para listar as funções disponíveis
function listAvailableFunctions(type: string): string[] {
  if (type === 'salario') {
    return [
      'virarMesSalario',
      'virarMesTudo',
      'virarAnoSalario',
      'virarAnoTudo',
      'limparCoresSheet',
      'reordenarNomes',
      'limparDadosSheet',
      'bloquearAlteracoes'
    ];
  } else if (type === 'consumo') {
    return [
      'virarMesConsumo',
      'virarAnoConsumo',
      'limparDadosSheet',
      'onOpen'
    ];
  }
  
  return [];
}

// Função para iniciar a execução remota
async function startRemoteExecution(type: string, target?: string): Promise<void> {
  try {
    useTestConfig();
    const buildPath = buildAndPrepare(type, target);
    pushCode(buildPath);
    
    const availableFunctions = listAvailableFunctions(type);
    console.log('\nFunções disponíveis:');
    availableFunctions.forEach((func, index) => {
      console.log(`${index + 1}. ${func}`);
    });
    
    const cli = createCLI();
    
    const askQuestion = (question: string): Promise<string> => {
      return new Promise((resolve) => {
        cli.question(question, (answer) => {
          resolve(answer);
        });
      });
    };
    
    let continueExecution = true;
    
    while (continueExecution) {
      const functionIndex = parseInt(await askQuestion('\nEscolha o número da função que deseja executar (0 para sair): '));
      
      if (functionIndex === 0) {
        continueExecution = false;
        continue;
      }
      
      if (functionIndex > 0 && functionIndex <= availableFunctions.length) {
        const functionName = availableFunctions[functionIndex - 1];
        executeRemoteMacro(buildPath, functionName);
        
        const showLogsAnswer = await askQuestion('Deseja ver os logs de execução? (s/n): ');
        if (showLogsAnswer.toLowerCase() === 's') {
          showLogs(buildPath);
        }
      } else {
        console.log('Opção inválida!');
      }
    }
    
    cli.close();
  } catch (error) {
    console.error('Erro durante a execução remota:', error);
  } finally {
    restoreOriginalConfig();
  }
}

// Função principal
function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Argumentos insuficientes.');
    console.log('Uso: pnpm run execute:salario');
    console.log('Uso: pnpm run execute:consumo <target>');
    console.log('Onde <target> pode ser: Cafeteria, Saara, Castelo ou Stones');
    return;
  }
  
  const type = args[0].toLowerCase();
  const target = args[1];
  
  startRemoteExecution(type, target);
}

// Executa a função principal
main();
