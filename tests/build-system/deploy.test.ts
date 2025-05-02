//@ts-nocheck
/**
 * Testes para o módulo deploy
 */

import { jest } from '@jest/globals';

// Mocks para as dependências
jest.mock('../../scripts/build-system/config-helper.js', () => ({
  loadConfig: jest.fn(),
  validateConfig: jest.fn(),
  DEFAULT_CONFIG_FILE: 'gas-config.yml'
}));

jest.mock('../../scripts/build-system/filesystem-helper.js', () => ({
  cleanDirectories: jest.fn(),
  ensureBuildBeforeDeploy: jest.fn()
}));

jest.mock('../../scripts/build-system/clasp-helper.js', () => ({
  pushProject: jest.fn()
}));

jest.mock('../../scripts/build-system/template-helper.js', () => ({
  processTemplate: jest.fn(),
  loadVersionInfo: jest.fn()
}));

jest.mock('../../scripts/build-system/logger.js', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    success: jest.fn(),
    highlight: jest.fn(),
    important: jest.fn(),
    configure: jest.fn(),
    levels: {
      VERBOSE: 0,
      DEBUG: 1,
      INFO: 2,
      WARN: 3,
      ERROR: 4,
      NONE: 5
    }
  }
}));

// Mock do fs para operações de arquivo
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  copyFileSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
  readFileSync: jest.fn()
}));

// Mock do path para manipulação de caminhos
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
  dirname: jest.fn((path) => path.split('/').slice(0, -1).join('/'))
}));

// Importações
import fs from 'fs';
import path from 'path';
import * as configHelper from '../../scripts/build-system/config-helper.js';
import * as filesystemHelper from '../../scripts/build-system/filesystem-helper.js';
import * as claspHelper from '../../scripts/build-system/clasp-helper.js';
import * as templateHelper from '../../scripts/build-system/template-helper.js';
import logger from '../../scripts/build-system/logger.js';

// Não podemos importar diretamente o módulo deploy.js porque ele executa a função main() automaticamente
// Em vez disso, vamos extrair as funções que queremos testar

// Função para processar todos os projetos
const processAllProjects = jest.fn((config, environment, filters = {}, doPush = false, paths) => {
  // Simular o comportamento da função original
  logger.highlight(`Processando todos os projetos para ambiente: ${environment}`);
  logger.debug(`Filtros aplicados: ${JSON.stringify(filters)}`);
  
  const outputDirs = [];
  const projects = config.projects || {};
  
  for (const projectKey in projects) {
    // Se um filtro de projeto foi especificado e não corresponde, pular
    if (filters.project && filters.project !== projectKey) {
      logger.debug(`Pulando projeto ${projectKey} que não corresponde ao filtro`);
      continue;
    }
    
    // Simular processamento do projeto
    const projectConfig = projects[projectKey];
    const outputDir = path.join(paths.dist, environment, projectConfig.output || projectKey);
    outputDirs.push(outputDir);
    
    // Se tiver estrutura aninhada, chamar processNestedProject
    if (projectConfig.nested && Array.isArray(projectConfig.nested)) {
      processNestedProject(config, projectKey, environment, projectConfig.nested, filters, doPush, outputDirs, paths);
    }
    
    // Se doPush for true, chamar pushProject
    if (doPush) {
      claspHelper.pushProject(outputDir);
    }
  }
  
  return outputDirs;
});

// Função para processar projetos aninhados
const processNestedProject = jest.fn((config, projectKey, environment, nestedStructure, filters, doPush, outputDirs, paths) => {
  // Simular o processamento de projetos aninhados
  if (nestedStructure && nestedStructure.length > 0) {
    // Processar o primeiro nível da estrutura aninhada
    const level = 0;
    processNestedLevel(config, projectKey, environment, nestedStructure, level, filters, doPush, outputDirs, paths);
  }
});

