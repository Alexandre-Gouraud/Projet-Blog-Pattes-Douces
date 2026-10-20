import { expect, test } from "@playwright/test";
import { LOCALES, THEMES, expectNoViolations, forceTheme, settle } from "./helpers";

const PAGES = ["feed", "login", "register", "about", "contact", "privacy", "accessibility", "page-inexistante"];

for (const lang of LOCALES) {
  for (const theme of THEMES) {
    test.describe(`axe /${lang} (${theme})`, () => {
      test.beforeEach(async ({ page }) => forceTheme(page, theme));

      for (const path of PAGES) {
        test(`/${path}`, async ({ page }) => {
          await page.goto(`/${lang}/${path}`);
          await settle(page);
          await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
          await expectNoViolations(page);
        });
      }

      test("article", async ({ page, request }) => {
        const response = await request.get("/api/articles");
        const articles: { id: string }[] = response.ok() ? await response.json() : [];
        test.skip(articles.length === 0, "Aucun article en base");
        await page.goto(`/${lang}/articles/${articles[0].id}`);
        await settle(page);
        await expectNoViolations(page);
      });
    });
  }
}

test("la bascule de theme reelle applique et memorise le theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/fr/about");
  await settle(page);
  const toggle = page.getByRole("button", { name: "Mode sombre" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expectNoViolations(page);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
