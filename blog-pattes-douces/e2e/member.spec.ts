import { expect, test, type BrowserContext } from "@playwright/test";
import { E2E_USER, LOCALES, MEMBER_TESTS_ENABLED, THEMES, expectNoViolations, forceTheme, settle } from "./helpers";

// Pages reservees aux membres. Un compte de test est cree via l'API
// d'inscription : uniquement en CI ou avec E2E_CREATE_USER=1.
test.skip(!MEMBER_TESTS_ENABLED, "Definir E2E_CREATE_USER=1 pour creer un compte de test dans la base");

const PAGES = ["feed", "my-articles", "profile", "activity", "comments", "dashboard", "articles/new"];

/** Ouvre une vraie session serveur : le cookie httpOnly pd_session va dans le contexte du navigateur. */
async function signIn(context: BrowserContext): Promise<void> {
  const login = await context.request.post("/api/auth/login", {
    data: { pseudo: E2E_USER.pseudo, password: E2E_USER.password },
  });
  expect(login.ok()).toBe(true);
}

test.beforeAll(async ({ request }) => {
  // 201 = cree, 409 = deja present (relance locale) : les deux conviennent.
  const register = await request.post("/api/auth/register", {
    data: { pseudo: E2E_USER.pseudo, mail: E2E_USER.mail, password: E2E_USER.password, espece: "cat" },
  });
  expect([201, 409]).toContain(register.status());
});

for (const lang of LOCALES) {
  for (const theme of THEMES) {
    test.describe(`axe membre /${lang} (${theme})`, () => {
      test.beforeEach(async ({ page, context }) => {
        await forceTheme(page, theme);
        await signIn(context);
      });

      for (const path of PAGES) {
        test(`/${path}`, async ({ page }) => {
          await page.goto(`/${lang}/${path}`);
          await settle(page);
          await expect(page).toHaveURL(new RegExp(`/${lang}/${path}$`));
          await expectNoViolations(page);
        });
      }
    });
  }
}
