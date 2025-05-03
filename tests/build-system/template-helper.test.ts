/**
 * Testes para o módulo template-helper
 */

import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// Mocks para módulos externos
jest.mock('fs');
jest.mock('path');
jest.mock('fs-extra');
jest.mock('handlebars');

// Mock do logger - usando o mock centralizado
jest.mock('../../scripts/build-system/logger.js', () => {
  return jest.requireActual('../mocks/logger.mock.js');
});

// Importar módulos mockados
import fs from 'fs';
import path from 'path';
import fsExtra from 'fs-extra';
import Handlebars from 'handlebars';
// Não importar o logger diretamente

// Importar o módulo a ser testado
// @ts-ignore - Importando módulo JavaScript em TypeScript
import * as templateHelper from '../../scripts/build-system/template-helper.js';

describe('Template Helper', () => {
  // Configurar mocks antes de cada teste
  beforeEach(() => {
    // Limpar todos os mocks
    jest.clearAllMocks();

    // Mock para fs.existsSync
    (fs.existsSync as any).mockReturnValue(true);

    // Mock para fs.readFileSync
    (fs.readFileSync as any).mockImplementation((path: string) => {
      if (path.includes('version.json')) {
        return JSON.stringify({ version: '1.0.0', date: '2025-05-01' });
      }
      if (path.includes('.hbs')) {
        return 'Template: {{version}} {{versionDate}}';
      }
      return '';
    });

    // Mock para path.resolve
    (path.resolve as any).mockImplementation((...args: string[]) => args.join('/'));

    // Mock para fs-extra.ensureDirSync
    (fsExtra.ensureDirSync as any).mockImplementation(() => {});

    // Mock para fs.writeFileSync
    (fs.writeFileSync as any).mockImplementation(() => {});

    // Mock para Handlebars
    (Handlebars.compile as any).mockImplementation((template: string) => {
      return (context: any) => {
        let result = template;
        for (const key in context) {
          result = result.replace(new RegExp(`{{${key}}}`, 'g'), context[key]);
        }
        return result;
      };
    });

    // Mock para registerHelper
    (Handlebars.registerHelper as any).mockImplementation(() => {});
  });

  // Testes para loadVersionInfo
  it('deve carregar informações de versão do arquivo version.json', () => {
    // Configurar o mock para retornar os dados de versão
    const versionData = { version: '1.0.0', date: '2025-05-01' };
    (fs.readFileSync as any).mockReturnValueOnce(JSON.stringify(versionData));

    // Chamar a função
    const result = templateHelper.loadVersionInfo();

    // Verificar se fs.existsSync foi chamado
    expect(fs.existsSync).toHaveBeenCalled();

    // Verificar se fs.readFileSync foi chamado
    expect(fs.readFileSync).toHaveBeenCalled();

    // Verificar se o resultado é o esperado
    expect(result).toEqual(versionData);
  });

  it('deve retornar informações padrão quando o arquivo não existe', () => {
    // Configurar o mock para retornar false
    (fs.existsSync as any).mockReturnValueOnce(false);

    // Chamar a função
    const result = templateHelper.loadVersionInfo();

    // Verificar se o resultado é o esperado
    expect(result).toHaveProperty('version');
    expect(result).toHaveProperty('date');
  });

  // Testes para processTemplate
  it('deve processar um template com informações de versão', () => {
    // Chamar a função
    templateHelper.processTemplate('template.hbs', 'output.js', {});

    // Verificar se as funções esperadas foram chamadas
    expect(fs.readFileSync).toHaveBeenCalled();
    expect(Handlebars.compile).toHaveBeenCalled();
    expect(fsExtra.ensureDirSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('deve lidar com template não encontrado', () => {
    // Limpar todas as chamadas anteriores
    jest.clearAllMocks();

    // Configurar o mock para retornar false para o template
    (fs.existsSync as any).mockReturnValue(false);

    // Chamar a função
    templateHelper.processTemplate('template.hbs', 'output.js', {});

    // Verificar que o arquivo de saída não foi escrito
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});

