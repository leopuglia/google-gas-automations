/**
 * Script para build e deploy completo usando Rollup e Clasp
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { processAllTemplates } = require('./process-templates.cjs');
const { processProjects } = require('./clasp-operations.cjs');

const projectRoot = path.resolve(__dirname, '..');

/**
 * Verifica se os diretórios de output existem
 */
function checkOutputDirectories() {
  console.log('📂 Verificando diretórios de output...');
  const distDir = path.join(projectRoot, 'dist');
  
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log(`  ✅ Diretório ${distDir} criado`);
  }
}

/**
 * Executa o build usando rollup
 */
function buildWithRollup() {
  console.log('🔨 Iniciando build com Rollup...');
  try {
    execSync('npx rollup -c rollup.config.js', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    console.log('✅ Build com Rollup concluído!');
  } catch (error) {
    console.error('❌ Erro ao executar o build com Rollup:', error.message);
    process.exit(1);
  }
}

/**
 * Processa os templates para todos os projetos
 * @param {string} configFile - Caminho para o arquivo de configuração
 * @param {string} env - Ambiente (dev ou prod)
 */
function processTemplates(configFile, env) {
  console.log(`📝 Processando templates para ambiente: ${env}...`);
  processAllTemplates(configFile, env);
}

/**
 * Executa o processo completo de build e deploy
 * @param {string} configFile - Caminho para o arquivo de configuração
 * @param {string} env - Ambiente (dev ou prod)
 * @param {string} operation - Operação a ser realizada após o build (push, pull, execute)
 * @param {string} projectFilter - Filtro opcional para projetos específicos
 * @param {boolean} force - Se deve forçar o push mesmo com diferenças
 */
function buildAndDeploy(configFile, env = 'dev', operation = null, projectFilter = null, force = false) {
  console.log(`🚀 Iniciando processo de build e deploy com configuração: ${configFile} para ambiente: ${env}`);
  
  // Verifica diretórios de output
  checkOutputDirectories();
  
  // Executa o build com Rollup
  buildWithRollup();
  
  // Processa os templates
  processTemplates(configFile, env);
  
  // Executa a operação do clasp se solicitada
  if (operation) {
    processProjects(configFile, operation, env, projectFilter, force);
  }
  
  console.log('🎉 Processo de build e deploy concluído!');
}

// Executa o script se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  const configFile = args[0] || 'config.yml';
  const env = args[1] || 'dev';
  const operation = args[2] || null;
  const projectFilter = args[3] || null;
  const force = args.includes('--force');
  
  buildAndDeploy(configFile, env, operation, projectFilter, force);
}

module.exports = {
  checkOutputDirectories,
  buildWithRollup,
  processTemplates,
  buildAndDeploy
};
