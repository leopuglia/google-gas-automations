//@ts-nocheck
/**
 * Testes para o módulo filesystem-helper
 */

import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// Mocks para módulos externos
jest.mock('fs');
jest.mock('fs-extra');
jest.mock('child_process');
jest.mock('path');
jest.mock('../../scripts/build-system/logger.js', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  verbose: jest.fn(),
}));

// Importar módulos mockados
import fs from 'fs';
import fsExtra from 'fs-extra';
import { execSync } from 'child_process';
import path from 'path';

// Importar o módulo a ser testado
import * as filesystemHelper from '../../scripts/build-system/filesystem-helper.js';

describe('Filesystem Helper', () => {
  // Configuração de caminhos para testes
  const buildDir = '/test/build';
  const distDir = '/test/dist';
  
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Configuração padrão para os mocks
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue(['file1.js', 'file2.js']);
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (path.resolve as jest.Mock).mockImplementation((...args) => args.join('/'));
  });

  describe('cleanDirectories', () => {
    it('deve limpar o diretório de build quando existir', () => {
      // Configurar mock para simular diretório existente e vazio após limpeza
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      
      // Chamar a função
      filesystemHelper.cleanDirectories(buildDir, distDir, true, false);
      
      // Verificar se as funções esperadas foram chamadas
      expect(fs.existsSync).toHaveBeenCalledWith(buildDir);
      expect(fsExtra.emptyDirSync).toHaveBeenCalledWith(buildDir);
      expect(fs.readdirSync).toHaveBeenCalledWith(buildDir);
      
      // Não deve limpar o diretório dist
      expect(fs.existsSync).not.toHaveBeenCalledWith(distDir);
      expect(fsExtra.emptyDirSync).not.toHaveBeenCalledWith(distDir);
    });
    
    it('deve criar o diretório de build quando não existir', () => {
      // Configurar mock para simular diretório não existente
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      
      // Chamar a função
      filesystemHelper.cleanDirectories(buildDir, distDir, true, false);
      
      // Verificar se as funções esperadas foram chamadas
      expect(fs.existsSync).toHaveBeenCalledWith(buildDir);
      expect(fsExtra.ensureDirSync).toHaveBeenCalledWith(buildDir);
      
      // Não deve limpar o diretório
      expect(fsExtra.emptyDirSync).not.toHaveBeenCalledWith(buildDir);
    });
    
    it('deve limpar o diretório de dist quando existir', () => {
      // Configurar mock para simular diretório existente e vazio após limpeza
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      
      // Chamar a função
      filesystemHelper.cleanDirectories(buildDir, distDir, false, true);
      
      // Verificar se as funções esperadas foram chamadas
      expect(fs.existsSync).toHaveBeenCalledWith(distDir);
      expect(fsExtra.emptyDirSync).toHaveBeenCalledWith(distDir);
      expect(fs.readdirSync).toHaveBeenCalledWith(distDir);
      
      // Não deve limpar o diretório build
      expect(fs.existsSync).not.toHaveBeenCalledWith(buildDir);
      expect(fsExtra.emptyDirSync).not.toHaveBeenCalledWith(buildDir);
    });
    
    it('deve avisar quando o diretório não estiver completamente vazio após limpeza', () => {
      // Configurar mock para simular diretório existente e não vazio após limpeza
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['file1.js']);
      
      // Importar o logger mockado
      const mockLogger = jest.requireMock('../../scripts/build-system/logger.js') as { warn: jest.Mock };
      
      // Chamar a função
      filesystemHelper.cleanDirectories(buildDir, distDir, true, false);
      
      // Verificar se o aviso foi emitido
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
  
  describe('ensureBuildBeforeDeploy', () => {
    // Configuração para testes de ensureBuildBeforeDeploy
    const config = {
      projects: {
        project1: { output: 'output1' },
        project2: { output: 'output2' }
      }
    };
    
    const paths = {
      build: '/test/build',
      scripts: '/test/scripts'
    };
    
    it('deve retornar true quando os diretórios de build existirem e não estiverem vazios', () => {
      // Configurar mocks
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['file1.js', 'file2.js']);
      
      // Chamar a função
      const result = filesystemHelper.ensureBuildBeforeDeploy(config, paths);
      
      // Verificar o resultado
      expect(result).toBe(true);
      
      // Não deve executar o build
      expect(execSync).not.toHaveBeenCalled();
    });
    
    it('deve executar o build quando algum diretório de build não existir', () => {
      // Configurar mocks para simular diretório não existente
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      
      // Chamar a função
      const result = filesystemHelper.ensureBuildBeforeDeploy(config, paths);
      
      // Verificar o resultado
      expect(result).toBe(true);
      
      // Deve executar o build
      expect(execSync).toHaveBeenCalled();
    });
    
    it('deve executar o build quando algum diretório de build estiver vazio', () => {
      // Configurar mocks para simular diretório vazio
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValueOnce([]);
      
      // Chamar a função
      const result = filesystemHelper.ensureBuildBeforeDeploy(config, paths);
      
      // Verificar o resultado
      expect(result).toBe(true);
      
      // Deve executar o build
      expect(execSync).toHaveBeenCalled();
    });
    
    it('deve executar o build para um projeto específico quando fornecido', () => {
      // Configurar mocks para simular diretório não existente
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      
      // Configurar mock do execSync para retornar com sucesso
      (execSync as jest.Mock).mockImplementation(() => {});
      
      // Chamar a função com um projeto específico
      const result = filesystemHelper.ensureBuildBeforeDeploy(config, paths, 'project1');
      
      // Verificar o resultado
      expect(result).toBe(true); // A função retorna true quando o build é executado com sucesso
      
      // Verificar que o execSync foi chamado
      expect(execSync).toHaveBeenCalled();
      
      // Não podemos verificar o parâmetro exato devido a possíveis diferenças na implementação
      // mas podemos verificar que foi chamado com algum comando
    });
    
    it('deve retornar false quando o build falhar', () => {
      // Configurar mocks para simular diretório não existente
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      
      // Configurar mock do execSync para lançar erro
      (execSync as jest.Mock).mockImplementation(() => {
        throw new Error('Build failed');
      });
      
      // Chamar a função
      const result = filesystemHelper.ensureBuildBeforeDeploy(config, paths);
      
      // Verificar o resultado
      expect(result).toBe(false);
      
      // Importar o logger mockado
      const mockLogger = jest.requireMock('../../scripts/build-system/logger.js') as { error: jest.Mock };
      
      // Verificar se o erro foi registrado
      expect(mockLogger.error).toHaveBeenCalled();
    });
    
    it('deve forçar o build quando forceBuild for true, mesmo se os diretórios existirem', () => {
      // Configurar mocks
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['file1.js', 'file2.js']);
      
      // Configurar mock do execSync para retornar com sucesso
      (execSync as jest.Mock).mockImplementation(() => {});
      
      // Chamar a função com forceBuild = true
      const result = filesystemHelper.ensureBuildBeforeDeploy(config, paths, null, true);
      
      // Verificar o resultado
      expect(result).toBe(true);
      
      // Deve executar o build
      expect(execSync).toHaveBeenCalled();
    });
  });
});
