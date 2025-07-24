import { type Page as PageBase, test as testBase } from '@playwright/test';
import {
  AnnotatorPage,
  CampaignCreatePage,
  CampaignDetailPage,
  CampaignEditPage,
  CampaignListPage,
  DatasetPage,
  HomePage,
  LoginPage
} from './pages';
import { Mock } from './services';
import { CampaignImportAnnotationsPage } from "./pages/campaign-import-annotations";
import { interceptGQL } from "./functions";
import { Route } from "playwright-core";

interface PageExtension {
  readonly mock: Mock;

  readonly home: HomePage;
  readonly login: LoginPage;
  readonly dataset: DatasetPage;
  readonly annotator: AnnotatorPage;
  readonly campaign: {
    list: CampaignListPage;
    detail: CampaignDetailPage;
    create: CampaignCreatePage;
    edit: CampaignEditPage;
    import: CampaignImportAnnotationsPage;
  }
}

export interface Page extends PageBase, PageExtension {
}

// Declare the types of your fixtures.
type Fixture = {
  page: Page;
  interceptGQL: typeof interceptGQL;
};

export * from '@playwright/test';
export const test = testBase.extend<Fixture>({
  // eslint-disable-next-line no-empty-pattern
  interceptGQL: async ({}, use) => {
    await use(interceptGQL);
  },
  page: async ({ page }, use) => {
    // Block all BFF requests from making it through to the 'real'
    // dependency. If we get this far it means we've forgotten to register a
    // handler, and (at least locally) we're using a real dependency.
    await page.route('**/graphql', function (route: Route) {
      route.abort('blockedbyclient');
    });

    await use(Object.assign(page, {
      mock: new Mock(page),

      home: new HomePage(page),
      login: new LoginPage(page),
      dataset: new DatasetPage(page),
      annotator: new AnnotatorPage(page),
      campaign: {
        list: new CampaignListPage(page),
        detail: new CampaignDetailPage(page),
        create: new CampaignCreatePage(page),
        edit: new CampaignEditPage(page),
        import: new CampaignImportAnnotationsPage(page),
      },
    } satisfies PageExtension))
  },
});


