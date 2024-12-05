import { expect, Page } from '@playwright/test';
import { accessCampaignFileList } from '../campaign/functions';

export async function accessAnnotator(page: Page) {
  await accessCampaignFileList(page);
  await page.getByText('Task link').first().click()
  await expect(page.getByRole('button', { name: 'Back to campaign' })).toBeVisible()
}
