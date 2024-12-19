import { expect, Page, test } from '../../utils/fixture';
import { accessAnnotator } from '../../utils/annotations/functions';
import { DEFAULT_CAMPAIGN_NAME } from '../../utils/campaign/data';

const DEFAULT_DATA = {
  "campaign": {
    "id": 1,
    "files_count": 1426,
    "datasets": [
      "POINT_F_20072023"
    ],
    "my_progress": 0,
    "my_total": 1426,
    "progress": 0,
    "total": 1426,
    "usage": "Check",
    "label_set": 32,
    "confidence_indicator_set": null,
    "owner": "emorin",
    "spectro_configs": [
      162
    ],
    "archive": null,
    "created_at": "2024-11-06T17:10:55.302998Z",
    "name": "test f bis",
    "desc": null,
    "instructions_url": null,
    "deadline": null,
    "annotation_scope": 2,
    "annotators": [
      234
    ]
  },
  "file": {
    "id": 1,
    "dataset_sr": 128000.0,
    "audio_url": "/backend/static/datawork/dataset/CETIROISE/POINT_F_20072023/data%5Caudio%5C60_128000%5C2023_07_20_00_14_00.wav",
    "dataset_name": "POINT_F_20072023",
    "filename": "2023_07_20_00_14_00.wav",
    "size": 0,
    "start": "2023-07-19T22:14:00Z",
    "end": "2023-07-19T22:15:00Z",
    "dataset": 339
  },
  "user": {
    "id": 234,
    "username": "emorin",
    "email": "emorin@osmose.xyz",
    "first_name": "Elodie",
    "last_name": "Morin",
    "expertise_level": null,
    "is_staff": true,
    "is_superuser": true
  },
  "results": [
    {
      "id": 1,
      "label": "Whistle and moan detector",
      "confidence_indicator": null,
      "annotator": null,
      "dataset_file": 1,
      "detector_configuration": {
        "id": 1,
        "detector": "PAMGuard",
        "configuration": "Julie configuration for PAMGuard"
      },
      "start_time": 16.667,
      "end_time": 16.707,
      "start_frequency": 5000.0,
      "end_frequency": 6250.0,
      "comments": [],
      "validations": [],
      "annotation_campaign": 282
    },
    {
      "id": 2,
      "label": "Whistle and moan detector",
      "confidence_indicator": null,
      "annotator": null,
      "dataset_file": 1,
      "detector_configuration": {
        "id": 1,
        "detector": "PAMGuard",
        "configuration": "Julie configuration for PAMGuard"
      },
      "start_time": null,
      "end_time": null,
      "start_frequency": null,
      "end_frequency": null,
      "comments": [],
      "validations": [],
      "annotation_campaign": 282
    }
  ],
  "task_comments": [],
  "label_set": {
    "id": 32,
    "name": "test f bis label set",
    "desc": null,
    "labels": [
      "Whistle and moan detector"
    ]
  },
  "confidence_set": null,
  "spectrogram_configurations": [
    {
      "id": 162,
      "folder_path": "/backend/static/datawork/dataset/CETIROISE/POINT_F_20072023/processed%5Cspectrogram%5C60_128000%5C2048_2048_80/image",
      "name": "2048_2048_80",
      "desc": null,
      "nfft": 2048,
      "window_size": 2048,
      "overlap": 80.0,
      "zoom_level": 3,
      "spectro_normalization": "spectrum",
      "data_normalization": "zscore",
      "zscore_duration": "original",
      "hp_filter_min_freq": 1,
      "colormap": "viridis",
      "dynamic_min": -40,
      "dynamic_max": 40,
      "frequency_resolution": 62.5,
      "temporal_resolution": 0.003,
      "sensitivity_dB": null,
      "spectro_duration": 60.0,
      "peak_voltage": null,
      "gain_dB": null,
      "audio_file_dataset_overlap": 0.0,
      "time_resolution_zoom_0": 0.0,
      "time_resolution_zoom_1": 0.0,
      "time_resolution_zoom_2": 0.0,
      "time_resolution_zoom_3": 0.0,
      "time_resolution_zoom_4": 0.0,
      "time_resolution_zoom_5": 0.0,
      "time_resolution_zoom_6": 0.0,
      "time_resolution_zoom_7": 0.0,
      "time_resolution_zoom_8": 0.0,
      "window_type": {
        "id": 4,
        "name": "hamming"
      },
      "linear_frequency_scale": null,
      "multi_linear_frequency_scale": null
    }
  ],
  "previous_file_id": null,
  "next_file_id": 779303
}
const comment = "Test comment"

