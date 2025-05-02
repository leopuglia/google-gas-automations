# Plano de Testes e Estabilização do Sistema de Build

Este documento detalha o plano para expandir a cobertura de testes, refatorar partes críticas do código e melhorar o tratamento de exceções no sistema de build, preparando-o para a migração dos scripts do projeto villadaspedras.

## Objetivos

1. Garantir a robustez do sistema de build através de testes automatizados
2. Refatorar partes críticas do código para melhorar a manutenção
3. Implementar tratamento de exceções mais abrangente em pontos críticos
4. Validar o sistema com diferentes configurações de projeto

## 1. Expansão da Cobertura de Testes

### 1.1. Testes para o Módulo de Configuração

```javascript
// tests/config-helper.test.js
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { loadConfig, validateConfig } from '../scripts/build/config-helper.js';
import fs from 'fs';
import path from 'path';

describe('Config Helper', () => {
  const tempConfigPath = path.resolve('./temp-config.yml');
  
  afterEach(() => {
    // Limpar arquivos temporários após cada teste
    if (fs.existsSync(tempConfigPath)) {
      fs.unlinkSync(tempConfigPath);
    }
  });

  it('deve carregar um arquivo de configuração válido', () => {
    // Criar arquivo de configuração de teste
    const configContent = `
defaults:
  paths:
    src: src
    build: build
projects:
  example:
    src: example
    output: example
    environments:
      dev:
        scriptId: test-script-id
    `;
    fs.writeFileSync(tempConfigPath, configContent);
    
    const config = loadConfig(tempConfigPath, false);
    
    expect(config).toBeDefined();
    expect(config.defaults.paths.src).toBe('src');
    expect(config.projects.example.environments.dev.scriptId).toBe('test-script-id');
  });

  it('deve validar corretamente um arquivo de configuração', () => {
    const validConfig = {
      defaults: {
        paths: {
          src: 'src',
          build: 'build'
        }
      },
      projects: {
        example: {
          src: 'example',
          output: 'example',
          environments: {
            dev: {
              scriptId: 'test-script-id'
            }
          }
        }
      }
    };
    
    const isValid = validateConfig(validConfig);
    expect(isValid).toBe(true);
  });

  it('deve rejeitar um arquivo de configuração inválido', () => {
    const invalidConfig = {
      defaults: {
        paths: {
          src: 'src'
          // Falta o campo 'build'
        }
      },
      // Falta o campo 'projects'
    };
    
    const isValid = validateConfig(invalidConfig);
    expect(isValid).toBe(false);
  });

  it('deve lançar erro quando o arquivo não existe', () => {
    expect(() => {
      loadConfig('arquivo-inexistente.yml');
    }).toThrow();
  });
});
```

### 1.2. Testes para o Módulo de Templates

