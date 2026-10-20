import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const LOCALES = ["fr", "en", "ar", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

/** Cle localStorage du theme (src/theme/themeScript.ts). */
const THEME_KEY = "pd-theme";

/** Compte de test cree par les tests membre (jamais en local sans E2E_CREATE_USER). */
export const E2E_USER = {
  pseudo: "e2e-membre",
  mail: "e2e-membre@example.test",
  password: "Pattes-Douces-1!",
};

/** Les tests membre creent un compte : uniquement en CI ou sur demande explicite. */
export const MEMBER_TESTS_ENABLED = !!process.env.CI || process.env.E2E_CREATE_USER === "1";

/** Memorise le theme avant le premier rendu, comme le fait le bouton de theme. */
export async function forceTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript(
    ([key, value]) => {
      try {
        localStorage.setItem(key, value);
      } catch {
        // ignore
      }
    },
    [THEME_KEY, theme],
  );
}

/** Attend que la page soit hydratee et ait fini de charger ses donnees. */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await expect(page.locator("main#contenu")).toBeVisible();
  // Les squelettes de chargement sont marques aria-busy.
  await expect(page.locator("[aria-busy='true']")).toHaveCount(0);
}

export async function expectNoViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const summary = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
  }));
  expect(summary, "violations axe").toEqual([]);
}
