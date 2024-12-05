import { expect, test } from '../../../utils/fixture';
import { accessCampaignDetail, canAccessCampaignFileList } from '../../../utils/campaign/functions';

test('annotator can view campaign global information ', {
  tag: '@essential'
}, async ({ annotatorPage }) => {
  await accessCampaignDetail(annotatorPage);
  await expect(annotatorPage.getByText('Label set:Test SPM campaign')).toBeVisible();
  await expect(annotatorPage.getByText('Confidence indicator set:Confident/NotConfident')).toBeVisible();
  await expect(annotatorPage.getByText('Dataset:Test Dataset')).toBeVisible();
  await expect(annotatorPage.getByText('Deadline:02/11/2010')).toBeVisible();
  await expect(annotatorPage.getByText('Mode:create')).toBeVisible();
  await expect(annotatorPage.getByText(/^Created on [0-9/]* by admin$/g)).toBeVisible();
})

test('annotator can access campaign annotation file list', {
  tag: '@essential'
}, async ({ annotatorPage }) => {
  await accessCampaignDetail(annotatorPage);
  await canAccessCampaignFileList(annotatorPage, annotatorPage)
})

test('admin (not annotator) cannot access campaign annotation file list', {
  tag: '@essential'
}, async ({ adminPage }) => {
  await accessCampaignDetail(adminPage);
  const button = adminPage.getByRole('button', { name: 'Annotate' });
  await expect(button).not.toBeVisible();
})
