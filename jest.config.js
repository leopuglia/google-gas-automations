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
    '^(\\.\\.?\\/.+)\\.js$': '$1',
    '^chalk$': '<rootDir>/tests/mocks/chalk.mock.js',
    '\\.\\./logger\\.js$': '<rootDir>/tests/mocks/logger.mock.js'
  },
  testMatch: ['**/__tests__/**/*.{js,ts}?(x)', '**/?(*.)+(spec|test).{js,ts}?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/tests/mocks/gas.mock.js'],
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts']
};
