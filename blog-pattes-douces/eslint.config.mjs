import { defineConfig, globalIgnores } from "eslint/config";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import tsParser from "@typescript-eslint/parser";

/**
 * Config volontairement minimale.
 *
 * On charge directement le plugin Next et les regles des hooks React, sans
 * `eslint-config-next`. Le typage reste couvert par `tsc --noEmit`, lance par
 * `next build`. TypeScript reste en 6.x : `@typescript-eslint/parser` 8.x
 * n'accepte pas TypeScript 7 (peerDependency `<6.1.0`).
 */
export default defineConfig([
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"]),
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
]);
