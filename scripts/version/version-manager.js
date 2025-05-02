#!/usr/bin/env node

/**
 * Script para gerenciar versões do projeto
 * Permite incrementar versões (major, minor, patch), gerar notas de release
 * e atualizar metadados de versão nos arquivos de configuração
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Caminhos de arquivos
const rootDir = path.resolve(__dirname, '../..');
const versionFilePath = path.join(rootDir, 'version.json');
const packageJsonPath = path.join(rootDir, 'package.json');
const changelogPath = path.join(rootDir, 'CHANGELOG.md');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Carrega o arquivo de versão
 * @returns {Object} Objeto com dados da versão
 */
function loadVersionFile() {
  try {
    if (!fs.existsSync(versionFilePath)) {
      console.error(`${colors.red}Arquivo de versão não encontrado: ${versionFilePath}${colors.reset}`);
      process.exit(1);
    }
    return JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
  } catch (error) {
    console.error(`${colors.red}Erro ao carregar arquivo de versão: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Salva o arquivo de versão
 * @param {Object} versionData Dados da versão
 */
function saveVersionFile(versionData) {
  try {
    fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2), 'utf8');
    console.log(`${colors.green}Arquivo de versão atualizado: ${versionFilePath}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Erro ao salvar arquivo de versão: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Atualiza a versão no package.json
 * @param {string} version Nova versão
 */
function updatePackageJson(version) {
  try {
    if (!fs.existsSync(packageJsonPath)) {
      console.warn(`${colors.yellow}Arquivo package.json não encontrado: ${packageJsonPath}${colors.reset}`);
      return;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = version;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log(`${colors.green}Versão atualizada no package.json: ${version}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Erro ao atualizar package.json: ${error.message}${colors.reset}`);
  }
}

/**
 * Incrementa a versão (major, minor ou patch)
 * @param {string} currentVersion Versão atual
 * @param {string} type Tipo de incremento (major, minor, patch)
 * @returns {string} Nova versão
 */
function incrementVersion(currentVersion, type) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return currentVersion;
  }
}

/**
 * Obtém os commits desde a última tag
 * @returns {Array<string>} Lista de mensagens de commit
 */
function getCommitsSinceLastTag() {
  try {
    // Obtém a última tag
    const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""', { encoding: 'utf8' }).trim();
    
    // Se não houver tag, obtém todos os commits
    const gitLogCommand = lastTag 
      ? `git log ${lastTag}..HEAD --pretty=format:"%s" --no-merges`
      : 'git log --pretty=format:"%s" --no-merges';
    
    return execSync(gitLogCommand, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
  } catch (error) {
    console.warn(`${colors.yellow}Não foi possível obter commits: ${error.message}${colors.reset}`);
    return [];
  }
}

/**
 * Categoriza os commits usando conventional commits
 * @param {Array<string>} commits Lista de mensagens de commit
 * @returns {Object} Commits categorizados
 */
function categorizeCommits(commits) {
  const categories = {
    feat: { title: 'Novos recursos', items: [] },
    fix: { title: 'Correções de bugs', items: [] },
    docs: { title: 'Documentação', items: [] },
    style: { title: 'Estilo', items: [] },
    refactor: { title: 'Refatorações', items: [] },
    perf: { title: 'Melhorias de performance', items: [] },
    test: { title: 'Testes', items: [] },
    build: { title: 'Build e dependências', items: [] },
    ci: { title: 'CI/CD', items: [] },
    chore: { title: 'Tarefas diversas', items: [] },
    revert: { title: 'Reversões', items: [] },
    other: { title: 'Outros', items: [] },
  };
  
  commits.forEach(commit => {
    const match = commit.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/);
    
    if (match) {
      const [, type, scope, message] = match;
      const formattedMessage = scope ? `**${scope}**: ${message}` : message;
      
      if (categories[type]) {
        categories[type].items.push(formattedMessage);
      } else {
        categories.other.items.push(formattedMessage);
      }
    } else {
      categories.other.items.push(commit);
    }
  });
  
  return categories;
}

/**
 * Gera notas de release a partir dos commits
 * @param {string} version Versão
 * @param {string} date Data da versão
 * @returns {string} Notas de release em formato markdown
 */
function generateReleaseNotes(version, date) {
  const commits = getCommitsSinceLastTag();
  const categories = categorizeCommits(commits);
  
  let notes = `## [${version}] - ${date}\n\n`;
  
  Object.values(categories).forEach(category => {
    if (category.items.length > 0) {
      notes += `### ${category.title}\n\n`;
      category.items.forEach(item => {
        notes += `- ${item}\n`;
      });
      notes += '\n';
    }
  });
  
  return notes;
}

/**
 * Atualiza o CHANGELOG.md
 * @param {string} releaseNotes Notas de release
 */
function updateChangelog(releaseNotes) {
  try {
    let changelog = '';
    
    if (fs.existsSync(changelogPath)) {
      changelog = fs.readFileSync(changelogPath, 'utf8');
    } else {
      changelog = '# Changelog\n\nTodas as mudanças notáveis neste projeto serão documentadas neste arquivo.\n\n';
    }
    
    // Insere as novas notas após o cabeçalho
    const parts = changelog.split('\n\n');
    const header = parts[0] + '\n\n' + (parts.length > 1 ? parts[1] + '\n\n' : '');
    const rest = parts.slice(2).join('\n\n');
    
    const newChangelog = `${header}${releaseNotes}${rest}`;
    fs.writeFileSync(changelogPath, newChangelog, 'utf8');
    
    console.log(`${colors.green}CHANGELOG.md atualizado${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Erro ao atualizar CHANGELOG.md: ${error.message}${colors.reset}`);
  }
}

/**
 * Cria uma tag Git para a versão
 * @param {string} version Versão
 * @param {string} message Mensagem da tag
 */
function createGitTag(version, message) {
  try {
    execSync(`git tag -a v${version} -m "${message}"`, { stdio: 'inherit' });
    console.log(`${colors.green}Tag Git criada: v${version}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Erro ao criar tag Git: ${error.message}${colors.reset}`);
  }
}

/**
 * Comando para incrementar a versão
 */
function commandBump(argv) {
  const versionData = loadVersionFile();
  const currentVersion = versionData.version;
  const newVersion = incrementVersion(currentVersion, argv.type);
  
  if (currentVersion === newVersion) {
    console.log(`${colors.yellow}A versão não foi alterada: ${currentVersion}${colors.reset}`);
    return;
  }
  
  // Atualiza a data
  const today = new Date().toISOString().split('T')[0];
  versionData.version = newVersion;
  versionData.date = today;
  
  if (argv.description) {
    versionData.description = argv.description;
  }
  
  // Gera notas de release
  const releaseNotes = generateReleaseNotes(newVersion, today);
  
  // Atualiza os arquivos
  saveVersionFile(versionData);
  updatePackageJson(newVersion);
  updateChangelog(releaseNotes);
  
  console.log(`${colors.green}Versão incrementada: ${currentVersion} -> ${newVersion}${colors.reset}`);
  
  // Cria tag Git se solicitado
  if (argv.tag) {
    const tagMessage = argv.description || `Release v${newVersion}`;
    createGitTag(newVersion, tagMessage);
  }
}

/**
 * Comando para mostrar a versão atual
 */
function commandShow() {
  const versionData = loadVersionFile();
  console.log(`\n${colors.cyan}Informações da versão:${colors.reset}`);
  console.log(`${colors.cyan}------------------${colors.reset}`);
  console.log(`${colors.cyan}Versão:${colors.reset} ${versionData.version}`);
  console.log(`${colors.cyan}Data:${colors.reset} ${versionData.date}`);
  console.log(`${colors.cyan}Descrição:${colors.reset} ${versionData.description}`);
  console.log(`${colors.cyan}Autor:${colors.reset} ${versionData.author || 'Não especificado'}`);
  console.log('');
}

/**
 * Comando para gerar notas de release
 */
function commandNotes(argv) {
  const versionData = loadVersionFile();
  const today = new Date().toISOString().split('T')[0];
  
  const releaseNotes = generateReleaseNotes(versionData.version, today);
  
  if (argv.save) {
    updateChangelog(releaseNotes);
  } else {
    console.log(`\n${colors.cyan}Notas de release para v${versionData.version}:${colors.reset}\n`);
    console.log(releaseNotes);
  }
}

// Configuração do CLI
yargs(hideBin(process.argv))
  .command('bump [type]', 'Incrementa a versão (major, minor, patch)', (yargs) => {
    return yargs
      .positional('type', {
        describe: 'Tipo de incremento',
        choices: ['major', 'minor', 'patch'],
        default: 'patch'
      })
      .option('description', {
        alias: 'd',
        describe: 'Descrição da versão',
        type: 'string'
      })
      .option('tag', {
        alias: 't',
        describe: 'Cria uma tag Git para a versão',
        type: 'boolean',
        default: false
      });
  }, commandBump)
  .command('show', 'Mostra a versão atual', {}, commandShow)
  .command('notes', 'Gera notas de release', (yargs) => {
    return yargs
      .option('save', {
        alias: 's',
        describe: 'Salva as notas no CHANGELOG.md',
        type: 'boolean',
        default: false
      });
  }, commandNotes)
  .demandCommand(1, 'Você precisa especificar um comando')
  .help()
  .argv;