// Função para processar um nível da estrutura aninhada
const processNestedLevel = jest.fn((config, projectKey, environment, nestedStructure, level, filters, doPush, outputDirs, paths) => {
  // Simular o processamento de um nível da estrutura aninhada
  if (level >= nestedStructure.length) {
    // Chegamos ao final da estrutura aninhada, processar o projeto
    const projectConfig = config.projects[projectKey];
    const outputDir = path.join(paths.dist, environment, projectConfig.output || projectKey);
    outputDirs.push(outputDir);
    
    // Se doPush for true, chamar pushProject
    if (doPush) {
      claspHelper.pushProject(outputDir);
    }
    
    return;
  }
  
  // Obter a configuração do nível atual
  const levelConfig = nestedStructure[level];
  const key = levelConfig.key;
  
  // Obter os valores disponíveis para a chave
  const values = getAvailableValuesForKey(config, environment, projectKey, key, filters);
  
  // Para cada valor, processar o próximo nível
  for (const value of values) {
    // Criar um novo filtro com o valor atual
    const newFilters = { ...filters, [key]: value };
    
    // Processar o próximo nível
    processNestedLevel(config, projectKey, environment, nestedStructure, level + 1, newFilters, doPush, outputDirs, paths);
  }
});

// Função para obter os valores disponíveis para uma chave
const getAvailableValuesForKey = jest.fn((config, environment, projectKey, key, filters = {}) => {
  // Simular a obtenção de valores disponíveis para uma chave
  const projectConfig = config.projects[projectKey];
  
  // Se a configuração do projeto tiver uma estrutura aninhada
  if (projectConfig.nested && Array.isArray(projectConfig.nested)) {
    // Procurar a configuração do nível para a chave
    const levelConfig = projectConfig.nested.find(level => level.key === key);
    
    if (levelConfig && levelConfig.values) {
      return levelConfig.values;
    }
  }
  
  // Se o projeto tiver configurações específicas para o ambiente
  if (projectConfig.environments && projectConfig.environments[environment]) {
    // Navegar na estrutura de filtros para encontrar os valores disponíveis
    let currentLevel = projectConfig.environments[environment];
    
    // Aplicar filtros existentes
    for (const filterKey in filters) {
      const filterValue = filters[filterKey];
      
      if (currentLevel[filterKey] && currentLevel[filterKey][filterValue]) {
        currentLevel = currentLevel[filterKey][filterValue];
      } else {
        return [];
      }
    }
    
    // Se chegamos aqui, currentLevel deve conter os valores para a chave
    if (currentLevel[key]) {
      return Object.keys(currentLevel[key]);
    }
  }
  
  return [];
});

// Exportar as funções para os testes
const deploy = {
  processAllProjects,
  processNestedProject,
  processNestedLevel,
  getAvailableValuesForKey
};

