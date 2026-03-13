import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import testingLibrary from "eslint-plugin-testing-library";

export default defineConfig([
  globalIgnores(["dist", "coverage", "dev-dist", "public"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactRefresh.configs.vite],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs["recommended-latest"].rules,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ["src/test/**"],
    plugins: {
      reactRefresh: reactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["src/**/*.test.{ts,tsx}"],
    plugins: {
      testingLibrary,
    },
    rules: {
      ...testingLibrary.configs.react.rules,
    },
  },
]);
