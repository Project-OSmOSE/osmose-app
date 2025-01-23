import { expect, Page } from '../../../utils/fixture';
import { DEFAULT_CAMPAIGN_NAME } from '../../../utils/campaign/data';

export async function checkCampaignVisible(page: Page, canSee: boolean) {
  const card = page.locator('.campaign-card').first()
  if (canSee) await expect(card).toBeVisible();
  else await expect(card).not.toBeVisible();
}

export async function seeCampaigns(page: Page, canSee: boolean) {
  await page.waitForResponse(/.*\/api\/annotation-campaign\/?\??.*$/g)
  await checkCampaignVisible(page, canSee);
}

export async function seeSearchCampaigns(page: Page, canSee: boolean) {
  await page.getByText('My work').click()
  await page.getByRole('search').locator('input').fill(DEFAULT_CAMPAIGN_NAME)
  await page.keyboard.press('Enter')
  await page.waitForResponse(/.*\/api\/annotation-campaign\/?\??.*search.*$/g)
  await checkCampaignVisible(page, canSee);
  if (canSee)
    await expect(page.locator('.campaign-card').first()).toContainText(DEFAULT_CAMPAIGN_NAME);
}

export async function seeArchivedCampaigns(page: Page, canSee: boolean) {
  await page.getByText('My work').click()
  await page.getByText('Only archived').click()
  await page.waitForResponse(/.*\/api\/annotation-campaign\/?\??.*archive__isnull=false.*$/g)
  await checkCampaignVisible(page, canSee);
}

export async function seeModeCampaigns(page: Page, mode: 'Create' | 'Check', canSee: boolean) {
  await page.getByText('My work').click()
  await page.getByText('Campaign mode filter').click()
  if (mode === 'Create') {
    await page.waitForResponse(/.*\/api\/annotation-campaign\/?\??.*usage=0.*$/g)
  } else if (mode === 'Check') {
    await page.getByText('Campaign mode filter').click();
    await page.waitForResponse(/.*\/api\/annotation-campaign\/?\??.*usage=1.*$/g)
  }

  await checkCampaignVisible(page, canSee);
  if (canSee) {
    const cards = await page.locator('.campaign-card').all()
    const content = (await Promise.all(cards.map(c => c.textContent()))).join(' ')
    expect(content).toContain(mode);
    expect(content).not.toContain(mode === 'Create' ? 'Check' : 'Create');
  }
}

export async function seeOwnedCampaigns(page: Page, canSee: boolean) {
  await page.getByText('My work').click()
  await page.getByText('Only mine').click()
  await page.waitForResponse(/.*\/api\/annotation-campaign\/?\??.*owner.*$/g)
  await checkCampaignVisible(page, canSee);
}

export async function createCampaign(page: Page, canCreate: boolean) {
  if (canCreate) {
    await page.getByRole('button', {name: 'New annotation campaign'}).click()
    await expect(page.getByRole('heading', {name: 'Create Annotation Campaign'})).toBeVisible();
  } else {
    await expect(page.getByRole('button', {name: 'New annotation campaign'})).not.toBeVisible();
  }
}

export async function accessDetail(page: Page) {
  await page.getByPlaceholder('Search campaign').locator('input').fill(DEFAULT_CAMPAIGN_NAME);
  await page.keyboard.press('Enter')
  await page.waitForResponse(/.*\/api\/annotation-campaign\/?\??.*search.*$/g)
  await page.locator('.campaign-card').first().click()
  await expect(page.getByRole('heading', {name: DEFAULT_CAMPAIGN_NAME})).toBeVisible();
}
