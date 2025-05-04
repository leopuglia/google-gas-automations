import { describe, expect, it, test } from '@jest/globals';
import { formatarData, formatarMoeda, validarEmail } from '../src/commons/utils';

describe('Funções Utilitárias', () => {
  describe('formatarData', () => {
    // Casos básicos usando test.each para múltiplos casos de teste
    test.each([
      ['15/01/2023', new Date(2023, 0, 15)],  // Data normal
      ['01/01/2023', new Date(2023, 0, 1)],    // Dia com um dígito
      ['10/10/2023', new Date(2023, 9, 10)],   // Mês com dois dígitos
      ['01/01/2000', new Date(2000, 0, 1)],    // Virada do milênio
      ['31/12/2023', new Date(2023, 11, 31)],  // Último dia do ano
    ])('obter %s <= de %s', (esperado, data) => {
      expect(formatarData(data)).toBe(esperado);
    });

    // Testes de borda
    test.each([
      ['01/01/1900', new Date(1900, 0, 1)],  // Data antiga
      ['31/12/2100', new Date(2100, 11, 31)], // Data futura
    ])('obter %s <= de %s', (esperado, data) => {
      expect(formatarData(data)).toBe(esperado);
    });

    it('null, undefined e string => lançar exceção', () => {
      // @ts-expect-error - Testando comportamento com valor inválido
      expect(() => formatarData(null)).toThrow();
      // @ts-expect-error - Testando comportamento com valor inválido
      expect(() => formatarData(undefined)).toThrow();
      // @ts-expect-error - Testando comportamento com valor inválido
      expect(() => formatarData('não é uma data')).toThrow();
    });
  });

  describe('formatarMoeda', () => {
    const padraoRegex = /R\$\s\d{1,3}(\.\d{3})*,\d{2}/;
    // Casos básicos usando test.each
    test.each([
      ['R$ 1.234,56', 1234.56],      // Valor normal
      ['R$ 0,00', 0],                // Zero
      ['R$ 1,00', 1],                // Valor inteiro
      ['R$ 0,50', 0.5],              // Valor decimal
      ['R$ 1.000.000,00', 1000000],  // Valor grande com separadores
      ['R$ 0,01', 0.01],             // Menor valor possível (um centavo)
    ])('obter %s <= de %s', (esperado, valor) => {
      expect(esperado).toMatch(padraoRegex);
      expect(formatarMoeda(valor)).toMatch(padraoRegex);
    });

    // Testes de borda
    test.each([
      ['-R$ 1.234,56', -1234.56],
      ['R$ 1.234,57', 1234.567],
      ['R$ 1.234,56', 1234.564],
    ])('obter %s <= de %s', (esperado, valor) => {
      expect(esperado).toMatch(padraoRegex);
      expect(formatarMoeda(valor)).toMatch(padraoRegex);
    });

    it('arredondar valores decimais => valores com duas casas', () => {
      expect(formatarMoeda(1234.567)).toMatch(padraoRegex); // 1234.567 como "R$ 1.234,57" (arredondado para cima)
      expect(formatarMoeda(1234.564)).toMatch(padraoRegex); // 1234.564 como "R$ 1.234,56" (arredondado para baixo)
    });

    it('null, undefined e string => lançar exceção', () => {
      // @ts-expect-error - Testando comportamento com valor inválido
      expect(() => formatarMoeda(null)).toThrow();
      // @ts-expect-error - Testando comportamento com valor inválido
      expect(() => formatarMoeda(undefined)).toThrow();
      // @ts-expect-error - Testando comportamento com valor inválido
      expect(() => formatarMoeda('não é um número')).toThrow();
    });
  });

  describe('validarEmail', () => {
    // Casos válidos usando test.each
    test.each([
      ['usuario@exemplo.com', true],
      ['usuario.nome@dominio.com.br', true],
      ['usuario+tag@gmail.com', true],
      ['usuario-nome@dominio.co', true],
      ['usuario_nome@dominio.info', true],
      ['123456@dominio.com', true],
      ['usuario@dominio.technology', true],
    ])('email valido %s => como %s', (email, esperado) => {
      expect(validarEmail(email)).toBe(esperado);
    });

    // Casos inválidos usando test.each
    test.each([
      ['usuario@', false],
      ['usuario', false],
      ['@exemplo.com', false],
      ['usuario@dominio', false],
      ['usuario@.com', false],
      ['usuario@dominio..com', false],
      ['usuario@dominio.', false],  // TLD ausente (termina com ponto)
      ['usuario@dominio.c', false], // TLD com apenas 1 caractere
      ['usuario@teste.', false],    // Outro caso de TLD ausente
      ['usuario@a.b', false],       // Domínio com TLD muito curto
      ['usuario@a.', false],        // Domínio terminando com ponto
      ['usuario@.a', false],        // Domínio começando com ponto
      ['usuario@a..b', false],      // Domínio com pontos consecutivos
      ['usuario@a.b.', false],      // Domínio terminando com ponto após TLD
      ['   ', false],               // Email contendo apenas espaços em branco
    ])('email invalido %s => como %s', (email, esperado) => {
      expect(validarEmail(email)).toBe(esperado);
    });

    // Testes de borda
    it('null, undefined e string vazia => lançar exceção', () => {
      // @ts-expect-error - Testando comportamento com valor inválido
      expect(() => validarEmail(null)).toThrow();
      // @ts-expect-error - Testando comportamento com valor inválido
      expect(() => validarEmail(undefined)).toThrow();
      expect(() => validarEmail('')).toThrow();
    });

    it('tipos não-string => false', () => {
      // @ts-expect-error - Testando comportamento com valor inválido
      expect(validarEmail(123)).toBe(false); // número como false
      // @ts-expect-error - Testando comportamento com valor inválido
      expect(validarEmail({})).toBe(false); // objeto vazio como false
      // @ts-expect-error - Testando comportamento com valor inválido
      expect(validarEmail([])).toBe(false); // array vazio como false
    });

    it('email muito longo => true', () => {
      const emailMuitoLongo = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com';
      expect(validarEmail(emailMuitoLongo)).toBe(true); // Email com 203 caracteres como true
    });
  });
});