const expected_box = {
  ...DEFAULT_DATA.results[0],
  annotation_campaign: undefined,
  annotator: undefined,
  dataset_file: undefined,
}
const expected_tag = {
  ...DEFAULT_DATA.results[1],
  annotation_campaign: undefined,
  annotator: undefined,
  dataset_file: undefined,
}

function getValidationButtons(page: Page) {
  return {
    tagValidate: page.locator('ion-button.validate').first(),
    tagInvalidate: page.locator('ion-button.invalidate').first(),
    boxValidate: page.locator('ion-button.validate').nth(1),
    boxInvalidate: page.locator('ion-button.invalidate').nth(1),
  }
}

test('global', {
  tag: '@essential'
}, async ({ annotatorPage: page }) => {
  await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({ status: 200, json: DEFAULT_DATA }))
  await accessAnnotator(page)
  await expect(page.getByText('Labels list')).not.toBeVisible()
  await expect(page.getByText('Presence / Absence')).not.toBeVisible()
  await expect(page.getByText('Confidence indicator')).not.toBeVisible()
})

test('No results', async ({ annotatorPage: page }) => {
  await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({
    status: 200,
    json: {
      ...DEFAULT_DATA,
      results: []
    }
  }))
  await accessAnnotator(page)
  await expect(page.getByText('No results')).toBeVisible()
})

test.describe('Detection validations', {
  tag: '@essential'
}, () => {
  test('Can validate only tag', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({ status: 200, json: DEFAULT_DATA }))
    await accessAnnotator(page)
    const buttons = getValidationButtons(page)
    await expect(buttons.tagValidate).toHaveAttribute('color', 'medium')
    await expect(buttons.tagInvalidate).toHaveAttribute('color', 'danger')
    await expect(buttons.boxValidate).toHaveAttribute('color', 'medium')
    await expect(buttons.boxInvalidate).toHaveAttribute('color', 'danger')

    await buttons.tagValidate.click()
    await expect(buttons.tagValidate).toHaveAttribute('color', 'success')
    await expect(buttons.tagInvalidate).toHaveAttribute('color', 'medium')
    await expect(buttons.boxValidate).toHaveAttribute('color', 'medium')
    await expect(buttons.boxInvalidate).toHaveAttribute('color', 'danger')

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedResults = request.postDataJSON().results;
    const expectedResults = [
      { ...expected_box, validations: [ { is_valid: false, id: null } ] },
      { ...expected_tag, validations: [ { is_valid: true, id: null } ] },
    ]
    expect(submittedResults).toEqual(expectedResults);
  })

  test('Can validate box', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({ status: 200, json: DEFAULT_DATA }))
    await accessAnnotator(page)
    const buttons = getValidationButtons(page)
    await expect(buttons.tagValidate).toHaveAttribute('color', 'medium')
    await expect(buttons.tagInvalidate).toHaveAttribute('color', 'danger')
    await expect(buttons.boxValidate).toHaveAttribute('color', 'medium')
    await expect(buttons.boxInvalidate).toHaveAttribute('color', 'danger')

    await buttons.boxValidate.click()
    await expect(buttons.tagValidate).toHaveAttribute('color', 'success')
    await expect(buttons.tagInvalidate).toHaveAttribute('color', 'medium')
    await expect(buttons.boxValidate).toHaveAttribute('color', 'success')
    await expect(buttons.boxInvalidate).toHaveAttribute('color', 'medium')

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedResults = request.postDataJSON().results;
    const expectedResults = [
      { ...expected_box, validations: [ { is_valid: true, id: null } ] },
      { ...expected_tag, validations: [ { is_valid: true, id: null } ] },
    ]
    expect(submittedResults).toEqual(expectedResults);
  })

  test('Can invalidate box', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({ status: 200, json: DEFAULT_DATA }))
    await accessAnnotator(page)
    const buttons = getValidationButtons(page)
    await buttons.boxValidate.click()
    await expect(buttons.tagValidate).toHaveAttribute('color', 'success')
    await expect(buttons.tagInvalidate).toHaveAttribute('color', 'medium')
    await expect(buttons.boxValidate).toHaveAttribute('color', 'success')
    await expect(buttons.boxInvalidate).toHaveAttribute('color', 'medium')

    await buttons.boxInvalidate.click()
    await expect(buttons.tagValidate).toHaveAttribute('color', 'success')
    await expect(buttons.tagInvalidate).toHaveAttribute('color', 'medium')
    await expect(buttons.boxValidate).toHaveAttribute('color', 'medium')
    await expect(buttons.boxInvalidate).toHaveAttribute('color', 'danger')

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedResults = request.postDataJSON().results;
    const expectedResults = [
      { ...expected_box, validations: [ { is_valid: false, id: null } ] },
      { ...expected_tag, validations: [ { is_valid: true, id: null } ] },
    ]
    expect(submittedResults).toEqual(expectedResults);
  })

  test('Can invalidate tag', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({ status: 200, json: DEFAULT_DATA }))
    await accessAnnotator(page)
    const buttons = getValidationButtons(page)
    await buttons.boxValidate.click()
    await expect(buttons.tagValidate).toHaveAttribute('color', 'success')
    await expect(buttons.tagInvalidate).toHaveAttribute('color', 'medium')
    await expect(buttons.boxValidate).toHaveAttribute('color', 'success')
    await expect(buttons.boxInvalidate).toHaveAttribute('color', 'medium')

    await buttons.tagInvalidate.click()
    await expect(buttons.tagValidate).toHaveAttribute('color', 'medium')
    await expect(buttons.tagInvalidate).toHaveAttribute('color', 'danger')
    await expect(buttons.boxValidate).toHaveAttribute('color', 'medium')
    await expect(buttons.boxInvalidate).toHaveAttribute('color', 'danger')

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedResults = request.postDataJSON().results;
    const expectedResults = [
      { ...expected_box, validations: [ { is_valid: false, id: null } ] },
      { ...expected_tag, validations: [ { is_valid: false, id: null } ] },
    ]
    expect(submittedResults).toEqual(expectedResults);
  })
})

