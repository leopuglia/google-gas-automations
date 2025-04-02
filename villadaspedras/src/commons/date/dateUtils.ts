/** 
 * Villa das Pedras: Funções de manipulação de datas
 * 
 * Versão: 1.0.0 | Data: 05/09/2024
 * 
 * Autor: Leonardo Puglia
 * 
 * Descrição: Funções auxiliares para manipulação de datas
 */

/**
 * Retorna a data da primeira terça-feira do mês
 * @param date Data de referência
 * @returns Data da primeira terça-feira do mês
 */
export function getFirstTuesday(date: Date = new Date()): Date {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDay.getDay();
  
  // 2 = terça-feira (0 = domingo, 1 = segunda, etc.)
  const daysUntilTuesday = (dayOfWeek <= 2) ? 2 - dayOfWeek : 9 - dayOfWeek;
  
  return new Date(date.getFullYear(), date.getMonth(), 1 + daysUntilTuesday);
}

/**
 * Retorna o mês anterior
 * @param date Data de referência
 * @returns Data do mês anterior
 */
export function getPreviousMonth(date: Date = new Date()): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (month === 0) {
    // Janeiro -> Dezembro do ano anterior
    return new Date(year - 1, 11, 1);
  } else {
    // Qualquer outro mês -> Mês anterior do mesmo ano
    return new Date(year, month - 1, 1);
  }
}

/**
 * Retorna o próximo mês
 * @param date Data de referência
 * @returns Data do próximo mês
 */
export function getNextMonth(date: Date = new Date()): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (month === 11) {
    // Dezembro -> Janeiro do próximo ano
    return new Date(year + 1, 0, 1);
  } else {
    // Qualquer outro mês -> Próximo mês do mesmo ano
    return new Date(year, month + 1, 1);
  }
}

/**
 * Formata o nome do mês fornecido no formato "yyyy-MM"
 * @param date Data desejada ou data de hoje se nulo
 * @returns Nome do mês formatado
 */
export function getMonthName(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Mês é baseado em zero (0-11)
  
  return `${year}-${month.toString().padStart(2, '0')}`;
}
