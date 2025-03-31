import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// 从传统配置兼容层获取基础配置
const compatConfig = compat.config({
  extends: ["next/core-web-vitals", "next/typescript", "next", "prettier"],
});

// 添加测试文件的配置（使用扁平配置格式）
const testFilesConfig = {
  files: ["tests/**/*"],
  languageOptions: {
    globals: {
      jest: true,
      describe: true,
      it: true,
      expect: true,
      beforeEach: true,
      afterEach: true,
    },
  },
};

// 导出最终的扁平配置
export default [...compatConfig, testFilesConfig];
