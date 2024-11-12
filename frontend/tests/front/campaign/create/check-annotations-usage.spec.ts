import { expect, Page, test } from '../../../utils/fixture';
import { accessCreateCampaign } from '../../../utils/campaign/functions';
import { WriteAnnotationCampaign } from '../../../../src/services/api/annotation/campaign.service';
import { expectNoRequestsOnAction } from '../../../utils/functions';
import { CAMPAIGN_URL } from '../../../utils/url';
import { Detector } from '../../../../src/services/api';
import path from 'path';
import { fileURLToPath } from 'url';
import { configuration, dataset, deadline, desc, name, selectInAlert, submit, url } from './util';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory


async function selectCheckAnnotations(page: Page) {
  await page.getByRole('button', { name: 'Select an annotation mode' }).click();
  await page.locator('#options').getByText('Check annotations').click();
}


async function fillBaseForm(page: Page) {
  // Global info
  await page.getByPlaceholder('Campaign name').fill(name);
  await page.getByPlaceholder('Enter your campaign description').fill(desc);
  await page.getByPlaceholder('URL').fill(url);
  await page.getByPlaceholder('Deadline').fill(deadline);
  // Data
  await page.getByRole('button', { name: 'Select a dataset' }).click();
  await selectInAlert(page, dataset);
}

async function importAnnotations(page: Page, filename: string,
                                 onlyFirstDataset: boolean = false,
                                 onlyFirstDetector: boolean = false) {
  // Start waiting for file chooser before clicking. Note no await.
  const modal = page.locator('#import-annotations-modal').first()
  await expect(modal).toBeVisible();
  const fileChooserPromise = page.waitForEvent('filechooser');
  await modal.getByText('Import annotations (csv)').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, filename));

  await expect(modal.getByText('The selected file contains unrecognized datasets')).toBeVisible()
  if (onlyFirstDataset) {
    await modal.getByText('Test Datasets', { exact: true }).click()
    await modal.getByText('Test dataset', { exact: true }).click()
  }
  await modal.getByRole('button', { name: `Use selected datasets as "${ dataset }"` }).click({ force: true });

  await expect(modal.getByText('Unknown detector').first()).toBeVisible()
  await modal.getByText('Assign to detector').first().click()
  await modal.locator('#options:visible').getByText('Create').first().click()
  if (!onlyFirstDetector) {
    await modal.getByText('Assign to detector').first().click()
    await modal.locator('#options:visible').getByText('Create').first().click()
  }
  if (!onlyFirstDataset && !onlyFirstDetector) {
    await modal.getByText('Assign to detector').first().click()
    await modal.locator('#options:visible').getByText('Create').first().click()
  }
  if (onlyFirstDataset) {
    await expect(page.getByText('detector2')).not.toBeVisible();
  }
  await modal.getByRole('button', { name: `Confirm` }).click({ force: true });

  await modal.getByText('Select configuration').first().click()
  await modal.locator('#options:visible').getByText('Create new').first().click()
  await modal.locator('textarea').nth(0).fill(configuration)
  if (!onlyFirstDetector) {
    await modal.getByText('Select configuration').first().click()
    await modal.locator('#options:visible').getByText('Create new').first().click()
    await modal.locator('textarea').nth(1).fill(configuration)
  }
  if (!onlyFirstDataset && !onlyFirstDetector) {
    await modal.getByText('Select configuration').first().click()
    await modal.locator('#options:visible').getByText('Create new').first().click()
    await modal.locator('textarea').last().fill(configuration)
  }
  if (onlyFirstDataset || onlyFirstDetector) {
    await expect(page.getByText('detector2')).not.toBeVisible();
  }
  if (onlyFirstDetector) {
    await expect(page.getByText('detector3')).not.toBeVisible();
  }
  await modal.getByRole('button', { name: `Import` }).click({ force: true });
}

