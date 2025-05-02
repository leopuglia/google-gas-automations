// Utilitários de data para o projeto

import { IDateUtils } from '../models/types';

export class DateUtils implements IDateUtils {
  getMonthName(date: Date): string {
    return date.toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
  }

  getNextMonth(date: Date): Date {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    return newDate;
  }

  getPreviousMonth(date: Date): Date {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    return newDate;
  }

  getFirstTuesday(date: Date): Date {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = firstDay.getDay();
    const daysToTuesday = dayOfWeek <= 2 ? 2 - dayOfWeek : 9 - dayOfWeek;
    return new Date(firstDay.setDate(firstDay.getDate() + daysToTuesday));
  }
}
