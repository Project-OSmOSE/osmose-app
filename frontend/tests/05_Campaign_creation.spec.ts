import { expect, ExtendedPage, test } from './utils/fixture';
import { expectNoRequestsOnAction } from "./utils/functions";
import { ESSENTIAL } from "./utils/detail";
import { selectInAlert } from "./front/campaign/create/util";
import { WriteCreateAnnotationCampaign } from "../src/service/campaign";
import { Mock } from "./utils/mock";
import { CREATE_CAMPAIGN_URL } from "./utils/url";

test.describe.configure({ mode: "serial" })

test.beforeEach(async ({ annotator: page }) => {
  await page.nav.goAnnotationCampaignCreate()
})

async function selectMode(page: ExtendedPage, mode: 'Create annotations' | 'Check annotations') {
  await page.getByRole('button', { name: 'Select an annotation mode' }).click();
  await page.locator('#options').getByText(mode).click();
}

async function fillForm(page: ExtendedPage, complete: boolean) {
  // Global info
  await page.getByPlaceholder('Campaign name').fill(Mock.CAMPAIGN.name);
  if (complete) {
    await page.getByPlaceholder('Enter your campaign description').fill(Mock.CAMPAIGN.desc);
    await page.getByPlaceholder('URL').fill(Mock.CAMPAIGN.instructions_url);
    const d = new Date(Mock.CAMPAIGN.deadline);
    await page.getByPlaceholder('Deadline').fill(`${ d.getDate() }/${ d.getMonth() + 1 }/${ d.getFullYear() }`);
  }

  // Data
  await page.getByRole('button', { name: 'Select a dataset' }).click();
  await selectInAlert(page, Mock.DATASET.name);

  // Annotation
  await Promise.all([
    page.waitForRequest(/\/api\/label-set\//),
    page.waitForRequest(/\/api\/confidence-indicator\//),
    selectMode(page, 'Create annotations'),
  ]);
  await page.getByRole('button', { name: 'Select a label set' }).click();
  await selectInAlert(page, Mock.LABEL_SET.name);
  if (complete) {
    await page.getByRole('button', { name: 'Select a confidence set' }).click();
    await selectInAlert(page, Mock.CONFIDENCE_SET.name);
    // TODO: labels with acoustic features
  }

  // Annotators
  if (complete) {
    // TODO: annotators
  }
}

test('Cannot select a dataset if none is imported', async ({ annotator: page }) => {
  await page.nav.goAnnotationCampaignCreate({ datasets: [] })
  await expect(page.getByRole('button', { name: 'Select a dataset' })).toBeDisabled();
  await expect(page.getByText('You should first import a dataset')).toBeVisible();
})

test('Cannot select a label set if none exists', async ({ annotator: page }) => {
  await page.nav.goAnnotationCampaignCreate({ labelSets: [] })
  await selectMode(page, 'Create annotations');
  await expect(page.getByRole('button', { name: 'Select a label set' })).toBeDisabled();
  await expect(page.getByText('You should create a label set')).toBeVisible();
})

test('Cannot select a confidence set if none exists', async ({ annotator: page }) => {
  await page.nav.goAnnotationCampaignCreate({ confidenceSets: [] })
  await selectMode(page, 'Create annotations');
  await expect(page.getByRole('button', { name: 'Select a confidence set' })).toBeDisabled();
  await expect(page.getByText('You need to create a confidence set to use it in your campaign')).toBeVisible();
})

test('Cannot submit empty form', async ({ annotator: page }) => {
  await expectNoRequestsOnAction(
    page,
    () => page.getByRole('button', { name: 'Create campaign' }).click(),
    /\/api\/annotation-campaign\/?$/g
  )
})

test('[Create] Can submit only required fields', ESSENTIAL, async ({ annotator: page }) => {
  await fillForm(page, false);
  const [ request ] = await Promise.all([
    page.waitForRequest(CREATE_CAMPAIGN_URL),
    page.getByRole('button', { name: 'Create campaign' }).click()
  ]);
  const data = request.postDataJSON() as WriteCreateAnnotationCampaign;
  const expectedData: WriteCreateAnnotationCampaign = {
    name: Mock.CAMPAIGN.name,
    datasets: [ Mock.DATASET.name ],
    spectro_configs: Mock.DATASET.spectros.map(s => s.id),
    instructions_url: null,
    desc: null,
    deadline: null,
    confidence_indicator_set: null,
    label_set: Mock.LABEL_SET.id,
    usage: 'Create',
    labels_with_acoustic_features: []
  }
  expect(data).toEqual(expectedData);
  // TODO: pass test
})

test('[Create] Can submit complete form', ESSENTIAL, async ({ annotator: page }) => {
  await fillForm(page, true);
  const [ request ] = await Promise.all([
    page.waitForRequest(CREATE_CAMPAIGN_URL),
    page.getByRole('button', { name: 'Create campaign' }).click()
  ]);
  const data = request.postDataJSON() as WriteCreateAnnotationCampaign;
  const expectedData: WriteCreateAnnotationCampaign = {
    name: Mock.CAMPAIGN.name,
    instructions_url: Mock.CAMPAIGN.instructions_url,
    desc: Mock.CAMPAIGN.desc,
    deadline: Mock.CAMPAIGN.deadline,
    datasets: [ Mock.DATASET.name ],
    spectro_configs: Mock.DATASET.spectros.map(s => s.id),
    confidence_indicator_set: Mock.CONFIDENCE_SET.id,
    label_set: Mock.LABEL_SET.id,
    usage: 'Create',
    labels_with_acoustic_features: []
  }
  expect(data).toEqual(expectedData);
  // TODO: pass test
})

// TODO: check mode
