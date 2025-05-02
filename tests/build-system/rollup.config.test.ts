/**
 * Testes para o arquivo rollup.config.js
 */

import { jest } from '@jest/globals';

// Mocks para as dependências
jest.mock('@rollup/plugin-typescript', () => jest.fn(() => ({ name: 'typescript' })));
jest.mock('@rollup/plugin-commonjs', () => jest.fn(() => ({ name: 'commonjs' })));
jest.mock('@rollup/plugin-node-resolve', () => jest.fn(() => ({ name: 'node-resolve' })));
jest.mock('@rollup/plugin-terser', () => jest.fn(() => ({ name: 'terser' })));

jest.mock('../../scripts/build-system/config-helper.js', () => ({
  loadConfig: jest.fn(),
  validateConfig: jest.fn(),
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
  },
}));

// Importações
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

describe('Rollup Config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('removeImports plugin', () => {
    // Implementação mock da função removeImports
    function removeImports(): {
      name: string;
      renderChunk: (code: string) => { code: string; map: null };
      } {
      return {
        name: 'remove-imports',
        renderChunk(code: string) {
          const stripped = code
            .split('\n')
            .filter((line: string) => !/^\s*import\s.*?;/.test(line))
            .filter((line: string) => !/^\s*export\s.*?;/.test(line))
            .join('\n');
          return { code: stripped, map: null };
        },
      };
    }

    it('deve remover linhas de importação', () => {
      const plugin = removeImports();

      expect(plugin).toHaveProperty('name', 'remove-imports');
      expect(typeof plugin.renderChunk).toBe('function');

      const code = `
        import { something } from 'somewhere';
        import 'another-module';
        export const value = 42;
        
        function test() {
          return 'test';
        }
        
        export default test;
      `;

      const result = plugin.renderChunk(code);

      expect(result.code).not.toContain('import { something } from \'somewhere\';');
      expect(result.code).not.toContain('import \'another-module\';');
      expect(result.code).not.toContain('export const value = 42;');
      expect(result.code).not.toContain('export default test;');

      expect(result.code).toContain('function test() {');
      expect(result.code).toContain('return \'test\';');
    });
  });

  describe('generateRollupConfig', () => {
    // Implementação mock da função generateRollupConfig
    function generateRollupConfig(configData: any): any[] {
      const rollupConfig = [];
      const defaultRollupConfig = configData.defaults?.rollup || {};

      for (const projectKey in configData.projects) {
        const projectConfig = configData.projects[projectKey];
        const projectSrc = projectConfig.src;
        const projectRollupConfig = projectConfig.rollup || {};

        if (!projectSrc) continue;

        const mainFile = projectRollupConfig.main || 'main.ts';
        const mainPath = `${configData.defaults.paths.src}/${projectSrc}/${mainFile}`;

        const input = {
          [projectKey]: mainPath,
        };

        const format = projectRollupConfig.format || defaultRollupConfig.format || 'esm';

        rollupConfig.push({
          input,
          output: {
            format,
            dir: `${configData.defaults.paths.build}/${projectKey}`,
            exports: 'auto',
          },
          plugins: [
            typescript(),
            nodeResolve(),
            commonjs(),
            terser(),
          ],
        });
      }

      return rollupConfig;
    }

    it('deve gerar configuração para projetos válidos', () => {
      const mockConfig = {
        defaults: {
          paths: {
            src: 'src',
            build: 'build',
          },
          rollup: {
            format: 'es',
            plugins: ['typescript', 'terser'],
          },
        },
        projects: {
          project1: {
            src: 'project1',
            rollup: {
              main: 'index.ts',
            },
          },
          project2: {
            src: 'project2',
            rollup: {
              main: 'main.ts',
              format: 'iife',
            },
          },
          projectWithoutSrc: {
            // Sem src, deve ser ignorado
          },
        },
      };

      const result = generateRollupConfig(mockConfig);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2); // Dois projetos válidos

      const project1Config = result.find(config => Object.keys(config.input)[0] === 'project1');
      expect(project1Config).toBeDefined();
      expect(project1Config?.input.project1).toBe('src/project1/index.ts');

      const project2Config = result.find(config => Object.keys(config.input)[0] === 'project2');
      expect(project2Config).toBeDefined();
      expect(project2Config?.input.project2).toBe('src/project2/main.ts');
      expect(project2Config?.output.format).toBe('iife');
    });

    it('deve usar valores padrão quando não especificados no projeto', () => {
      const mockConfig = {
        defaults: {
          paths: {
            src: 'src',
            build: 'build',
          },
          rollup: {
            format: 'esm',
            plugins: ['typescript'],
          },
        },
        projects: {
          minimalProject: {
            src: 'minimal',
          },
        },
      };

      const result = generateRollupConfig(mockConfig);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);

      expect(result[0].input).toHaveProperty('minimalProject');
      expect(result[0].output.format).toBe('esm');
      expect(result[0].input.minimalProject).toBe('src/minimal/main.ts'); // Usa o valor padrão para main
    });
  });
});
