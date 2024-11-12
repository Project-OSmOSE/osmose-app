import { expect, test } from '../../../utils/fixture';
import { DEFAULT_CAMPAIGN_NAME } from '../../../utils/campaign/data';
import {
  accessCreateCampaign,
  canAccessCampaignDetail,
  canAccessCampaignFileList,
  canAccessUserGuide
} from '../../../utils/campaign/functions';

test('can see campaigns', async ({ annotatorPage }) => {
  const cards = annotatorPage.locator('.campaign-card');
  await cards.first().waitFor();
  expect(await cards.count()).toBeGreaterThanOrEqual(1);
})

test('can filter only "create" campaigns', async ({ annotatorPage }) => {
  const toggle = annotatorPage.getByText('Campaign mode filter')
  await expect(toggle).toBeVisible();
  await toggle.click();
  const cards = annotatorPage.locator('.campaign-card')
  await Promise.race([
    cards.first().waitFor(),
    annotatorPage.getByText('No campaigns')
  ])
  const cardsCount = await cards.count();
  if (cardsCount > 0) {
    for (const card of await cards.all()) {
      await expect(card).toContainText('Create')
    }
  }
})

test('can filter only "check" campaigns', async ({ annotatorPage }) => {
  const toggle = annotatorPage.getByText('Campaign mode filter')
  await expect(toggle).toBeVisible();
  await toggle.click();
  await toggle.click();
  const cards = annotatorPage.locator('.campaign-card')
  await Promise.race([
    cards.first().waitFor(),
    annotatorPage.getByText('No campaigns')
  ])
  const cardsCount = await cards.count();
  if (cardsCount > 0) {
    for (const card of await cards.all()) {
      await expect(card).toContainText('Check')
    }
  }
})

test('cannot see archived campaigns', async ({ annotatorPage }) => {
  const toggle = annotatorPage.getByText('Show archived')
  await expect(toggle).not.toBeVisible();
})

test('can search campaigns', async ({ annotatorPage }) => {
  await annotatorPage.getByPlaceholder('Search campaign').locator('input').fill(DEFAULT_CAMPAIGN_NAME);
  const cards = annotatorPage.locator('.campaign-card')
  await cards.first().waitFor()
  expect(await cards.count()).toEqual(1)
})

test('can access campaign detail', async ({ annotatorPage }) => {
  await annotatorPage.getByPlaceholder('Search campaign').locator('input').fill(DEFAULT_CAMPAIGN_NAME);
  const card = annotatorPage.locator('.campaign-card').first()
  await card.waitFor()
  await canAccessCampaignDetail(annotatorPage, card)
})

test('can access campaign annotation file list', async ({ annotatorPage }) => {
  await annotatorPage.getByPlaceholder('Search campaign').locator('input').fill(DEFAULT_CAMPAIGN_NAME);
  const card = annotatorPage.locator('.campaign-card').first()
  await card.waitFor()
  await canAccessCampaignFileList(annotatorPage, card)
})

test('can create campaign', async ({ annotatorPage }) => {
  await accessCreateCampaign(annotatorPage)
})

test('can access user guide', async ({ annotatorPage }) => {
  await canAccessUserGuide(annotatorPage)
})