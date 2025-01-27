import { expect, test } from './utils/fixture';
import { DEFAULT_CAMPAIGN_NAME } from "./utils/campaign/data";
import { Mock } from "./utils/mock";
import { ESSENTIAL } from "./utils/detail";

test.describe.configure({ mode: "serial" })

test.beforeEach(async ({ annotator: page }) => {
  await page.nav.goAnnotationCampaigns()
})

test('Can see campaigns and access first', ESSENTIAL, async ({ annotator: page }) => {
  await page.waitForRequest(/\/api\/annotation-campaign\/?\?.*?annotator/g)
  const card = page.locator('.campaign-card').first();
  await expect(card).toBeVisible();
  await card.click()
  await expect(page.getByRole('heading', { name: Mock.CAMPAIGN.name })).toBeVisible()
})

test('Cannot see campaigns if empty', ESSENTIAL, async ({ annotator: page }) => {
  await page.nav.goAnnotationCampaigns({ campaigns: [] });
  await expect(page.locator('.campaign-card')).not.toBeVisible();
  await expect(page.getByText('No campaigns')).toBeVisible();

})

test('Can search campaign', async ({ annotator: page }) => {
  await page.getByRole('search').locator('input').fill(DEFAULT_CAMPAIGN_NAME)
  await page.keyboard.press('Enter')
  await page.waitForRequest(/.*\/api\/annotation-campaign\/?\?.*search/g)
})

test('Can toggle My work filter', async ({ annotator: page }) => {
  await page.getByText('My work').click()
  await page.waitForRequest(/\/api\/annotation-campaign\/\?((?!annotator).)*$/g)
})

test('Can toggle Only archived filter', async ({ annotator: page }) => {
  await page.getByText('Only archived').click()
  await page.waitForRequest(/\/api\/annotation-campaign\/x?\?.*archive__isnull=false.*$/g)
})

test('Can toggle Campaign mode filter to Create', async ({ annotator: page }) => {
  await page.getByText('Campaign mode filter').click()
  await page.waitForRequest(/\/api\/annotation-campaign\/?\?.*?usage=0/g)
})

test('Can toggle Campaign mode filter to Check', async ({ annotator: page }) => {
  await page.getByText('Campaign mode filter').click()
  await Promise.all([
    page.waitForRequest(/\/api\/annotation-campaign\/?\?.*?usage=1/g),
    page.getByText('Campaign mode filter').click(),
  ])
})

test('Can toggle Only mine filter', async ({ annotator: page }) => {
  await page.getByText('Only mine').click()
  await page.waitForRequest(/\/api\/annotation-campaign\/?\?.*?owner/g)
})

test('Can access campaign creation', ESSENTIAL, async ({ annotator: page }) => {
  await page.getByRole('button', { name: 'New annotation campaign' }).click()
  await expect(page.getByRole('heading', { name: 'Create Annotation Campaign' })).toBeVisible();
})