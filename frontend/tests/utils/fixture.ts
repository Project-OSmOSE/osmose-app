import { type Page, test as base } from '@playwright/test';
import { login } from "./auth/function";
import { ADMIN, ANNOTATOR, BASE_USER, CAMPAIGN_CREATOR } from "./auth/data";
import { Navigation } from "./navigation";
import { Auth } from "./auth";
import { Mock } from "./mock";

export interface ExtendedPage extends Page {
  readonly auth: Auth;
  readonly mock: Mock;
  readonly nav: Navigation;
}

// Declare the types of your fixtures.
type Fixture = {
  annotator: ExtendedPage;
  staff: ExtendedPage;
  superuser: ExtendedPage;
  campaignCreator: ExtendedPage;
  notAnnotator: ExtendedPage;

  adminPage: Page;
  campaignCreatorPage: Page;
  annotatorPage: Page;
  baseUserPage: Page;
};

function getExtendedPage(page: Page): ExtendedPage {
  const mock = new Mock(page);
  const auth = new Auth(page);
  return Object.assign(page, { nav: new Navigation(page, auth, mock), auth, mock });
}

export * from '@playwright/test';
export const test = base.extend<Fixture>({
  annotator: async ({ page }, use) => {
    const newPage = getExtendedPage(page);
    await newPage.nav.goHome();
    await use(newPage);
  },
  staff: async ({ page }, use) => {
    const newPage = getExtendedPage(page);
    await newPage.mock.mockUser({ is_staff: true })
    await use(newPage);
  },
  superuser: async ({ page }, use) => {
    const newPage = getExtendedPage(page);
    await newPage.mock.mockUser({ is_superuser: true })
    await use(newPage);
  },
  campaignCreator: async ({ page }, use) => {
    const newPage = getExtendedPage(page);
    await newPage.mock.mockUser(Mock.CAMPAIGN_CREATOR)
    await use(newPage);
  },
  notAnnotator: async ({ page }, use) => {
    const newPage = getExtendedPage(page);
    await newPage.mock.mockUser({ id: -10, username: 'none' })
    await use(newPage);
  },


  adminPage: async ({ page }, use) => {
    await login(page, ADMIN);
    await use(page)
  },
  campaignCreatorPage: async ({ page }, use) => {
    await login(page, CAMPAIGN_CREATOR);
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

