import { expect, test } from '../../../utils/fixture';
import { accessCreateCampaign } from '../../../utils/campaign/functions';
import { WriteAnnotationCampaign } from '../../../../src/services/api/annotation/campaign.service';
import {
  confidenceSet,
  dataset,
  deadline,
  desc,
  labelSet,
  name,
  selectCreateAnnotations,
  selectInAlert,
  submit,
  url
} from './util';
import { ADMIN, ANNOTATOR } from '../../../utils/auth/data';
import { WriteAnnotationFileRange } from '../../../../src/services/api/annotation/file-range.service';

test('Default without annotators', async ({ annotatorPage: page }) => {
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

test('Default with annotators', {
  tag: '@essential'
}, async ({ annotatorPage: page }) => {
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

  // Annotators
  await page.getByPlaceholder('Search annotator').locator('input').fill(ANNOTATOR.displayName);
  await page.locator('#searchbar-results').getByText(ANNOTATOR.displayName).click();
  await page.getByPlaceholder('Search annotator').locator('input').fill(ADMIN.displayName);
  await page.locator('#searchbar-results').getByText(ADMIN.displayName).click();

  await page.route(/\/api\/annotation-file-range\//g, (route, request) => {
    if (request.method() === 'POST') {
      route.fulfill({ status: 200, json: { id: -1 } })
    }
  })
  const [ submittedAnnotatorData, submittedData ] = await Promise.all([
    page.waitForRequest(/\/api\/annotation-file-range\//g),
    submit(page)
  ])
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
  const expectedAnnotatorData: Array<WriteAnnotationFileRange> = [ {
    "annotator": ANNOTATOR.id,
    "first_file_index": 0,
    "last_file_index": 98
  }, {
    "annotator": ADMIN.id,
    "first_file_index": 0,
    "last_file_index": 98
  } ]
  expect(submittedData).toEqual(expectedData);
  expect(submittedAnnotatorData.postDataJSON()).toEqual(expectedAnnotatorData);
})

test('Only needed info', {
  tag: '@essential'
}, async ({ annotatorPage: page }) => {
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

test('Handle errors', {
  tag: '@essential'
}, async ({ annotatorPage: page }) => {
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