```javascript
// tests/template-helper.test.js
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { processTemplate } from '../scripts/build/template-helper.js';
import fs from 'fs';
import path from 'path';

describe('Template Helper', () => {
  const tempTemplatePath = path.resolve('./temp-template.hbs');
  const tempOutputPath = path.resolve('./temp-output.json');
  
  afterEach(() => {
    // Limpar arquivos temporários após cada teste
    if (fs.existsSync(tempTemplatePath)) {
      fs.unlinkSync(tempTemplatePath);
    }
    if (fs.existsSync(tempOutputPath)) {
      fs.unlinkSync(tempOutputPath);
    }
  });

  it('deve processar um template com variáveis simples', () => {
    // Criar arquivo de template de teste
    const templateContent = `{
  "name": "{{PROJECT_NAME}}",
  "version": "{{version}}",
  "description": "{{PROJECT_DESCRIPTION}}"
}`;
    fs.writeFileSync(tempTemplatePath, templateContent);
    
    const context = {
      PROJECT_NAME: 'test-project',
      PROJECT_DESCRIPTION: 'Test project description',
      version: '1.0.0'
    };
    
    processTemplate(tempTemplatePath, tempOutputPath, context);
    
    // Verificar o resultado
    const result = JSON.parse(fs.readFileSync(tempOutputPath, 'utf8'));
    expect(result.name).toBe('test-project');
    expect(result.version).toBe('1.0.0');
    expect(result.description).toBe('Test project description');
  });

  it('deve processar um template com helpers condicionais', () => {
    // Criar arquivo de template de teste
    const templateContent = `{
  "dependencies": [
    {{#each dependencies}}
    {
      "name": "{{name}}",
      "version": "{{version}}"
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}`;
    fs.writeFileSync(tempTemplatePath, templateContent);
    
    const context = {
      dependencies: [
        { name: 'dep1', version: '1.0.0' },
        { name: 'dep2', version: '2.0.0' }
      ]
    };
    
    processTemplate(tempTemplatePath, tempOutputPath, context);
    
    // Verificar o resultado
    const result = JSON.parse(fs.readFileSync(tempOutputPath, 'utf8'));
    expect(result.dependencies).toHaveLength(2);
    expect(result.dependencies[0].name).toBe('dep1');
    expect(result.dependencies[1].name).toBe('dep2');
  });

  it('deve incluir automaticamente informações de versão', () => {
    // Criar arquivo de template de teste
    const templateContent = `{
  "name": "test",
  "buildInfo": {
    "version": "{{version}}",
    "buildDate": "{{buildDate}}"
  }
}`;
    fs.writeFileSync(tempTemplatePath, templateContent);
    
    processTemplate(tempTemplatePath, tempOutputPath, {});
    
    // Verificar o resultado
    const result = JSON.parse(fs.readFileSync(tempOutputPath, 'utf8'));
    expect(result.buildInfo.version).toBeDefined();
    expect(result.buildInfo.buildDate).toBeDefined();
  });
});
```

### 1.3. Testes para o Módulo de Filesystem

```javascript
// tests/filesystem-helper.test.js
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { ensureBuildBeforeDeploy, ensureDirectoryExists } from '../scripts/build/filesystem-helper.js';
import fs from 'fs';
import path from 'path';

describe('Filesystem Helper', () => {
  const tempDir = path.resolve('./temp-test-dir');
  const tempBuildDir = path.resolve('./temp-build-dir');
  
  beforeEach(() => {
    // Criar diretórios de teste
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    if (!fs.existsSync(tempBuildDir)) {
      fs.mkdirSync(tempBuildDir, { recursive: true });
    }
  });
  
  afterEach(() => {
    // Limpar diretórios de teste
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    if (fs.existsSync(tempBuildDir)) {
      fs.rmSync(tempBuildDir, { recursive: true, force: true });
    }
  });

  it('deve criar um diretório se não existir', () => {
    const newDir = path.join(tempDir, 'new-dir');
    ensureDirectoryExists(newDir);
    expect(fs.existsSync(newDir)).toBe(true);
  });

  it('deve detectar corretamente quando um build é necessário', () => {
    // Diretório vazio deve precisar de build
    const emptyBuildDir = path.join(tempBuildDir, 'empty');
    fs.mkdirSync(emptyBuildDir, { recursive: true });
    
    const config = {
      defaults: {
        paths: {
          build: tempBuildDir
        }
      },
      projects: {
        test: {
          output: 'empty'
        }
      }
    };
    
    const needsBuild = ensureBuildBeforeDeploy(config, ['test'], false);
    expect(needsBuild).toBe(true);
  });

  it('deve detectar corretamente quando um build não é necessário', () => {
    // Diretório com arquivos não deve precisar de build
    const fullBuildDir = path.join(tempBuildDir, 'full');
    fs.mkdirSync(fullBuildDir, { recursive: true });
    fs.writeFileSync(path.join(fullBuildDir, 'test.js'), 'console.log("test");');
    
    const config = {
      defaults: {
        paths: {
          build: tempBuildDir
        }
      },
      projects: {
        test: {
          output: 'full'
        }
      }
    };
    
    const needsBuild = ensureBuildBeforeDeploy(config, ['test'], false);
    expect(needsBuild).toBe(false);
  });
});
```

### 1.4. Testes para o Módulo de Versionamento

```javascript
// tests/version-manager.test.js
import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

describe('Version Manager', () => {
  const tempDir = path.resolve('./temp-version-test');
  const versionFilePath = path.join(tempDir, 'version.json');
  
  beforeEach(() => {
    // Criar diretório e arquivo de versão de teste
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const versionData = {
      version: '1.0.0',
      description: 'Test version',
      date: '2024-05-02',
      author: 'Test Author'
    };
    
    fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));
  });
  
  afterEach(() => {
    // Limpar diretório de teste
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('deve mostrar a versão atual corretamente', async () => {
    const result = await execAsync(`node scripts/version/version-manager.js show --versionFile=${versionFilePath}`);
    expect(result.stdout).toContain('1.0.0');
    expect(result.stdout).toContain('Test version');
  });

  it('deve incrementar a versão patch corretamente', async () => {
    await execAsync(`node scripts/version/version-manager.js bump --versionFile=${versionFilePath}`);
    
    const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
    expect(versionData.version).toBe('1.0.1');
  });

  it('deve incrementar a versão minor corretamente', async () => {
    await execAsync(`node scripts/version/version-manager.js bump minor --versionFile=${versionFilePath}`);
    
    const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
    expect(versionData.version).toBe('1.1.0');
  });

  it('deve incrementar a versão major corretamente', async () => {
    await execAsync(`node scripts/version/version-manager.js bump major --versionFile=${versionFilePath}`);
    
    const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
    expect(versionData.version).toBe('2.0.0');
  });
});
```

## 2. Refatoração de Partes Críticas

### 2.1. Refatoração do Módulo de Deploy

Principais pontos a serem refatorados:

1. **Separação de responsabilidades**:
   - Dividir a função `main` em funções menores com responsabilidades específicas
   - Criar módulos separados para cada etapa do processo de deploy

2. **Melhoria na estrutura de comandos**:
   - Refatorar o processamento de argumentos de linha de comando
   - Implementar padrão Command para as diferentes operações

3. **Otimização do fluxo de deploy**:
   - Implementar verificações mais eficientes para evitar operações desnecessárias
   - Melhorar o feedback durante o processo de deploy

### 2.2. Refatoração do Módulo de Templates

Principais pontos a serem refatorados:

1. **Separação do carregamento e processamento**:
   - Separar a leitura de templates do processamento
   - Implementar cache para templates compilados

2. **Melhoria na gestão de contexto**:
   - Criar função específica para preparar o contexto com informações de versão
   - Implementar validação de contexto para evitar erros de processamento

## 3. Melhoria no Tratamento de Exceções

### 3.1. Pontos Críticos para Tratamento de Exceções

1. **Carregamento de Configuração**:
   - Validar a existência de todos os campos obrigatórios
   - Fornecer mensagens de erro detalhadas para cada tipo de problema
   - Implementar fallbacks para valores ausentes quando possível

2. **Operações de Filesystem**:
   - Tratar erros de permissão
   - Implementar retry para operações que podem falhar temporariamente
   - Garantir limpeza adequada em caso de falha

3. **Processamento de Templates**:
   - Validar templates antes do processamento
   - Tratar erros de sintaxe em templates
   - Fornecer mensagens de erro com contexto sobre o problema

4. **Operações do Clasp**:
   - Tratar erros de autenticação
   - Implementar retry para falhas de rede
   - Fornecer instruções detalhadas em caso de falha

### 3.2. Implementação de Sistema de Logging Melhorado

1. **Níveis de Log Detalhados**:
   - ERROR: Erros que impedem a execução
   - WARN: Problemas que não impedem a execução, mas podem causar comportamento inesperado
   - INFO: Informações gerais sobre o processo
   - DEBUG: Informações detalhadas para depuração
   - VERBOSE: Informações extremamente detalhadas

2. **Formatação de Mensagens**:
   - Incluir timestamp em todas as mensagens
   - Formatar mensagens de erro com stack trace quando disponível
   - Usar cores para diferenciar níveis de log

## 4. Validação com Diferentes Configurações

### 4.1. Casos de Teste para Validação

1. **Projeto Simples**:
   - Um único projeto sem chaves de substituição
   - Ambiente único (dev ou prod)

2. **Projeto com Múltiplos Ambientes**:
   - Um projeto com ambientes dev e prod
   - Diferentes IDs de script para cada ambiente

3. **Projeto com Chaves de Substituição**:
   - Projeto com chaves year e pdv
   - Múltiplas combinações de chaves

4. **Múltiplos Projetos**:
   - Vários projetos na mesma configuração
   - Projetos com diferentes estruturas

### 4.2. Processo de Validação

1. **Preparação**:
   - Criar configurações de teste para cada caso
   - Preparar diretórios e arquivos necessários

2. **Execução**:
   - Executar o processo de build para cada configuração
   - Executar o processo de deploy (sem push) para cada configuração

3. **Verificação**:
   - Validar a estrutura dos arquivos gerados
   - Verificar a substituição correta de variáveis
   - Confirmar a presença de informações de versão

## Cronograma de Implementação

| Tarefa | Tempo Estimado | Prioridade |
|--------|----------------|------------|
| Testes para Módulo de Configuração | 2-3 dias | Alta |
| Testes para Módulo de Templates | 2-3 dias | Alta |
| Testes para Módulo de Filesystem | 1-2 dias | Média |
| Testes para Módulo de Versionamento | 1-2 dias | Média |
| Refatoração do Módulo de Deploy | 3-4 dias | Alta |
| Refatoração do Módulo de Templates | 2-3 dias | Média |
| Melhoria no Tratamento de Exceções | 3-4 dias | Alta |
| Validação com Diferentes Configurações | 2-3 dias | Alta |

## Próximos Passos após Estabilização

Após a conclusão das tarefas de teste e estabilização, o próximo passo será a migração dos scripts do projeto villadaspedras para o novo sistema de build. Este processo incluirá:

1. **Análise dos scripts existentes**:
   - Identificar funcionalidades específicas
   - Mapear dependências e integrações

2. **Configuração do novo sistema**:
   - Criar arquivo de configuração YAML
   - Definir estrutura de projetos e ambientes

3. **Migração gradual**:
   - Começar com projetos mais simples
   - Validar cada migração antes de prosseguir

4. **Testes em ambiente real**:
   - Testar funcionalidades de virada de mês/ano
   - Validar integrações com outras planilhas

Este plano de testes e estabilização garantirá que o sistema de build esteja robusto e confiável antes da migração dos scripts do projeto villadaspedras, minimizando riscos e facilitando a transição.