test('Default', {
  tag: '@essential'
}, async ({ annotatorPage: page }) => {
  await accessCreateCampaign(page);
  await fillBaseForm(page);
  // Annotation
  await selectCheckAnnotations(page);
  await page.getByRole('button', { name: 'Import annotations' }).click();
  await importAnnotations(page, "annotation_results.csv")

  await page.route(/api\/annotation-result\/campaign\/-?\d\/import\//g, route => route.fulfill({ status: 500 }))

  const [
    submitResultsRequest,
    submittedCampaign
  ] = await Promise.all([
    page.waitForRequest(/api\/annotation-result\/campaign\/-?\d\/import\//g),
    submit(page),
  ])
  const expectedCampaign: WriteAnnotationCampaign = {
    name,
    desc,
    deadline,
    usage: 'Check',
    datasets: [ dataset ],
    spectro_configs: [ 1, 2, 3, 4 ],
    instructions_url: url,
  }
  expect(submittedCampaign).toEqual(expectedCampaign);
  expect(submitResultsRequest.url()).toContain(`dataset_name=${ encodeURI(dataset) }`)
  expect(submitResultsRequest.url()).toContain(`detectors_map=${ encodeURI(JSON.stringify({
    detector1: { detector: 'detector1', configuration },
    detector2: { detector: 'detector2', configuration },
    detector3: { detector: 'detector3', configuration }
  })) }`)
})

test('Cannot import annotations without selecting dataset', async ({ annotatorPage: page }) => {
  await accessCreateCampaign(page);
  await selectCheckAnnotations(page);
  await expect(page.getByText('You must select a dataset to import annotations', { exact: true })).toBeVisible()
})

test('Can select only first identify dataset', async ({ annotatorPage: page }) => {
  await accessCreateCampaign(page);
  await fillBaseForm(page);
  // Annotation
  await selectCheckAnnotations(page);
  await page.getByRole('button', { name: 'Import annotations' }).click();
  await importAnnotations(page, "annotation_results.csv", true)

  await page.route(/api\/annotation-result\/campaign\/-?\d\/import\//g, route => route.fulfill({ status: 500 }))

  const [
    submitResultsRequest,
    submittedCampaign
  ] = await Promise.all([
    page.waitForRequest(/api\/annotation-result\/campaign\/-?\d\/import\//g),
    submit(page),
  ])
  const expectedCampaign: WriteAnnotationCampaign = {
    name,
    desc,
    deadline,
    usage: 'Check',
    datasets: [ dataset ],
    spectro_configs: [ 1, 2, 3, 4 ],
    instructions_url: url,
  }
  expect(submittedCampaign).toEqual(expectedCampaign);
  expect(submitResultsRequest.url()).toContain(`dataset_name=${ encodeURI(dataset) }`)
  expect(submitResultsRequest.url()).toContain(`detectors_map=${ encodeURI(JSON.stringify({
    detector1: { detector: 'detector1', configuration },
    detector3: { detector: 'detector3', configuration }
  })) }`)
})

test('Can select only first identify detector', async ({ annotatorPage: page }) => {
  await accessCreateCampaign(page);
  await fillBaseForm(page);
  // Annotation
  await selectCheckAnnotations(page);
  await page.getByRole('button', { name: 'Import annotations' }).click();
  await importAnnotations(page, "annotation_results.csv", false, true)

  await page.route(/api\/annotation-result\/campaign\/-?\d\/import\//g, route => route.fulfill({ status: 500 }))

  const [
    submitResultsRequest,
    submittedCampaign
  ] = await Promise.all([
    page.waitForRequest(/api\/annotation-result\/campaign\/-?\d\/import\//g),
    submit(page),
  ])
  const expectedCampaign: WriteAnnotationCampaign = {
    name,
    desc,
    deadline,
    usage: 'Check',
    datasets: [ dataset ],
    spectro_configs: [ 1, 2, 3, 4 ],
    instructions_url: url,
  }
  expect(submittedCampaign).toEqual(expectedCampaign);
  expect(submitResultsRequest.url()).toContain(`dataset_name=${ encodeURI(dataset) }`)
  expect(submitResultsRequest.url()).toContain(`detectors_map=${ encodeURI(JSON.stringify({
    detector1: { detector: 'detector1', configuration },
  })) }`)
})

test('Can unselected all but first detector chip', async ({ annotatorPage: page }) => {
  await accessCreateCampaign(page);
  await fillBaseForm(page);
  // Annotation
  await selectCheckAnnotations(page);
  await page.getByRole('button', { name: 'Import annotations' }).click();
  await importAnnotations(page, "annotation_results.csv")

  // Unselect other detectors
  await page.locator('ion-chip').getByText('detector2', { exact: true }).click()
  await page.locator('ion-chip').getByText('detector3', { exact: true }).click()

  await page.route(/api\/annotation-result\/campaign\/-?\d\/import\//g, route => route.fulfill({ status: 500 }))

  const [
    submitResultsRequest,
    submittedCampaign
  ] = await Promise.all([
    page.waitForRequest(/api\/annotation-result\/campaign\/-?\d\/import\//g),
    submit(page),
  ])
  const expectedCampaign: WriteAnnotationCampaign = {
    name,
    desc,
    deadline,
    usage: 'Check',
    datasets: [ dataset ],
    spectro_configs: [ 1, 2, 3, 4 ],
    instructions_url: url,
  }
  expect(submittedCampaign).toEqual(expectedCampaign);
  expect(submitResultsRequest.url()).toContain(`dataset_name=${ encodeURI(dataset) }`)
  expect(submitResultsRequest.url()).toContain(`detectors_map=${ encodeURI(JSON.stringify({
    detector1: { detector: 'detector1', configuration },
  })) }`)
})

test('Can unselected all detectors', async ({ annotatorPage: page }) => {
  await accessCreateCampaign(page);
  await fillBaseForm(page);
  // Annotation
  await selectCheckAnnotations(page);
  await page.getByRole('button', { name: 'Import annotations' }).click();
  await importAnnotations(page, "annotation_results.csv")

  // Unselect all detectors
  await page.locator('ion-chip').getByText('detector1', { exact: true }).click()
  await page.locator('ion-chip').getByText('detector2', { exact: true }).click()
  await page.locator('ion-chip').getByText('detector3', { exact: true }).click()
  await expectNoRequestsOnAction(
    page,
    () => page.getByRole('button', { name: 'Create campaign' }).click(),
    CAMPAIGN_URL
  )
})

test('Can delete import', async ({ annotatorPage: page }) => {
  await accessCreateCampaign(page);
  await fillBaseForm(page);
  // Annotation
  await selectCheckAnnotations(page);
  await page.getByRole('button', { name: 'Import annotations' }).click();
  await importAnnotations(page, "annotation_results.csv")

  // Unselect all detectors
  await page.locator('#detector-import-results').getByRole('button').click()
  await expect(page.getByRole('button', { name: 'Import annotations' })).toBeVisible();

  await expectNoRequestsOnAction(
    page,
    () => page.getByRole('button', { name: 'Create campaign' }).click(),
    CAMPAIGN_URL
  )
})

test('Handle import some annotation not matching dataset files', {
  tag: '@essential'
}, async ({ annotatorPage: page }) => {

  await accessCreateCampaign(page);
  await fillBaseForm(page);
  // Annotation
  await selectCheckAnnotations(page);
  await page.getByRole('button', { name: 'Import annotations' }).click();
  await importAnnotations(page, "annotation_results.csv")

  await page.route(/api\/annotation-result\/campaign\/-?\d\/import\//g, route => route.fulfill({
    status: 400,
    json: [ { non_field_errors: [ 'This start and end datetime does not belong to any file of the dataset' ] } ]
  }))

  const [
    submitResultsRequest,
    submittedCampaign
  ] = await Promise.all([
    page.waitForRequest(/api\/annotation-result\/campaign\/-?\d\/import\//g),
    submit(page),
  ])
  const expectedCampaign: WriteAnnotationCampaign = {
    name,
    desc,
    deadline,
    usage: 'Check',
    datasets: [ dataset ],
    spectro_configs: [ 1, 2, 3, 4 ],
    instructions_url: url,
  }
  expect(submittedCampaign).toEqual(expectedCampaign);
  expect(submitResultsRequest.url()).toContain(`dataset_name=${ encodeURI(dataset) }`)
  expect(submitResultsRequest.url()).toContain(`detectors_map=${ encodeURI(JSON.stringify({
    detector1: { detector: 'detector1', configuration },
    detector2: { detector: 'detector2', configuration },
    detector3: { detector: 'detector3', configuration }
  })) }`)

  const toast = page.locator('ion-toast').first()
  const [
    submitResultsRequestFinal,
  ] = await Promise.all([
    page.waitForRequest(/api\/annotation-result\/campaign\/-?\d\/import\//g),
    toast.getByRole('button', { name: 'Create anyway' }).click()
  ])
  expect(submitResultsRequestFinal.url()).toContain(`dataset_name=${ encodeURI(dataset) }`)
  expect(submitResultsRequestFinal.url()).toContain(`detectors_map=${ encodeURI(JSON.stringify({
    detector1: { detector: 'detector1', configuration },
    detector2: { detector: 'detector2', configuration },
    detector3: { detector: 'detector3', configuration }
  })) }`)
  expect(submitResultsRequestFinal.url()).toContain(`force=true`)
})

test('Handle detector already in database', {
  tag: '@essential'
}, async ({ annotatorPage: page }) => {
  await page.route(/api\/detector/g, route => route.fulfill({
    status: 200, json: [ {
      name: 'detector1',
      id: -1,
      configurations: []
    } as Detector ]
  }))
  await accessCreateCampaign(page);
  await fillBaseForm(page);
  // Annotation
  await selectCheckAnnotations(page);
  await page.getByRole('button', { name: 'Import annotations' }).click();

  // Start waiting for file chooser before clicking. Note no await.
  const modal = page.locator('#import-annotations-modal').first()
  await expect(modal).toBeVisible();
  const fileChooserPromise = page.waitForEvent('filechooser');
  await modal.getByText('Import annotations (csv)').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, "annotation_results.csv"));

  await expect(modal.getByText('The selected file contains unrecognized datasets')).toBeVisible()
  await modal.getByRole('button', { name: `Use selected datasets as "${ dataset }"` }).click({ force: true });

  await expect(modal.getByText('detector1Already in database').first()).toBeVisible()
})