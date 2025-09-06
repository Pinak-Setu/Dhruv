import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/test-setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/tests/**/*.test.ts?(x)'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['json-summary', 'text', 'lcov'],
};

export default createJestConfig(config);
