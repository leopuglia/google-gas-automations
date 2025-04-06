/**
 * Script para build via Rollup
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { processAllTemplates } = require('./process-templates.cjs');

const projectRoot = path.resolve(__dirname, '..');

// Verifica se os diretórios de output existem
function checkOutputDirectories() {
  console.log('📂 Verificando diretórios de output...');
  const distDir = path.join(projectRoot, 'dist');
  
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log(`  ✅ Diretório ${distDir} criado`);
  }
}

// Executa o build usando rollup
function buildWithRollup() {
  console.log('🔨 Iniciando build com Rollup...');
  try {
    execSync('npx rollup -c rollup.config.cjs', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    console.log('✅ Build com Rollup concluído!');
  } catch (error) {
    console.error('❌ Erro ao executar o build com Rollup:', error.message);
    process.exit(1);
  }
}

// Função principal
function main() {
  console.log('🔥 Iniciando processo de build...');
  
  // Verifica diretórios de output
  checkOutputDirectories();
  
  // Executa o build com Rollup
  buildWithRollup();
  
  // Processa os templates para os projetos
  console.log('📝 Processando templates para os projetos...');
  const configFile = path.join(projectRoot, 'config.yml');
  processAllTemplates(configFile, 'dev');
  
  console.log('🎉 Processo de build concluído!');
}

// Inicia o processo
main();
