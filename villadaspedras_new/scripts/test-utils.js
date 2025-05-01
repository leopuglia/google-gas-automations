/**
 * Script para testar a função cleanDirectories do utils.js
 */

// Importar módulos necessários
import path from 'path';
import fs from 'fs-extra';

import { cleanDirectories } from './utils.js';

// Função principal
function testCleanDirectories() {
  const buildDir = path.resolve('./build');
  const distDir = path.resolve('./dist');
  
  console.log(`Diretório de build: ${buildDir}`);
  console.log(`Diretório de dist: ${distDir}`);
  
  // Testar a função de limpeza
  console.log('Iniciando teste de limpeza de diretórios...');
  
  fs.ensureDirSync(buildDir);
  fs.writeFileSync(path.join(buildDir, 'test-file.txt'), 'Arquivo de teste para build');
  console.log(`Criado arquivo de teste em: ${path.join(buildDir, 'test-file.txt')}`);
    
  // Verificar se o arquivo existe
  const buildFileExists = fs.existsSync(path.join(buildDir, 'test-file.txt'));
  console.log(`Arquivo de teste em build existe? ${buildFileExists}`);
    
  // Limpar diretório de build
  console.log(`Limpando diretório de build: ${buildDir}`);
  cleanDirectories(buildDir, distDir, true, false);
  
  // Verificar se o arquivo ainda existe
  const buildFileExistsAfter = fs.existsSync(path.join(buildDir, 'test-file.txt'));
  console.log(`Arquivo de teste em build ainda existe após limpeza? ${buildFileExistsAfter}`);
  
  fs.ensureDirSync(distDir);
  fs.writeFileSync(path.join(distDir, 'test-file.txt'), 'Arquivo de teste para dist');
  console.log(`Criado arquivo de teste em: ${path.join(distDir, 'test-file.txt')}`);
    
  // Verificar se o arquivo existe
  const distFileExists = fs.existsSync(path.join(distDir, 'test-file.txt'));
  console.log(`Arquivo de teste em dist existe? ${distFileExists}`);
    
  // Limpar diretório de dist
  console.log(`Limpando diretório de dist: ${distDir}`);
  cleanDirectories(buildDir, distDir, false, true);
    
  // Verificar se o arquivo ainda existe
  const distFileExistsAfter = fs.existsSync(path.join(distDir, 'test-file.txt'));
  console.log(`Arquivo de teste em dist ainda existe após limpeza? ${distFileExistsAfter}`);
  
  console.log('Teste de limpeza concluído.');
}

// Função principal
function main() {
  testCleanDirectories();
}

// Executar a função principal
main();
