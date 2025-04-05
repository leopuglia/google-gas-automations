import { DateUtils } from '../../../src/core/dateUtils';
import { describe, beforeEach, it, expect } from '@jest/globals';

describe('DateUtils', () => {
  let dateUtils: DateUtils;

  beforeEach(() => {
    dateUtils = new DateUtils();
  });

  describe('getMonthName', () => {
    it('should return month name in uppercase', () => {
      const date = new Date(2023, 0, 1); // Janeiro
      expect(dateUtils.getMonthName(date)).toBe('JANEIRO');
    });
  });

  describe('getNextMonth', () => {
    it('should return next month', () => {
      const date = new Date(2023, 0, 1); // Janeiro
      const nextMonth = dateUtils.getNextMonth(date);
      expect(nextMonth.getMonth()).toBe(1); // Fevereiro
    });

    it('should handle year transition', () => {
      const date = new Date(2023, 11, 1); // Dezembro
      const nextMonth = dateUtils.getNextMonth(date);
      expect(nextMonth.getMonth()).toBe(0); // Janeiro
      expect(nextMonth.getFullYear()).toBe(2024);
    });
  });

  describe('getPreviousMonth', () => {
    it('should return previous month', () => {
      const date = new Date(2023, 1, 1); // Fevereiro
      const prevMonth = dateUtils.getPreviousMonth(date);
      expect(prevMonth.getMonth()).toBe(0); // Janeiro
    });

    it('should handle year transition', () => {
      const date = new Date(2023, 0, 1); // Janeiro
      const prevMonth = dateUtils.getPreviousMonth(date);
      expect(prevMonth.getMonth()).toBe(11); // Dezembro
      expect(prevMonth.getFullYear()).toBe(2022);
    });
  });

  describe('getFirstTuesday', () => {
    it('should return first Tuesday of month', () => {
      // Janeiro 2023 começa no Domingo (1/1/2023)
      const date = new Date(2023, 0, 1);
      const firstTuesday = dateUtils.getFirstTuesday(date);
      expect(firstTuesday.getDate()).toBe(3); // 3/1/2023
      expect(firstTuesday.getDay()).toBe(2); // Terça-feira
    });

    it('should handle months starting after Tuesday', () => {
      // Setembro 2023 começa na Sexta (1/9/2023)
      const date = new Date(2023, 8, 1);
      const firstTuesday = dateUtils.getFirstTuesday(date);
      expect(firstTuesday.getDate()).toBe(5); // 5/9/2023
    });
  });
});
