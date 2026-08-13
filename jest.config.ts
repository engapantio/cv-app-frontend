import nextJest from "next/jest.js";
import type { Config } from "jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/coverage/",
    "<rooDir>/src/messages",
    "<rootDir>/src/components/ui",
  ],

  coverageThreshold: {
    global: {
      statements: 33,
      branches: 33,
      functions: 33,
      lines: 33,
    },
  },

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/types.ts",
    "!src/**/index.ts",
    "!src/app/**/layout.tsx",
    "!src/app/**/loading.tsx",
    "!src/app/**/error.tsx",
    "!src/app/**/not-found.tsx",
    "!src/proxy.ts",
  ],
};

export default createJestConfig(config);
