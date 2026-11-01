import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default defineConfig(
  {
    ignores: ["dist/"],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: { projectService: true },
    },
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Warning severity for certain checks
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/member-ordering": "error",

      // Import style (consistent-type-imports is in strictTypeChecked, re-enable with fixStyle)
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      // Unused vars: allow unused args after used ones; skip _-prefixed vars; allow rest siblings
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
        },
      ],

      // Use-before-define: allow functions/typedefs (forward refs are common in libraries)
      "@typescript-eslint/no-use-before-define": [
        "error",
        {
          functions: false,
          typedefs: false,
          ignoreTypeReferences: true,
        },
      ],

      // Floating promises: off (matchers are sync, async support is future work)
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
);
