import { defineConfig, devices } from "@playwright/test";

/**
 * Tests de bout en bout (accessibilite) : axe-core + parcours clavier sur le
 * build de production, servi sur le port 3102. Voir README.md et DESIGN.md §14.
 *
 * Les tests "membre" ne s'executent qu'en CI ou avec E2E_CREATE_USER=1, car ils
 * creent un compte de test dans la base pointee par DATABASE_URL.
 */
const PORT = 3102;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: { baseURL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec next build && pnpm exec next start -p ${PORT} -H 127.0.0.1`,
    url: `${baseURL}/fr`,
    // Le serveur de test tourne en http : le cookie de session ne doit pas etre Secure.
    env: { COOKIE_SECURE: "false" },
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
