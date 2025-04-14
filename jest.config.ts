import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["@swc/jest", {}],
  },
  // 更新 transformIgnorePatterns，确保 next-auth 和其他 ESM 模块被正确转换
  transformIgnorePatterns: [
    "/node_modules/(?!(next-auth|@next-auth|next/dist|framer-motion|uuid))",
  ],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],
  // 启用 ESM 支持
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};

export default createJestConfig(config);
