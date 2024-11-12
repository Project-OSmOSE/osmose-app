import { expect, test } from '../../../utils/fixture';
import { accessCampaignDetail } from '../../../utils/campaign/functions';
import { ADMIN, ANNOTATOR, BASE_USER } from '../../../utils/auth/data';

test('Annotator can view campaign status ', async ({ annotatorPage }) => {
  await accessCampaignDetail(annotatorPage);
  await expect(annotatorPage.getByText('admin (Expert)')).toBeVisible()
  await expect(annotatorPage.getByText(ANNOTATOR.displayName)).toBeVisible()
  await expect(annotatorPage.getByText(ADMIN.displayName)).not.toBeVisible()
  await expect(annotatorPage.getByText(BASE_USER.displayName)).not.toBeVisible()
})

test('Empty state - No annotators are shown', async ({ adminPage }) => {
  await adminPage.route(/\/api\/annotation-file-range\/?/g, route => {
    return route.fulfill({ status: 200, json: [] })
  })
  await accessCampaignDetail(adminPage);
  await expect(adminPage.getByText('No annotators')).toBeVisible();
})

test('admin cannot download empty status', async ({ adminPage }) => {
  await adminPage.route(/\/api\/annotation-file-range\/?/g, route => {
    return route.fulfill({ status: 200, json: [] })
  })
  await accessCampaignDetail(adminPage);
  const resultButton = adminPage.getByRole('button', { name: 'Results (csv)' });
  await expect(resultButton).not.toBeVisible();
  const statusButton = adminPage.getByRole('button', { name: 'Task status (csv)' });
  await expect(statusButton).not.toBeVisible();
})

test('admin can download filled status', async ({ adminPage }) => {
  await adminPage.route(/\/api\/annotation-campaign\/\d\/report\/?\??.*/g, route => {
    return route.fulfill({ status: 200 })
  })
  await adminPage.route(/\/api\/annotation-campaign\/\d\/report-status\/?\??.*/g, route => {
    return route.fulfill({ status: 200 })
  })
  await accessCampaignDetail(adminPage);
  const resultButton = adminPage.getByRole('button', { name: 'Results (csv)' });
  await expect(resultButton).toBeVisible();
  await Promise.all([
    adminPage.waitForRequest(/\/api\/annotation-campaign\/\d\/report/g),
    resultButton.click(),
  ])
  const statusButton = adminPage.getByRole('button', { name: 'Task status (csv)' });
  await expect(statusButton).toBeVisible();
  await Promise.all([
    adminPage.waitForRequest(/\/api\/annotation-campaign\/\d\/report-status/g),
    statusButton.click(),
  ])
})

test('admin can manage annotators', async ({ adminPage }) => {
  await accessCampaignDetail(adminPage);
  const button = adminPage.getByRole('button', { name: 'Manage annotators' });
  await expect(button).toBeVisible();
  await button.click();
  await adminPage.waitForURL(/\/annotation-campaign\/\d\/edit/g);
})

test('annotator cannot download filled status', async ({ annotatorPage }) => {
  await accessCampaignDetail(annotatorPage);
  const resultButton = annotatorPage.getByRole('button', { name: 'Results (csv)' });
  await expect(resultButton).not.toBeVisible();
  const statusButton = annotatorPage.getByRole('button', { name: 'Task status (csv)' });
  await expect(statusButton).not.toBeVisible();
})

test('admin cannot manage annotators', async ({ annotatorPage }) => {
  await accessCampaignDetail(annotatorPage);
  const button = annotatorPage.getByRole('button', { name: 'Manage annotators' });
  await expect(button).not.toBeVisible();
})
