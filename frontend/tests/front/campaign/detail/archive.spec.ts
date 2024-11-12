import { expect, test } from '../../../utils/fixture';
import { accessCampaignDetail } from '../../../utils/campaign/functions';

test('Empty state - admin can archive campaign', async ({ adminPage }) => {
  await adminPage.route(/\/api\/annotation-file-range\/?/g, route => {
    return route.fulfill({ status: 200, json: [] })
  })
  await accessCampaignDetail(adminPage);
  await adminPage.route(/\/api\/annotation-campaign\/\d\/archive\/?/g, route => {
    return route.fulfill({ status: 200 });
  })
  const button = adminPage.getByRole('button', { name: 'Archive' });
  await expect(button).toBeVisible();
  await Promise.all([
    adminPage.waitForRequest(/\/api\/annotation-campaign\/\d\/archive/g),
    button.click(),
  ])
})

test('Filled state - admin can archive campaign', async ({ adminPage }) => {
  await accessCampaignDetail(adminPage);
  await adminPage.route(/\/api\/annotation-campaign\/\d\/archive\/?/g, route => {
    return route.fulfill({ status: 200 });
  })
  const button = adminPage.getByRole('button', { name: 'Archive' });
  await expect(button).toBeVisible();
  await button.click();

  const alert = adminPage.locator('ion-alert').first()
  await expect(alert).toBeVisible();
  await Promise.all([
    adminPage.waitForRequest(/\/api\/annotation-campaign\/\d\/archive/g),
    alert.getByRole('button', { name: 'Archive' }).click(),
  ])
})

test('Annotator cannot archive campaign', async ({ annotatorPage }) => {
  await accessCampaignDetail(annotatorPage);
  const button = annotatorPage.getByRole('button', { name: 'Archive' });
  await expect(button).not.toBeVisible();
})
