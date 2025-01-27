import { expect, test } from './utils/fixture';
import { Mock } from "./utils/mock";
import { ESSENTIAL } from "./utils/detail";

test.describe.configure({ mode: "serial" })

test.beforeEach(async ({ annotator: page }) => page.nav.goAnnotationCampaignDetail())

test('See global information', ESSENTIAL, async ({ annotator: page }) => {
  await expect(page.getByRole('heading', { name: Mock.CAMPAIGN.name })).toBeVisible();
  await expect(page.getByText(`Created on ${ new Date(Mock.CAMPAIGN.created_at).toLocaleDateString() } by ${ Mock.CAMPAIGN.owner }`)).toBeVisible();
  await expect(page.getByText(Mock.CAMPAIGN.desc)).toBeVisible();
  await expect(page.getByText(new Date(Mock.CAMPAIGN.deadline).toLocaleDateString())).toBeVisible();
  await expect(page.getByText(`${ Mock.CAMPAIGN.usage } annotations`)).toBeVisible();
  await expect(page.getByText(Mock.LABEL_SET.name)).toBeVisible();
  await expect(page.getByText(Mock.CONFIDENCE_SET.name)).toBeVisible();
  await expect(page.getByText(Mock.CAMPAIGN.labels_with_acoustic_features.join(', '))).toBeVisible();
})

test('See no files if none assigned', async ({ annotator: page }) => {
  await page.nav.goAnnotationCampaignDetail({ fileRanges: [] })
  await expect(page.getByText('No files to annotate')).toBeVisible();
})

test('See files', ESSENTIAL, async ({ annotator: page }) => {
  await expect(page.locator('.table-content').first()).toBeVisible();
})

test('Can search file', async ({ annotator: page }) => {
  await page.getByRole('search').locator('input').fill(Mock.SUBMITTED_FILE.filename)
  await page.keyboard.press('Enter')
  await page.waitForRequest(/\/api\/annotation-file-range\/campaign\/.*search/g)
})

test('Can toggle Non submitted filter', async ({ annotator: page }) => {
  await page.getByText('Non submitted').click()
  await page.waitForRequest(/.*\/api\/annotation-file-range\/campaign\/.*is_submitted=false/g)
})

test('Can toggle With annotations filter', async ({ annotator: page }) => {
  await page.getByText('With annotations').click()
  await page.waitForRequest(/.*\/api\/annotation-file-range\/campaign\/.*with_user_annotations=true/g)
})

test('Can resume annotation', async ({ annotator: page }) => {
  await page.getByRole('button', {name: 'Resume annotation'}).click()
  await page.waitForURL(/.*\/annotation-campaign\/-?\d+\/file\/\d+/g);
})
