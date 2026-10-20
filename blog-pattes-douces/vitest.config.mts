import { defineConfig } from "vitest/config";

/**
 * Tests unitaires des modules purs (i18n, validation, routes, proxy).
 * Les alias `@/` de tsconfig.json sont resolus nativement par Vite.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
