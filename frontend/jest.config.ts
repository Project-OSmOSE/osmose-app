import type { Config } from 'jest';


const SRC_PATH = '<rootDir>/src';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    // process `*.tsx` files with `ts-jest`
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testRegex: '/.*/.*\\.(test|spec)?\\.(ts|tsx)$',
  moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json', 'node' ],
  roots: [
    SRC_PATH
  ],
  moduleNameMapper: {
    "/app/(.*)": "<rootDir>/public/$1",
    "@/(.*)": "<rootDir>/src/$1",
  }
};

export default config;