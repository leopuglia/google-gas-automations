/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.mts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true
    }],
    '^.+\\.jsx?$': ['babel-jest', {
      presets: ['@babel/preset-env']
    }]
  },
  moduleNameMapper: {
    '^(\\.\\.?\\/.*)\\.js$': '$1',
    '^chalk$': '<rootDir>/tests/mocks/chalk.mock.js',
    '\\.\\.\\/logger\\.js$': '<rootDir>/tests/mocks/logger.mock.js'
  },
  testMatch: ['**/__tests__/**/*.{js,ts}?(x)', '**/?(*.)+(spec|test).{js,ts}?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/tests/mocks/gas.mock.js'],
  // Arquivo de teardown global para limpar recursos após os testes
  globalTeardown: '<rootDir>/tests/teardown.js',
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{js,ts}',
    '<rootDir>/scripts/build-system/**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/coverage/**'
  ],
  // Configurações para lidar com processos assíncronos e timers
  testTimeout: 10000, // Aumentar o timeout para 10 segundos
  forceExit: true, // Forçar a saída após os testes
  detectOpenHandles: true, // Detectar handles abertos
  maxWorkers: '50%', // Limitar o número de workers para evitar sobrecarga
  // Configurações para lidar com timers
  fakeTimers: { enableGlobally: true } // Usar timers falsos para evitar problemas com timers reais
};
