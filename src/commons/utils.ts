/**
 * Arquivo de funções utilitárias para o projeto
 */

/**
 * Formata uma data no padrão brasileiro (DD/MM/YYYY)
 * @param data Data a ser formatada
 * @returns String com a data formatada
 * @throws Error se o parâmetro não for uma data válida
 */
export function formatarData(data: Date): string {
  if (!(data instanceof Date) || isNaN(data.getTime())) {
    throw new Error('O parâmetro fornecido não é uma data válida');
  }

  // const dataLuxon = luxon.DateTime.fromJSDate(data);

  // return dataLuxon.toLocaleString(luxon.DateTime.DATE_SHORT, { locale: 'pt-br' });

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

/**
 * Formata um valor monetário no padrão brasileiro
 * @param valor Valor a ser formatado
 * @returns String com o valor formatado
 * @throws Error se o parâmetro não for um número válido
 */
export function formatarMoeda(valor: number): string {
  if (typeof valor !== 'number' || isNaN(valor)) {
    throw new Error('O parâmetro fornecido não é um número válido');
  }

  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Valida se uma string é um e-mail válido
 * @param email Email a ser validado
 * @returns Verdadeiro se for um email válido, falso caso contrário
 */
export function validarEmail(email: string): boolean {
  if (!email || email === undefined || email === '') {
    throw new Error('O parâmetro fornecido está nulo, undefined ou vazio');
  }

  if (typeof email !== 'string') {
    return false;
  }

  // Verifica se o email está vazio
  if (email.trim() === '') {
    return false;
  }

  // Regex básica para validar o formato geral do email
  const regexBasica = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexBasica.test(email)) {
    return false;
  }

  // Verificações adicionais
  const partes = email.split('@');
  const dominio = partes[1];

  // Verifica se há pontos duplos no domínio
  if (dominio.includes('..')) {
    return false;
  }

  // Verifica o TLD (Top Level Domain)
  const tld = dominio.split('.').pop() || '';
  if (tld.length < 2) {
    return false;
  }

  return true;
}
