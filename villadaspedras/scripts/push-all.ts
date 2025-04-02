/**
 * Script para enviar todos os projetos para o Google Apps Script
 */

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';

// Função para carregar o arquivo de configuração YAML
function loadConfig(): any {
  try {
    const configPath = path.join(__dirname, '..', 'config.yml');
    const configFile = fs.readFileSync(configPath, 'utf8');
    return yaml.load(configFile);
  } catch (error) {
    console.error('Erro ao carregar arquivo de configuração:', error);
    process.exit(1);
  }
}

// Função para enviar todos os projetos
async function pushAllProjects(): Promise<void> {
  try {
    console.log('Enviando todos os projetos para o Google Apps Script...');
    
    // Carregar configuração
    const config = loadConfig();
    
    // Enviar projetos de salário
    for (const year in config.projects.salario) {
      await pushProject('salario', year);
    }
    
    // Enviar projetos de consumo
    for (const pdv in config.projects.consumo) {
      await pushProject('consumo', pdv);
    }
    
    console.log('Todos os projetos foram enviados com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar projetos:', error);
    process.exit(1);
  }
}

// Função para enviar um projeto específico
async function pushProject(projectType: string, projectKey: string): Promise<void> {
  try {
    console.log(`Enviando projeto ${projectType}-${projectKey} para o Google Apps Script...`);
    
    const rootDir = path.resolve(__dirname, '..');
    const buildDir = path.join(rootDir, 'build');
    
    let projectBuildDir: string;
    
    if (projectType === 'salario') {
      projectBuildDir = path.join(buildDir, `salario-${projectKey}`);
    } else if (projectType === 'consumo') {
      // Para projetos de consumo, precisamos verificar o PDV
      const config = loadConfig();
      if (!config.projects.consumo[projectKey]) {
        throw new Error(`PDV não encontrado: ${projectKey}`);
      }
      
      // Obter o ano (primeiro ano disponível)
      const year = Object.keys(config.projects.consumo[projectKey])[0];
      projectBuildDir = path.join(buildDir, `consumo-${projectKey}-${year}`);
    } else {
      throw new Error(`Tipo de projeto inválido: ${projectType}`);
    }
    
    // Verificar se o diretório de build existe
    if (!fs.existsSync(projectBuildDir)) {
      console.log(`Diretório de build não encontrado: ${projectBuildDir}`);
      console.log('Executando build primeiro...');
      
      // Criar o diretório de build
      await fs.ensureDir(projectBuildDir);
      
      // Executar o script de preparação
      console.log(`Executando ts-node scripts/prepare-builds.ts ${projectType} ${projectKey}...`);
      execSync(`ts-node scripts/prepare-builds.ts ${projectType} ${projectKey}`, { cwd: rootDir, stdio: 'inherit' });
      
      // Verificar novamente se o diretório de build existe
      if (!fs.existsSync(projectBuildDir)) {
        console.warn(`Falha ao criar diretório de build: ${projectBuildDir}. Pulando...`);
        return;
      }
    }
    
    // Executar o comando clasp push
    console.log(`Executando clasp push em ${projectBuildDir}...`);
    execSync('clasp push', { cwd: projectBuildDir, stdio: 'inherit' });
    
    console.log(`Projeto ${projectType}-${projectKey} enviado com sucesso!`);
  } catch (error) {
    console.error(`Erro ao enviar projeto ${projectType}-${projectKey}:`, error);
    // Não abortar o script, apenas registrar o erro e continuar
    console.log('Continuando com os próximos projetos...');
  }
}

// Executar o script
pushAllProjects();
