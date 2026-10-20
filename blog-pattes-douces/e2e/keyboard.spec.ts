import { expect, test } from "@playwright/test";
import { LOCALES, settle } from "./helpers";

// DESIGN.md §14 : lien d'evitement, un seul h1, lang et dir par langue.
for (const lang of LOCALES) {
  test.describe(`/${lang}`, () => {
    test("lang et dir de <html>", async ({ page }) => {
      await page.goto(`/${lang}/about`);
      const html = page.locator("html");
      await expect(html).toHaveAttribute("lang", lang);
      await expect(html).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    });

    test("le lien d'evitement est le premier element focusable et focalise main#contenu", async ({ page }) => {
      await page.goto(`/${lang}/about`);
      await settle(page);
      await page.keyboard.press("Tab");
      await expect(page.locator("a[href='#contenu']")).toBeFocused();
      const first = page.locator("a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])").first();
      await expect(first).toHaveAttribute("href", "#contenu");
      await page.keyboard.press("Enter");
      await expect(page.locator("main#contenu")).toBeFocused();
    });

    for (const path of ["feed", "login", "register", "about", "contact", "privacy", "accessibility"]) {
      test(`un seul h1 sur /${path}`, async ({ page }) => {
        await page.goto(`/${lang}/${path}`);
        await settle(page);
        await expect(page.locator("h1")).toHaveCount(1);
      });
    }
  });
}
