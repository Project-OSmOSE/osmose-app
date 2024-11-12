import { expect, test } from '../../../utils/fixture';
import { DEFAULT_CAMPAIGN_NAME } from '../../../utils/campaign/data';

test('cannot access campaign annotation file list', async ({ adminPage }) => {
  await adminPage.getByPlaceholder('Search campaign').locator('input').fill(DEFAULT_CAMPAIGN_NAME);
  const card = adminPage.locator('.campaign-card').first()
  await card.waitFor()
  const button = card.getByRole('button', { name: 'Annotate' });
  await expect(button).not.toBeVisible();
})

test('can see archived campaigns', async ({ adminPage }) => {
  const toggle = adminPage.getByText('Show archived')
  await expect(toggle).toBeVisible();
  await toggle.click();
  const cardsCounts = await adminPage.locator('.campaign-card').count()
  expect(cardsCounts).toBeGreaterThanOrEqual(1)
})