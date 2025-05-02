import fs from 'fs';
import fsExtra from 'fs-extra';
import { execSync } from 'child_process';
import path from 'path';
import logger from './logger.js';

/**
 * Limpa os diretórios de build e/ou dist
 * @param {string} buildDir Caminho do diretório de build
 * @param {string} distDir Caminho do diretório de dist
 * @param {boolean} cleanBuild Limpar diretório de build
 * @param {boolean} cleanDist Limpar diretório de dist
 */
export function cleanDirectories(buildDir, distDir, cleanBuild = true, cleanDist = true) {
  // Função auxiliar para verificar se um diretório está vazio
  const isDirEmpty = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      return true; // Diretório não existe, consideramos como "vazio"
    }
    
    const files = fs.readdirSync(dirPath);
    return files.length === 0;
  };
  
  if (cleanBuild) {
    logger.info(`Limpando diretório de build: ${buildDir}`);
    
    // Verificar se o diretório existe antes de limpar
    if (fs.existsSync(buildDir)) {
      // Limpar o diretório
      fsExtra.emptyDirSync(buildDir);
      
      // Verificar se o diretório está vazio após a limpeza
      const isEmptyAfter = isDirEmpty(buildDir);
      
      if (isEmptyAfter) {
        logger.info(`Diretório de build limpo com sucesso: ${buildDir}`);
      } else {
        logger.warn(`O diretório de build pode não ter sido completamente limpo: ${buildDir}`);
      }
    } else {
      // Criar o diretório se não existir
      fsExtra.ensureDirSync(buildDir);
      logger.info(`Diretório de build criado: ${buildDir}`);
    }
  }
  
  if (cleanDist) {
    logger.info(`Limpando diretório de dist: ${distDir}`);
    
    // Verificar se o diretório existe antes de limpar
    if (fs.existsSync(distDir)) {
      // Limpar o diretório
      fsExtra.emptyDirSync(distDir);
      
      // Verificar se o diretório está vazio após a limpeza
      const isEmptyAfter = isDirEmpty(distDir);
      
      if (isEmptyAfter) {
        logger.info(`Diretório de dist limpo com sucesso: ${distDir}`);
      } else {
        logger.warn(`O diretório de dist pode não ter sido completamente limpo: ${distDir}`);
      }
    } else {
      // Criar o diretório se não existir
      fsExtra.ensureDirSync(distDir);
      logger.info(`Diretório de dist criado: ${distDir}`);
    }
  }
}

/**
 * Verifica se os diretórios de build existem para os projetos especificados
 * e executa o build se necessário
 * @param {Object} config Configuração completa
 * @param {Object} paths Caminhos dos diretórios
 * @param {string|null} projectKey Chave do projeto específico (opcional)
 * @param {boolean} forceBuild Forçar o build mesmo se os diretórios existirem
 * @returns {boolean} true se o build foi executado com sucesso
 */
export function ensureBuildBeforeDeploy(config, paths, projectKey = null, forceBuild = false) {
  const projects = config.projects || {};
  const projectKeys = projectKey ? [projectKey] : Object.keys(projects);
  let needsBuild = forceBuild;
  
  logger.info(`Verificando diretórios de build para os projetos: ${projectKeys.join(', ')}`);
  
  // Verificar se os diretórios de build existem para os projetos especificados
  for (const key of projectKeys) {
    const projectConfig = projects[key] || {};
    const srcDir = projectConfig.src || key;
    const buildDir = path.join(paths.build, srcDir);

    logger.debug(`Verificando diretório de build para o projeto ${key}: ${buildDir}`);
    
    if (!fs.existsSync(buildDir) || forceBuild) {
      logger.debug(`Diretório de build não encontrado para o projeto ${key}: ${buildDir}`);
      needsBuild = true;
      break;
    }
  }
  
  // Se algum diretório de build não existir, executar o build
  if (needsBuild) {
    logger.info('Executando build antes do deploy...');
    try {
      // Determinar o comando de build
      const buildCmd = 'pnpm run build';
      if (projectKey) {
        // Se um projeto específico foi especificado, adicionar o parâmetro --project
        buildCmd += ` -- --project=${projectKey}`;
      }
      
      // Executar o comando de build
      logger.info(`Executando: ${buildCmd}`);
      execSync(buildCmd, { stdio: 'inherit', cwd: path.resolve(paths.scripts, '..') });
      logger.info('Build concluído com sucesso!');
      return true;
    } catch (error) {
      logger.error('Erro ao executar o build: ' + error.message, error);
      logger.error('Verifique se o comando de build está configurado corretamente no package.json');
      return false;
    }
  }
  
  logger.info('Diretórios de build encontrados, continuando com o deploy...');
  return true;
}