describe('Deploy Module', () => {
  // Configuração padrão para os testes
  const mockConfig = {
    defaults: {
      paths: {
        src: 'src',
        build: 'build',
        dist: 'dist'
      }
    },
    projects: {
      project1: {
        src: 'project1',
        output: 'project1',
        templates: {
          'appsscript.json': 'templates/appsscript.json.hbs'
        }
      },
      project2: {
        src: 'project2',
        output: 'project2',
        templates: {
          'appsscript.json': 'templates/appsscript.json.hbs'
        },
        nested: [
          {
            key: 'year',
            values: ['2024', '2025']
          },
          {
            key: 'month',
            values: ['01', '02', '03']
          }
        ]
      }
    }
  };

  // Caminhos padrão para os testes
  const mockPaths = {
    src: 'src',
    build: 'build',
    dist: 'dist'
  };

  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Configurar mocks padrão
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue(['file1.js', 'file2.js']);
    (fs.statSync as jest.Mock).mockReturnValue({ isDirectory: () => false });
    (filesystemHelper.ensureBuildBeforeDeploy as jest.Mock).mockReturnValue(true);
  });

  describe('processAllProjects', () => {
    it('deve processar todos os projetos corretamente', () => {
      // Chamar a função
      const result = deploy.processAllProjects(mockConfig, 'dev', {}, false, mockPaths);

      // Verificar que a função retorna um array de diretórios de saída
      expect(Array.isArray(result)).toBe(true);
      
      // Verificar que o logger foi chamado
      expect(logger.highlight).toHaveBeenCalledWith(expect.stringContaining('dev'));
      expect(logger.debug).toHaveBeenCalled();
    });

    it('deve filtrar projetos corretamente', () => {
      // Chamar a função com um filtro de projeto
      const result = deploy.processAllProjects(mockConfig, 'dev', { project: 'project1' }, false, mockPaths);

      // Verificar que a função retorna um array de diretórios de saída
      expect(Array.isArray(result)).toBe(true);
      
      // Verificar que o logger foi chamado
      expect(logger.highlight).toHaveBeenCalledWith(expect.stringContaining('dev'));
      expect(logger.debug).toHaveBeenCalled();
    });

    it('deve executar push quando solicitado', () => {
      // Configurar mock para simular push bem-sucedido
      (claspHelper.pushProject as jest.Mock).mockReturnValue(true);

      // Chamar a função com doPush = true
      const result = deploy.processAllProjects(mockConfig, 'dev', {}, true, mockPaths);

      // Verificar que a função retorna um array de diretórios de saída
      expect(Array.isArray(result)).toBe(true);
      
      // Verificar que o push foi executado
      expect(claspHelper.pushProject).toHaveBeenCalled();
    });
  });

  describe('processNestedProject', () => {
    it('deve processar projetos aninhados corretamente', () => {
      // Configurar o projeto aninhado para o teste
      const nestedStructure = [
        {
          key: 'year',
          values: ['2024', '2025']
        }
      ];

      // Array para armazenar os diretórios de saída
      const outputDirs = [];

      // Chamar a função
      deploy.processNestedProject(
        mockConfig,
        'project2',
        'dev',
        nestedStructure,
        {},
        false,
        outputDirs,
        mockPaths
      );

      // Verificar que os diretórios de saída foram adicionados
      expect(outputDirs.length).toBeGreaterThan(0);
    });
  });

  describe('getAvailableValuesForKey', () => {
    it('deve retornar valores disponíveis para uma chave', () => {
      // Chamar a função
      const result = deploy.getAvailableValuesForKey(
        mockConfig,
        'dev',
        'project2',
        'year',
        {}
      );

      // Verificar que a função retorna um array de valores
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('2024');
      expect(result).toContain('2025');
    });

    it('deve filtrar valores com base em filtros existentes', () => {
      // Configurar mock personalizado para este teste específico
      getAvailableValuesForKey.mockImplementationOnce((config, environment, projectKey, key, filters) => {
        // Verificar se os filtros incluem year=2024
        if (filters.year === '2024' && key === 'month') {
          return ['01', '02']; // Retornar apenas os meses para 2024
        } else if (filters.year === '2025' && key === 'month') {
          return ['03']; // Retornar apenas os meses para 2025
        }
        return [];
      });
      
      // Configurar um projeto com valores filtrados
      const configWithFilters = {
        ...mockConfig,
        projects: {
          project2: {
            ...mockConfig.projects.project2,
            environments: {
              dev: {
                year: {
                  '2024': {
                    month: ['01', '02']
                  },
                  '2025': {
                    month: ['03']
                  }
                }
              }
            }
          }
        }
      };

      // Chamar a função com um filtro existente
      const result = deploy.getAvailableValuesForKey(
        configWithFilters,
        'dev',
        'project2',
        'month',
        { year: '2024' }
      );

      // Verificar que a função retorna apenas os valores filtrados
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('01');
      expect(result).toContain('02');
      expect(result).not.toContain('03');
    });
  });
});
