import { expect, test } from '../../../utils/fixture';
import { accessCreateCampaign } from '../../../utils/campaign/functions';
import { expectNoRequestsOnAction } from '../../../utils/functions';
import { CAMPAIGN_URL } from '../../../utils/url';
import { selectCreateAnnotations } from './util';

test('Cannot submit empty form', async ({ annotatorPage }) => {
  await accessCreateCampaign(annotatorPage);
  await expectNoRequestsOnAction(
    annotatorPage,
    () => annotatorPage.getByRole('button', { name: 'Create campaign' }).click(),
    CAMPAIGN_URL
  )
})

test('Empty dataset', async ({ annotatorPage }) => {
  await accessCreateCampaign(annotatorPage, { datasets: [] });
  await expect(annotatorPage.getByText('You should first import a dataset')).toBeVisible();
  await expect(annotatorPage.getByRole('button', { name: 'Select a dataset' })).toBeDisabled();
})

test('Empty labels', async ({ annotatorPage }) => {
  await accessCreateCampaign(annotatorPage, { labels: [] });
  await selectCreateAnnotations(annotatorPage);
  await expect(annotatorPage.getByText('You should create a label set')).toBeVisible();
  await expect(annotatorPage.getByRole('button', { name: 'Select a label set' })).toBeDisabled();
})

test('Empty confidence set', async ({ annotatorPage }) => {
  await accessCreateCampaign(annotatorPage, { confidences: [] });
  await selectCreateAnnotations(annotatorPage);
  await expect(annotatorPage.getByText('You need to create a confidence set')).toBeVisible();
  await expect(annotatorPage.getByRole('button', { name: 'Select a confidence set' })).toBeDisabled();
})