test.describe('Comments', {
  tag: '@essential'
}, () => {
  test('Can add comment on the task', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({ status: 200, json: DEFAULT_DATA }))
    await accessAnnotator(page)
    await page.getByPlaceholder('Enter your comment').fill(comment)

    // Check tag comment
    await page.getByText('Whistle and moan detector').first().click()
    await expect(page.getByPlaceholder('Enter your comment')).not.toHaveValue(comment)

    // Check box comment
    await page.getByText('Whistle and moan detector').nth(1).click()
    await expect(page.getByPlaceholder('Enter your comment')).not.toHaveValue(comment)

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedData = request.postDataJSON();
    const expectedResults = [
      { ...expected_box, validations: [ { is_valid: false, id: null } ] },
      { ...expected_tag, validations: [ { is_valid: false, id: null } ] },
    ]
    expect(submittedData.results).toEqual(expectedResults);
    expect(submittedData.task_comments).toEqual([ { comment } ]);
  })

  test('Can add comment on the tag', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({ status: 200, json: DEFAULT_DATA }))
    await accessAnnotator(page)
    await page.getByText('Whistle and moan detector').nth(1).click()
    await page.getByPlaceholder('Enter your comment').fill(comment)

    // Check box comment
    await page.getByText('Whistle and moan detector').nth(2).click()
    await expect(page.getByPlaceholder('Enter your comment')).not.toHaveValue(comment)

    // Check task comment
    await page.getByText('Task Comment').click()
    await expect(page.getByPlaceholder('Enter your comment')).not.toHaveValue(comment)

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedData = request.postDataJSON();
    const expectedResults = [
      { ...expected_box, validations: [ { is_valid: false, id: null } ] },
      { ...expected_tag, comments: [ { comment } ], validations: [ { is_valid: false, id: null } ] },
    ]
    expect(submittedData.results).toEqual(expectedResults);
    expect(submittedData.task_comments).toEqual([]);
  })

  test('Can add comment on the box', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({ status: 200, json: DEFAULT_DATA }))
    await accessAnnotator(page)
    await page.getByText('Whistle and moan detector').nth(2).click()
    await page.getByPlaceholder('Enter your comment').fill(comment)

    // Check tag comment
    await page.getByText('Whistle and moan detector').nth(1).click()
    await expect(page.getByPlaceholder('Enter your comment')).not.toHaveValue(comment)

    // Check task comment
    await page.getByText('Task Comment').click()
    await expect(page.getByPlaceholder('Enter your comment')).not.toHaveValue(comment)

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedData = request.postDataJSON();
    const expectedResults = [
      { ...expected_box, comments: [ { comment } ], validations: [ { is_valid: false, id: null } ] },
      { ...expected_tag, validations: [ { is_valid: false, id: null } ] },
    ]
    expect(submittedData.results).toEqual(expectedResults);
    expect(submittedData.task_comments).toEqual([]);
  })
})

test('Can go back to campaign', {
  tag: '@essential'
}, async ({ annotatorPage: page }) => {
  await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({ status: 200, json: DEFAULT_DATA }))
  await accessAnnotator(page)
  await page.getByRole('button', { name: 'Back to campaign' }).click()
  await expect(page.getByRole('heading', { name: DEFAULT_CAMPAIGN_NAME })).toBeVisible()
})