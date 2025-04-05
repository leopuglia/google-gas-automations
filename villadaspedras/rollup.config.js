const typescript = require('@rollup/plugin-typescript');
const path = require('path');

// Definir apenas as entradas principais (sem scripts de build)

// Configuração para a biblioteca principal
const libraryConfig = {
  input: 'src/example/Main.ts',
  output: {
    dir: `dist/example`,
    format: 'cjs',
    exports: 'named'
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      include: ['src/example/**/*.ts', 'src/commons/**/*.ts'],
      exclude: ['scripts/**/*'],
      outDir: `dist/example`,
      target: 'es2019',
      module: 'esnext',
      noEmitOnError: false,
      skipLibCheck: true,
      sourceMap: false
    })
  ],
  onwarn(warning, warn) {
    if (warning.code === 'THIS_IS_UNDEFINED' ||
        warning.code === 'CIRCULAR_DEPENDENCY' ||
        warning.code === 'EMPTY_BUNDLE') {
      return;
    }
    warn(warning);
  }
};

// Configuração para planilha de salário
const salarioConfig = {
  input: 'src/planilha-salario/Main.ts',
  output: {
    dir: `dist/${year}-salario`,
    format: 'cjs',
    exports: 'named'
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      include: ['src/planilha-salario/**/*.ts', 'src/commons/**/*.ts'],
      exclude: ['scripts/**/*'],
      outDir: `dist/${year}-salario`,
      target: 'es2019',
      module: 'esnext',
      noEmitOnError: false,
      skipLibCheck: true,
      sourceMap: false
    })
  ],
  onwarn(warning, warn) {
    if (warning.code === 'THIS_IS_UNDEFINED' ||
        warning.code === 'CIRCULAR_DEPENDENCY' ||
        warning.code === 'EMPTY_BUNDLE') {
      return;
    }
    warn(warning);
  }
};

// Configuração para planilha de consumo
const consumoConfig = {
  input: 'src/planilha-consumo/Main.ts',
  output: {
    dir: `dist/${year}-${pdv}-consumo`,
    format: 'cjs',
    exports: 'named'
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      include: ['src/planilha-consumo/**/*.ts', 'src/commons/**/*.ts'],
      exclude: ['scripts/**/*'],
      outDir: `dist/${year}-${pdv}-consumo`,
      target: 'es2019',
      module: 'esnext',
      noEmitOnError: false,
      skipLibCheck: true,
      sourceMap: false
    })
  ],
  onwarn(warning, warn) {
    if (warning.code === 'THIS_IS_UNDEFINED' ||
        warning.code === 'CIRCULAR_DEPENDENCY' ||
        warning.code === 'EMPTY_BUNDLE') {
      return;
    }
    warn(warning);
  }
};

module.exports = [libraryConfig, salarioConfig, consumoConfig];
