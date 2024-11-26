import { type Page, test as base } from '@playwright/test';
import { login } from "./auth/function";
import { ADMIN, ANNOTATOR, BASE_USER } from "./auth/data";

// Declare the types of your fixtures.
type Fixture = {
  adminPage: Page;
  annotatorPage: Page;
  baseUserPage: Page;
};

export * from '@playwright/test';
export const test = base.extend<Fixture>({
  adminPage: async ({ page }, use) => {
    await login(page, ADMIN);
    await use(page)
  },
  annotatorPage: async ({ page }, use) => {
    await login(page, ANNOTATOR);
    await use(page);
  },
  baseUserPage: async ({ page }, use) => {
    await login(page, BASE_USER);
    await use(page);
  },
});
