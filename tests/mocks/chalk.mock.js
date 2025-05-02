/**
 * Mock para o módulo chalk
 * 
 * Este mock simula as funções do chalk para testes
 */

// Função que retorna a string original sem formatação
const passThrough = (str) => str;

// Criar funções de estilo que não fazem nada
const createStyler = () => {
  const styler = (str) => str;
  
  // Adicionar propriedades aninhadas
  styler.bold = passThrough;
  styler.italic = passThrough;
  styler.underline = passThrough;
  styler.inverse = passThrough;
  styler.strikethrough = passThrough;
  
  return styler;
};

// Exportar funções de cor mockadas
const chalk = {
  // Cores básicas
  black: createStyler(),
  red: createStyler(),
  green: createStyler(),
  yellow: createStyler(),
  blue: createStyler(),
  magenta: createStyler(),
  cyan: createStyler(),
  white: createStyler(),
  gray: createStyler(),
  grey: createStyler(),
  
  // Cores de fundo
  bgBlack: createStyler(),
  bgRed: createStyler(),
  bgGreen: createStyler(),
  bgYellow: createStyler(),
  bgBlue: createStyler(),
  bgMagenta: createStyler(),
  bgCyan: createStyler(),
  bgWhite: createStyler(),
  
  // Estilos
  bold: createStyler(),
  dim: createStyler(),
  italic: createStyler(),
  underline: createStyler(),
  inverse: createStyler(),
  hidden: createStyler(),
  strikethrough: createStyler(),
  
  // Método para criar um novo chalk
  Instance: function() {
    return chalk;
  }
};

export default chalk;
