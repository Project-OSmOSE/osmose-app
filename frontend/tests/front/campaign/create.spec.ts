import { expect, Page, test } from '../../utils/fixture';
import { accessCreateCampaign } from '../../utils/campaign/functions';
import { expectNoRequestsOnAction } from '../../utils/functions';
import { CAMPAIGN_URL, CREATE_CAMPAIGN_URL } from '../../utils/url';
import { WriteAnnotationCampaign } from '../../../src/services/api/annotation/campaign.service';
import { Detector } from '../../../src/services/api';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const name = 'Test campaign';
const desc = 'Test description';
const url = 'url@test.co';
const deadline = '2032-12-12';
const dataset = 'Test Dataset'; // Spectro config: [1, 2, 3, 4]
const labelSet = 'Test SPM campaign'; // ID: 1
const confidenceSet = 'Confident/NotConfident'; // ID: 1
const configuration = 'Test configuration';

async function selectCreateAnnotations(page: Page) {
  await page.getByRole('button', { name: 'Select an annotation mode' }).click();
  await page.locator('#options').getByText('Create annotations').click();
}

async function selectCheckAnnotations(page: Page) {
  await page.getByRole('button', { name: 'Select an annotation mode' }).click();
  await page.locator('#options').getByText('Check annotations').click();
}

async function selectInAlert(page: Page, item: string) {
  const alert = page.locator('ion-alert:visible').first()
  await expect(alert).toBeVisible();
  await alert.getByText(item).click();
  await alert.getByRole('button', { name: 'Ok' }).click();
}

async function submit(page: Page, mockResponse?: {
  status: number,
  json: any
}): Promise<Array<WriteAnnotationCampaign>> {
  await page.route(CREATE_CAMPAIGN_URL, (route, request) => {
    if (request.method() === 'POST') {
      route.fulfill(mockResponse ?? { status: 200, json: { id: -1 } })
    }
  })
  const [ request ] = await Promise.all([
    page.waitForRequest(CREATE_CAMPAIGN_URL),
    page.getByRole('button', { name: 'Create campaign' }).click()
  ])
  return request.postDataJSON()
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

test.describe('Empty states', () => {
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
})

test.describe('"Create annotation" campaign', () => {
  test('Default', async ({ annotatorPage: page }) => {
    await accessCreateCampaign(page);
    // Global info
    await page.getByPlaceholder('Campaign name').fill(name);
    await page.getByPlaceholder('Enter your campaign description').fill(desc);
    await page.getByPlaceholder('URL').fill(url);
    await page.getByPlaceholder('Deadline').fill(deadline);
    // Data
    await page.getByRole('button', { name: 'Select a dataset' }).click();
    await selectInAlert(page, dataset);
    // Annotation
    await selectCreateAnnotations(page);
    await page.getByRole('button', { name: 'Select a label set' }).click();
    await selectInAlert(page, labelSet);
    await page.getByRole('button', { name: 'Select a confidence set' }).click();
    await selectInAlert(page, confidenceSet);

    const submittedData = await submit(page);
    const expectedData: WriteAnnotationCampaign = {
      name,
      desc,
      deadline,
      datasets: [ dataset ],
      label_set: 1,
      confidence_indicator_set: 1,
      spectro_configs: [ 1, 2, 3, 4 ],
      instructions_url: url,
      usage: 'Create',
    }
    expect(submittedData).toEqual(expectedData);
  })

  test('Only needed info', async ({ annotatorPage: page }) => {
    await accessCreateCampaign(page);
    // Global info
    await page.getByPlaceholder('Campaign name').fill(name);
    // Data
    await page.getByRole('button', { name: 'Select a dataset' }).click();
    await selectInAlert(page, dataset);
    // Annotation
    await selectCreateAnnotations(page);
    await page.getByRole('button', { name: 'Select a label set' }).click();
    await selectInAlert(page, labelSet);

    const submittedData = await submit(page);
    const expectedData: WriteAnnotationCampaign = {
      name,
      datasets: [ dataset ],
      label_set: 1,
      spectro_configs: [ 1, 2, 3, 4 ],
      usage: 'Create',
      instructions_url: null,
      confidence_indicator_set: null,
      desc: null,
      deadline: null,
    }
    expect(submittedData).toEqual(expectedData);
  })

  test('Handle errors', async ({ annotatorPage: page }) => {
    await accessCreateCampaign(page);
    // Global info
    await page.getByPlaceholder('Campaign name').fill(name);
    // Data
    await page.getByRole('button', { name: 'Select a dataset' }).click();
    await selectInAlert(page, dataset);
    // Annotation
    await selectCreateAnnotations(page);
    await page.getByRole('button', { name: 'Select a label set' }).click();
    await selectInAlert(page, labelSet);

    const getError = (field: string) => `Custom error for ${ field }`;
    await submit(page, {
      status: 400,
      json: {
        name: [ getError('name') ],
        desc: [ getError('desc') ],
        instructions_url: [ getError('instructions_url') ],
        deadline: [ getError('deadline') ],
        datasets: [ getError('datasets') ],
        spectro_configs: [ getError('spectro_configs') ],
        usage: [ getError('usage') ],
        label_set: [ getError('label_set') ],
        confidence_indicator_set: [ getError('confidence_indicator_set') ],
      }
    });

    await expect(page.getByText(getError('name'), { exact: true })).toBeVisible()
    await expect(page.getByText(getError('desc'), { exact: true })).toBeVisible()
    await expect(page.getByText(getError('instructions_url'), { exact: true })).toBeVisible()
    await expect(page.getByText(getError('deadline'), { exact: true })).toBeVisible()
    await expect(page.getByText(getError('datasets'), { exact: true })).toBeVisible()
    await expect(page.getByText(getError('spectro_configs'), { exact: true })).toBeVisible()
    await expect(page.getByText(getError('usage'), { exact: true })).toBeVisible()
    await expect(page.getByText(getError('label_set'), { exact: true })).toBeVisible()
    await expect(page.getByText(getError('confidence_indicator_set'), { exact: true })).toBeVisible()
  })
})

test.describe('"Check annotation" campaign', () => {
  test('Default', async ({ annotatorPage: page }) => {
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

  test('Handle import some annotation not matching dataset files', async ({ annotatorPage: page }) => {

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

  test('Handle detector already in database', async ({ annotatorPage: page }) => {
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

})