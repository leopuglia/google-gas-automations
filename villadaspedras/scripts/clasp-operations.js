/**
 * Script para operações com o clasp (push, pull, execute)
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { loadConfig } = require('./process-templates');

/**
 * Executa um comando clasp em um diretório específico
 * @param {string} command - Comando clasp a ser executado
 * @param {string} projectDir - Diretório do projeto
 * @param {boolean} silent - Se deve suprimir a saída
 * @returns {string} Saída do comando
 */
function runClaspCommand(command, projectDir, silent = false) {
  try {
    const options = {
      cwd: projectDir,
      stdio: silent ? 'pipe' : 'inherit'
    };
    
    return execSync(`npx clasp ${command}`, options).toString();
  } catch (error) {
    if (silent) {
      return error.stderr.toString();
    } else {
      console.error(`❌ Erro ao executar comando clasp: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Verifica se o clasp está logado
 * @returns {boolean} Se o clasp está logado
 */
function isClaspLoggedIn() {
  try {
    const result = execSync('npx clasp login --status', { stdio: 'pipe' }).toString();
    return result.includes('You are logged in');
  } catch (error) {
    return false;
  }
}

/**
 * Faz login no clasp se necessário
 */
function ensureClaspLogin() {
  if (!isClaspLoggedIn()) {
    console.log('🔑 Fazendo login no clasp...');
    execSync('npx clasp login', { stdio: 'inherit' });
  }
}

/**
 * Faz push de um projeto para o Google Apps Script
 * @param {string} projectDir - Diretório do projeto
 * @param {boolean} force - Se deve forçar o push mesmo com diferenças
 */
function pushProject(projectDir, force = false) {
  console.log(`🚀 Enviando projeto em ${projectDir} para o Google Apps Script...`);
  
  // Verifica se o diretório existe
  if (!fs.existsSync(projectDir)) {
    console.error(`❌ Diretório do projeto não encontrado: ${projectDir}`);
    return;
  }
  
  // Verifica se o arquivo .clasp.json existe
  const claspConfigPath = path.join(projectDir, '.clasp.json');
  if (!fs.existsSync(claspConfigPath)) {
    console.error(`❌ Arquivo .clasp.json não encontrado em: ${projectDir}`);
    return;
  }
  
  // Executa o comando clasp push
  const forceFlag = force ? '--force' : '';
  runClaspCommand(`push ${forceFlag}`, projectDir);
  console.log(`✅ Projeto enviado com sucesso: ${projectDir}`);
}

/**
 * Faz pull de um projeto do Google Apps Script
 * @param {string} projectDir - Diretório do projeto
 */
function pullProject(projectDir) {
  console.log(`📥 Baixando projeto do Google Apps Script para ${projectDir}...`);
  
  // Verifica se o diretório existe
  if (!fs.existsSync(projectDir)) {
    console.error(`❌ Diretório do projeto não encontrado: ${projectDir}`);
    return;
  }
  
  // Verifica se o arquivo .clasp.json existe
  const claspConfigPath = path.join(projectDir, '.clasp.json');
  if (!fs.existsSync(claspConfigPath)) {
    console.error(`❌ Arquivo .clasp.json não encontrado em: ${projectDir}`);
    return;
  }
  
  // Executa o comando clasp pull
  runClaspCommand('pull', projectDir);
  console.log(`✅ Projeto baixado com sucesso: ${projectDir}`);
}

/**
 * Lista as funções disponíveis em um projeto
 * @param {string} projectDir - Diretório do projeto
 * @returns {string[]} Lista de funções
 */
function listFunctions(projectDir) {
  console.log(`📋 Listando funções disponíveis em ${projectDir}...`);
  
  try {
    const output = runClaspCommand('run', projectDir, true);
    const functionMatches = output.match(/Available functions:\s*([\s\S]*?)(?:\n\n|\n$|$)/);
    
    if (functionMatches && functionMatches[1]) {
      const functions = functionMatches[1].trim().split('\n').map(f => f.trim());
      return functions;
    }
    
    return [];
  } catch (error) {
    console.error(`❌ Erro ao listar funções: ${error.message}`);
    return [];
  }
}

/**
 * Executa uma função remota no Google Apps Script
 * @param {string} projectDir - Diretório do projeto
 * @param {string} functionName - Nome da função a ser executada
 */
function executeFunction(projectDir, functionName) {
  console.log(`▶️ Executando função ${functionName} no projeto ${projectDir}...`);
  
  // Verifica se o diretório existe
  if (!fs.existsSync(projectDir)) {
    console.error(`❌ Diretório do projeto não encontrado: ${projectDir}`);
    return;
  }
  
  // Executa o comando clasp run
  runClaspCommand(`run "${functionName}"`, projectDir);
  console.log(`✅ Função executada com sucesso: ${functionName}`);
}

/**
 * Executa uma função interativamente, permitindo ao usuário escolher
 * @param {string} projectDir - Diretório do projeto
 */
function executeInteractive(projectDir) {
  // Verifica se o diretório existe
  if (!fs.existsSync(projectDir)) {
    console.error(`❌ Diretório do projeto não encontrado: ${projectDir}`);
    return;
  }
  
  // Lista as funções disponíveis
  const functions = listFunctions(projectDir);
  
  if (functions.length === 0) {
    console.error('❌ Nenhuma função disponível para execução');
    return;
  }
  
  console.log('\nFunções disponíveis:');
  functions.forEach((func, index) => {
    console.log(`${index + 1}. ${func}`);
  });
  
  // Solicita ao usuário escolher uma função
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('\nEscolha o número da função para executar: ', (answer) => {
    const index = parseInt(answer) - 1;
    
    if (isNaN(index) || index < 0 || index >= functions.length) {
      console.error('❌ Escolha inválida');
      readline.close();
      return;
    }
    
    const selectedFunction = functions[index];
    readline.close();
    
    // Executa a função selecionada
    executeFunction(projectDir, selectedFunction);
  });
}

/**
 * Processa os projetos com base na configuração
 * @param {string} configFile - Caminho para o arquivo de configuração
 * @param {string} operation - Operação a ser realizada (push, pull, execute)
 * @param {string} env - Ambiente (dev ou prod)
 * @param {string} projectFilter - Filtro opcional para projetos específicos
 * @param {boolean} force - Se deve forçar o push mesmo com diferenças
 */
function processProjects(configFile, operation, env = 'dev', projectFilter = null, force = false) {
  console.log(`🔍 Carregando configuração: ${configFile} para ambiente: ${env}`);
  const config = loadConfig(configFile);
  
  if (!config.projects) {
    console.error('❌ Configuração inválida: não há projetos definidos');
    process.exit(1);
  }
  
  // Garante que o clasp está logado
  ensureClaspLogin();
  
  // Processa cada projeto
  for (const [projectKey, projectConfig] of Object.entries(config.projects)) {
    // Filtra projetos se necessário
    if (projectFilter && projectFilter !== 'all') {
      if (projectFilter === 'salario' && projectKey !== 'salario') continue;
      if (projectFilter === 'consumo' && projectKey !== 'consumo') continue;
      
      // Para PDVs específicos (1-cafeteria, 2-saara, etc)
      if (projectKey === 'consumo' && projectFilter.includes('-')) {
        const pdvFilter = projectFilter;
        const pdvs = ['1-cafeteria', '2-saara', '3-castelo', '4-stones'];
        if (!pdvs.includes(pdvFilter)) continue;
      }
    }
    
    if (projectKey === 'example') {
      const projectDir = path.resolve(process.cwd(), `dist/${env}/${projectKey}`);
      
      if (operation === 'push') {
        pushProject(projectDir, force);
      } else if (operation === 'pull') {
        pullProject(projectDir);
      } else if (operation === 'execute') {
        executeInteractive(projectDir);
      }
    } else if (projectKey === 'salario') {
      const projectDir = path.resolve(process.cwd(), `dist/${env}/2024-salario`);
      
      if (operation === 'push') {
        pushProject(projectDir, force);
      } else if (operation === 'pull') {
        pullProject(projectDir);
      } else if (operation === 'execute') {
        executeInteractive(projectDir);
      }
    } else if (projectKey === 'consumo') {
      const pdvs = ['1-cafeteria', '2-saara', '3-castelo', '4-stones'];
      
      for (const pdv of pdvs) {
        // Se tiver um filtro de PDV específico, verifica
        if (projectFilter && projectFilter.includes('-') && projectFilter !== pdv) {
          continue;
        }
        
        const projectDir = path.resolve(process.cwd(), `dist/${env}/2024-${pdv}-consumo`);
        
        if (operation === 'push') {
          pushProject(projectDir, force);
        } else if (operation === 'pull') {
          pullProject(projectDir);
        } else if (operation === 'execute') {
          executeInteractive(projectDir);
        }
      }
    }
  }
  
  console.log(`✅ Operação ${operation} concluída com sucesso!`);
}

// Executa o script se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  const operation = args[0];
  const configFile = args[1] || 'config.yml';
  const env = args[2] || 'dev';
  const projectFilter = args[3] || null;
  const force = args.includes('--force');
  
  if (!['push', 'pull', 'execute'].includes(operation)) {
    console.error('❌ Operação inválida. Use: push, pull ou execute');
    process.exit(1);
  }
  
  processProjects(configFile, operation, env, projectFilter, force);
}

module.exports = {
  runClaspCommand,
  isClaspLoggedIn,
  ensureClaspLogin,
  pushProject,
  pullProject,
  listFunctions,
  executeFunction,
  executeInteractive,
  processProjects
};
