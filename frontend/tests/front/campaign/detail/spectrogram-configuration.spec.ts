import { expect, test } from '../../../utils/fixture';
import { accessCampaignDetail } from '../../../utils/campaign/functions';

test('annotator can view campaign spectrogram configurations ', {
  tag: '@essential'
}, async ({ annotatorPage }) => {
  await accessCampaignDetail(annotatorPage);
  await expect(annotatorPage.getByText('NFFT4096')).toBeVisible();
})

test('Empty state - No spectrogram configuration are shown', async ({ adminPage }) => {
  await adminPage.route(/\/api\/spectrogram-configuration\/?/g, route => {
    return route.fulfill({ status: 200, json: [] })
  })
  await accessCampaignDetail(adminPage);
  await expect(adminPage.getByText('No spectrogram configuration')).toBeVisible();
})

test('admin cannot download empty spectrogram configuration', async ({ adminPage }) => {
  await adminPage.route(/\/api\/spectrogram-configuration\/?/g, route => {
    return route.fulfill({ status: 200, json: [] })
  })
  await accessCampaignDetail(adminPage);
  const button = adminPage.getByRole('button', { name: 'Spectrogram configuration (csv)' });
  await expect(button).not.toBeVisible();
})

test('admin can download filled spectrogram configuration', {
  tag: '@essential'
}, async ({ adminPage }) => {
  await adminPage.route(/\/api\/spectrogram-configuration\/export\/?\??.*/g, route => {
    return route.fulfill({ status: 200 })
  })
  await accessCampaignDetail(adminPage);
  const button = adminPage.getByRole('button', { name: 'Spectrogram configuration (csv)' });
  await expect(button).toBeVisible();
  await Promise.all([
    adminPage.waitForRequest(/\/api\/spectrogram-configuration\/export\??.*/g),
    button.click(),
  ])
})

test('annotator cannot download spectrogram configuration', async ({ annotatorPage }) => {
  await accessCampaignDetail(annotatorPage);
  const button = annotatorPage.getByRole('button', { name: 'Spectrogram configuration (csv)' });
  await expect(button).not.toBeVisible();
})
