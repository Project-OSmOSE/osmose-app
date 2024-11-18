import { expect, test } from '../../../utils/fixture';
import { accessCampaignDetail } from '../../../utils/campaign/functions';

test('annotator can view campaign audio metadata ', {
  tag: '@essential'
}, async ({ annotatorPage }) => {
  await accessCampaignDetail(annotatorPage);
  await expect(annotatorPage.getByText('Files subtypesPCM-16')).toBeVisible();
})

test('Empty state - No audio metadata are shown', async ({ adminPage }) => {
  await adminPage.route(/\/api\/audio-metadata\/?/g, route => {
    return route.fulfill({ status: 200, json: [] })
  })
  await accessCampaignDetail(adminPage);
  await expect(adminPage.getByText('No metadata')).toBeVisible();
})

test('admin cannot download empty audio metadata', async ({ adminPage }) => {
  await adminPage.route(/\/api\/audio-metadata\/?/g, route => {
    return route.fulfill({ status: 200, json: [] })
  })
  await accessCampaignDetail(adminPage);
  const button = adminPage.getByRole('button', { name: 'Audio files metadata (csv)' });
  await expect(button).not.toBeVisible();
})

test('admin can download filled audio metadata', {
  tag: '@essential'
}, async ({ adminPage }) => {
  await adminPage.route(/\/api\/audio-metadata\/export\/?\??.*/g, route => {
    return route.fulfill({ status: 200 })
  })
  await accessCampaignDetail(adminPage);
  const button = adminPage.getByRole('button', { name: 'Audio files metadata (csv)' });
  await expect(button).toBeVisible();
  await Promise.all([
    adminPage.waitForRequest(/\/api\/audio-metadata\/export\??.*/g),
    button.click(),
  ])
})

test('annotator cannot download audio metadata', async ({ annotatorPage }) => {
  await accessCampaignDetail(annotatorPage);
  const button = annotatorPage.getByRole('button', { name: 'Audio files metadata (csv)' });
  await expect(button).not.toBeVisible();
})
