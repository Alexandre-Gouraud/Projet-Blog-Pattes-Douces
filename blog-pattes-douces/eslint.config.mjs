import { defineConfig, globalIgnores } from "eslint/config";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import tsParser from "@typescript-eslint/parser";

/**
 * Config volontairement minimale.
 *
 * On n'utilise PAS `eslint-config-next` : il tire `typescript-eslint`, qui ne
 * supporte pas encore TypeScript 7 (celui du projet) et fait echouer eslint au
 * demarrage. On charge donc directement le plugin Next et les regles des hooks
 * React. Le typage reste couvert par `tsc --noEmit`, lance par `next build`.
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
