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
    "@/components/(.*)": "<rootDir>/src/components/$1",
    "@/consts/(.*)": "<rootDir>/src/consts/$1",
    "@/routes/(.*)": "<rootDir>/src/routes/$1",
    "@/services/(.*)": "<rootDir>/src/services/$1",
    "@/slices/(.*)": "<rootDir>/src/slices/$1",
    "@/types/(.*)": "<rootDir>/src/types/$1",
    "@/view/(.*)": "<rootDir>/src/view/$1",
  }
};

export default config;