/**
 * Script para preparar os builds específicos para cada planilha
 * Este script utiliza o arquivo config.yml para gerar os arquivos necessários
 * para cada projeto
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { execSync } from 'child_process';

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

// Função para substituir placeholders em um template
function processTemplate(templateContent: string, variables: Record<string, string>): string {
  let result = templateContent;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(placeholder, value);
  }
  
  return result;
}

// Função para processar um arquivo de template
async function processTemplateFile(
  templatePath: string, 
  outputPath: string, 
  variables: Record<string, string>
): Promise<void> {
  try {
    const templateContent = await fs.readFile(templatePath, 'utf8');
    const processedContent = processTemplate(templateContent, variables);
    await fs.writeFile(outputPath, processedContent);
    console.log(`Arquivo gerado: ${outputPath}`);
  } catch (error) {
    console.error(`Erro ao processar template ${templatePath}:`, error);
    throw error;
  }
}

// Função para preparar o build de um projeto específico
async function prepareProjectBuild(
  projectType: string, 
  projectKey: string, 
  projectConfig: any
): Promise<void> {
  try {
    console.log(`Preparando build para ${projectType}-${projectKey}...`);
    
    const rootDir = path.resolve(__dirname, '..');
    const buildDir = path.join(rootDir, 'build');
    
    let projectBuildDir: string;
    
    if (projectType === 'salario') {
      projectBuildDir = path.join(buildDir, `salario-${projectKey}`);
    } else if (projectType === 'consumo') {
      projectBuildDir = path.join(buildDir, `consumo-${projectKey}-${Object.keys(projectConfig)[0]}`);
    } else {
      throw new Error(`Tipo de projeto inválido: ${projectType}`);
    }
    
    // Criar diretório de build
    await fs.ensureDir(projectBuildDir);
    
    // Obter as configurações globais
    const config = loadConfig();
    const { timeZone, runtimeVersion } = config.defaults;
    
    // Variáveis para substituição nos templates
    let variables: Record<string, string>;
    
    if (projectType === 'salario') {
      variables = {
        scriptId: projectConfig.scriptId,
        timeZone,
        runtimeVersion
      };
    } else if (projectType === 'consumo') {
      const pdv = Object.keys(projectConfig)[0];
      const yearConfig = projectConfig[pdv][Object.keys(projectConfig[pdv])[0]];
      variables = {
        scriptId: yearConfig.scriptId,
        timeZone,
        runtimeVersion
      };
    } else {
      throw new Error(`Tipo de projeto inválido: ${projectType}`);
    }
    
    // Caminho para os templates dentro do projeto
    const projectTemplatesDir = path.join(rootDir, 'src', 'templates');
    
    // Processar template do .clasp.json
    await processTemplateFile(
      path.join(projectTemplatesDir, '.clasp.json.template'),
      path.join(projectBuildDir, '.clasp.json'),
      variables
    );
    
    // Processar template do appsscript.json
    const appsscriptTemplate = projectType === 'salario' ? 'appsscript-salario.json' : 'appsscript-consumo.json';
    
    // Verificar se existe um template específico para o tipo de projeto
    if (fs.existsSync(path.join(projectTemplatesDir, appsscriptTemplate))) {
      // Copiar o template específico
      await fs.copy(
        path.join(projectTemplatesDir, appsscriptTemplate),
        path.join(projectBuildDir, 'appsscript.json')
      );
    } else {
      // Usar o template genérico
      await processTemplateFile(
        path.join(projectTemplatesDir, 'appsscript.json.template'),
        path.join(projectBuildDir, 'appsscript.json'),
        variables
      );
    }
    
    // Copiar arquivos compilados
    console.log('Copiando arquivos compilados...');
    
    // Verificar se o diretório commons existe
    const commonsDir = path.join(buildDir, 'commons');
    if (fs.existsSync(commonsDir)) {
      // Copiar arquivos comuns
      await fs.copy(
        commonsDir,
        projectBuildDir,
        { overwrite: true }
      );
    } else {
      console.log('Diretório commons não encontrado, pulando...');
    }
    
    // Copiar arquivos específicos do tipo de planilha
    if (projectType === 'salario') {
      const salarioDir = path.join(buildDir, 'planilha-salario');
      if (fs.existsSync(salarioDir)) {
        await fs.copy(
          salarioDir,
          projectBuildDir,
          { overwrite: true }
        );
      } else {
        console.log('Diretório planilha-salario não encontrado, pulando...');
      }
    } else if (projectType === 'consumo') {
      const consumoDir = path.join(buildDir, 'planilha-consumo');
      if (fs.existsSync(consumoDir)) {
        await fs.copy(
          consumoDir,
          projectBuildDir,
          { overwrite: true }
        );
      } else {
        console.log('Diretório planilha-consumo não encontrado, pulando...');
      }
    }
    
    // Renomear arquivos .js para .gs
    const jsFiles = await fs.readdir(projectBuildDir);
    for (const file of jsFiles) {
      if (file.endsWith('.js')) {
        const oldPath = path.join(projectBuildDir, file);
        const newPath = path.join(projectBuildDir, file.replace('.js', '.gs'));
        await fs.rename(oldPath, newPath);
      }
    }
    
    console.log(`Build para ${projectType}-${projectKey} preparado com sucesso!`);
  } catch (error) {
    console.error(`Erro ao preparar build para ${projectType}-${projectKey}:`, error);
    process.exit(1);
  }
}

// Função principal para preparar todos os builds
async function prepareAllBuilds(): Promise<void> {
  try {
    console.log('Preparando todos os builds...');
    
    // Carregar configuração
    const config = loadConfig();
    
    // Preparar builds para projetos de salário
    for (const year in config.projects.salario) {
      await prepareProjectBuild('salario', year, config.projects.salario[year]);
    }
    
    // Preparar builds para projetos de consumo
    for (const pdv in config.projects.consumo) {
      await prepareProjectBuild('consumo', pdv, config.projects.consumo);
    }
    
    console.log('Todos os builds foram preparados com sucesso!');
  } catch (error) {
    console.error('Erro ao preparar builds:', error);
    process.exit(1);
  }
}

// Função para preparar um build específico
async function prepareSpecificBuild(projectType: string, projectKey: string): Promise<void> {
  try {
    console.log(`Preparando build específico para ${projectType}-${projectKey}...`);
    
    // Carregar configuração
    const config = loadConfig();
    
    if (projectType === 'salario') {
      if (!config.projects.salario[projectKey]) {
        throw new Error(`Configuração não encontrada para salario-${projectKey}`);
      }
      await prepareProjectBuild('salario', projectKey, config.projects.salario[projectKey]);
    } else if (projectType === 'consumo') {
      if (!config.projects.consumo[projectKey]) {
        throw new Error(`Configuração não encontrada para consumo-${projectKey}`);
      }
      await prepareProjectBuild('consumo', projectKey, config.projects.consumo);
    } else {
      throw new Error(`Tipo de projeto inválido: ${projectType}`);
    }
    
    console.log(`Build específico para ${projectType}-${projectKey} preparado com sucesso!`);
  } catch (error) {
    console.error(`Erro ao preparar build específico para ${projectType}-${projectKey}:`, error);
    process.exit(1);
  }
}

// Executar o script
const projectType = process.argv[2];
const projectKey = process.argv[3];

if (projectType && projectKey) {
  prepareSpecificBuild(projectType, projectKey);
} else {
  prepareAllBuilds();
}
