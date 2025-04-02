/**
 * Script para facilitar o debug do projeto
 * 
 * Autor: Leonardo Puglia
 * Versão: 1.0.0 | Data: 02/04/2025
 * 
 * Descrição: Este script facilita o debug do projeto, permitindo a execução de comandos específicos
 * para testes e depuração.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import * as yaml from 'js-yaml';

// Caminho para o arquivo de configuração
const CONFIG_PATH = path.join(__dirname, '..', 'config.test.yml');
const ORIGINAL_CONFIG_PATH = path.join(__dirname, '..', 'config.yml');

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
function buildAndPrepare(): void {
  console.log('Executando build e preparando arquivos...');
  execSync('pnpm run build', { stdio: 'inherit' });
  execSync('pnpm run prepare', { stdio: 'inherit' });
  console.log('Build e preparação concluídos com sucesso!');
}

// Função para iniciar o debug
function startDebug(type: string, target?: string): void {
  try {
    useTestConfig();
    buildAndPrepare();
    
    if (type === 'salario') {
      console.log('Iniciando debug da planilha de salário...');
      execSync('pnpm run push:salario', { stdio: 'inherit' });
    } else if (type === 'consumo' && target) {
      console.log(`Iniciando debug da planilha de consumo ${target}...`);
      execSync(`pnpm run push:consumo:${target.toLowerCase()}`, { stdio: 'inherit' });
    } else {
      console.error('Tipo ou alvo inválido para debug.');
      console.log('Uso: pnpm run debug salario');
      console.log('Uso: pnpm run debug consumo <target>');
      console.log('Onde <target> pode ser: Cafeteria, Saara, Castelo ou Stones');
    }
  } catch (error) {
    console.error('Erro durante o debug:', error);
  } finally {
    restoreOriginalConfig();
  }
}

// Função principal
function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Argumentos insuficientes.');
    console.log('Uso: pnpm run debug salario');
    console.log('Uso: pnpm run debug consumo <target>');
    console.log('Onde <target> pode ser: Cafeteria, Saara, Castelo ou Stones');
    return;
  }
  
  const type = args[0].toLowerCase();
  const target = args[1];
  
  startDebug(type, target);
}

// Executa a função principal
main();
