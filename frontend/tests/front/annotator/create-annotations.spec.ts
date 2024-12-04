import { expect, test } from '../../utils/fixture';
import { accessAnnotator } from '../../utils/annotations/functions';
import { DEFAULT_CAMPAIGN_NAME } from '../../utils/campaign/data';
import { WriteAnnotationResult } from '../../../src/service/campaign/result';

const DEFAULT_DATA = {
  "campaign": {
    "id": 1,
    "files_count": 99,
    "datasets": [
      "Test Dataset"
    ],
    "my_progress": 78,
    "my_total": 99,
    "progress": 2406,
    "total": 4158,
    "usage": "Create",
    "label_set": 1,
    "confidence_indicator_set": 1,
    "owner": "admin",
    "spectro_configs": [
      1,
      2,
      3,
      4
    ],
    "archive": null,
    "created_at": "2024-11-06T11:19:39.229742Z",
    "name": "Test Dataset campaign",
    "desc": "Hotel court stop program executive.",
    "instructions_url": "http://www.perez.com/wp-content/bloghomepage.html",
    "deadline": "2010-11-02",
    "annotation_scope": 2,
    "annotators": [
      1,
      2,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44
    ]
  },
  "file": {
    "id": 1,
    "dataset_sr": 327680.0,
    "audio_url": "/backend/static/seed/dataset_path/data/audio/50h_0.wav",
    "dataset_name": "Test Dataset",
    "filename": "sound001.wav",
    "size": 58982478,
    "start": "2012-10-03T11:00:00Z",
    "end": "2012-10-03T11:15:00Z",
    "dataset": 1
  },
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@osmose.xyz",
    "first_name": "",
    "last_name": "",
    "expertise_level": "Expert",
    "is_staff": true,
    "is_superuser": true
  },
  "results": [
    {
      "id": 1,
      "label": "Rain",
      "confidence_indicator": "not confident",
      "annotator": 1,
      "dataset_file": 1,
      "detector_configuration": null,
      "start_time": 185.0,
      "end_time": 284.0,
      "start_frequency": 7672.0,
      "end_frequency": 9876.0,
      "comments": [
        {
          "id": 1601,
          "annotation_result": 1,
          "annotation_campaign": 1,
          "author": 1,
          "dataset_file": 1,
          "comment": "a comment : Rain"
        }
      ],
      "validations": [],
      "annotation_campaign": 1
    }
  ],
  "task_comments": [],
  "label_set": {
    "id": 1,
    "name": "Test SPM campaign",
    "desc": "Label set made for Test SPM campaign",
    "labels": [
      "Mysticetes",
      "Odoncetes",
      "Boat",
      "Rain",
      "Other"
    ]
  },
  "confidence_set": {
    "id": 1,
    "name": "Confident/NotConfident",
    "desc": "Hair middle benefit sort hotel woman available dog. Table message address minute eight behavior remember. Discuss million understand reveal huge water. Consider simple spring modern. Game treatment within management clear head large question. Natural interesting yes live scene if behavior then.",
    "confidence_indicators": [
      {
        "id": 2,
        "isDefault": true,
        "label": "confident",
        "level": 1,
        "is_default": true
      },
      {
        "id": 1,
        "isDefault": false,
        "label": "not confident",
        "level": 0,
        "is_default": false
      }
    ]
  },
  "spectrogram_configurations": [
    {
      "id": 1,
      "folder_path": "/backend/static/seed/dataset_path/processed%5Cspectrogram%5C4096_4096_90/image",
      "name": "4096_4096_90",
      "desc": null,
      "nfft": 4096,
      "window_size": 4096,
      "overlap": 90.0,
      "zoom_level": 3,
      "spectro_normalization": "density",
      "data_normalization": "0",
      "zscore_duration": "0",
      "hp_filter_min_freq": 0,
      "colormap": "Blues",
      "dynamic_min": 0,
      "dynamic_max": 0,
      "frequency_resolution": 0.0,
      "temporal_resolution": null,
      "sensitivity_dB": null,
      "spectro_duration": null,
      "peak_voltage": null,
      "gain_dB": null,
      "audio_file_dataset_overlap": null,
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
        "id": 1,
        "name": "Hamming"
      },
      "linear_frequency_scale": null,
      "multi_linear_frequency_scale": null
    },
    {
      "id": 2,
      "folder_path": "/backend/static/seed/dataset_path/processed%5Cspectrogram%5C4096_4096_90/image",
      "name": "4096_4096_90",
      "desc": null,
      "nfft": 4096,
      "window_size": 4096,
      "overlap": 90.0,
      "zoom_level": 3,
      "spectro_normalization": "density",
      "data_normalization": "0",
      "zscore_duration": "0",
      "hp_filter_min_freq": 0,
      "colormap": "Blues",
      "dynamic_min": 0,
      "dynamic_max": 0,
      "frequency_resolution": 0.0,
      "temporal_resolution": null,
      "sensitivity_dB": null,
      "spectro_duration": null,
      "peak_voltage": null,
      "gain_dB": null,
      "audio_file_dataset_overlap": null,
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
        "id": 1,
        "name": "Hamming"
      },
      "linear_frequency_scale": null,
      "multi_linear_frequency_scale": {
        "id": 1,
        "name": "porp_delph",
        "inner_scales": [
          {
            "id": 1,
            "name": null,
            "ratio": 0.5,
            "min_value": 0.0,
            "max_value": 30000.0
          },
          {
            "id": 2,
            "name": null,
            "ratio": 0.7,
            "min_value": 30000.0,
            "max_value": 80000.0
          },
          {
            "id": 3,
            "name": null,
            "ratio": 1.0,
            "min_value": 80000.0,
            "max_value": 163840.0
          }
        ]
      }
    },
    {
      "id": 3,
      "folder_path": "/backend/static/seed/dataset_path/processed%5Cspectrogram%5C4096_4096_90/image",
      "name": "4096_4096_90",
      "desc": null,
      "nfft": 4096,
      "window_size": 4096,
      "overlap": 90.0,
      "zoom_level": 3,
      "spectro_normalization": "density",
      "data_normalization": "0",
      "zscore_duration": "0",
      "hp_filter_min_freq": 0,
      "colormap": "Blues",
      "dynamic_min": 0,
      "dynamic_max": 0,
      "frequency_resolution": 0.0,
      "temporal_resolution": null,
      "sensitivity_dB": null,
      "spectro_duration": null,
      "peak_voltage": null,
      "gain_dB": null,
      "audio_file_dataset_overlap": null,
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
        "id": 1,
        "name": "Hamming"
      },
      "linear_frequency_scale": null,
      "multi_linear_frequency_scale": {
        "id": 2,
        "name": "dual_lf_hf",
        "inner_scales": [
          {
            "id": 4,
            "name": null,
            "ratio": 0.5,
            "min_value": 0.0,
            "max_value": 22000.0
          },
          {
            "id": 5,
            "name": null,
            "ratio": 1.0,
            "min_value": 100000.0,
            "max_value": 163840.0
          }
        ]
      }
    },
    {
      "id": 4,
      "folder_path": "/backend/static/seed/dataset_path/processed%5Cspectrogram%5C4096_4096_90/image",
      "name": "4096_4096_90",
      "desc": null,
      "nfft": 4096,
      "window_size": 4096,
      "overlap": 90.0,
      "zoom_level": 3,
      "spectro_normalization": "density",
      "data_normalization": "0",
      "zscore_duration": "0",
      "hp_filter_min_freq": 0,
      "colormap": "Blues",
      "dynamic_min": 0,
      "dynamic_max": 0,
      "frequency_resolution": 0.0,
      "temporal_resolution": null,
      "sensitivity_dB": null,
      "spectro_duration": null,
      "peak_voltage": null,
      "gain_dB": null,
      "audio_file_dataset_overlap": null,
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
        "id": 1,
        "name": "Hamming"
      },
      "linear_frequency_scale": {
        "id": 6,
        "name": "audible",
        "ratio": 1.0,
        "min_value": 0.0,
        "max_value": 22000.0
      },
      "multi_linear_frequency_scale": null
    }
  ],
  "previous_file_id": null,
  "next_file_id": 2
}
const label = 'Mysticetes'
const defaultConfidence = 'confident'
const comment = "Test comment"

// TODO: use absolute clientY - For do not manage to scroll to the top of the window :/
const start_coords = {
  clientX: 380,
  // clientY: 410, // Absolute
  clientY: 70, // Relative to the scroll position of when this is used
  time: 171.26309983452842,
  frequency: 32640
}
const end_coords = {
  clientX: 610,
  // clientY: 480, // Absolute
  clientY: 120, // Relative to the scroll position of when this is used
  time: 285.438499724214,
  frequency: 16640,
}

test.describe('No results', {
  tag: '@essential'
}, () => {
  test('A text is shown', async ({ annotatorPage: page }) => {
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

  test('Can add presence', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({
      status: 200,
      json: {
        ...DEFAULT_DATA,
        results: []
      }
    }))
    await accessAnnotator(page)

    await expect(page.getByRole('button', { name: label })).not.toBeEnabled()
    await page.getByRole('checkbox', { name: label }).check()
    await expect(page.getByText(label).nth(2)).toBeVisible()
    await expect(page.getByRole('button', { name: label })).toBeEnabled()

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedData = request.postDataJSON();
    const expectedResults: Array<WriteAnnotationResult> = [
      {
        id: null,
        label,
        detector_configuration: null,
        validations: [],
        comments: [],
        confidence_indicator: defaultConfidence,
        start_time: null,
        end_time: null,
        start_frequency: null,
        end_frequency: null
      }
    ]
    expect(submittedData.results).toEqual(expectedResults);
  })

  test('Can add presence submitted with "enter" key', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({
      status: 200,
      json: {
        ...DEFAULT_DATA,
        results: []
      }
    }))
    await accessAnnotator(page)

    await expect(page.getByRole('button', { name: label })).not.toBeEnabled()
    await page.getByRole('checkbox', { name: label }).check()
    await expect(page.getByText(label).nth(2)).toBeVisible()
    await expect(page.getByRole('button', { name: label })).toBeEnabled()

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.keyboard.press('Enter')
    ])
    const submittedData = request.postDataJSON();
    const expectedResults: Array<WriteAnnotationResult> = [
      {
        id: null,
        label,
        detector_configuration: null,
        validations: [],
        comments: [],
        confidence_indicator: defaultConfidence,
        start_time: null,
        end_time: null,
        start_frequency: null,
        end_frequency: null
      }
    ]
    expect(submittedData.results).toEqual(expectedResults);
  })

  test('Can add not confident presence', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({
      status: 200,
      json: {
        ...DEFAULT_DATA,
        results: []
      }
    }))
    await accessAnnotator(page)

    await expect(page.getByRole('button', { name: label })).not.toBeEnabled()
    await page.getByRole('checkbox', { name: label }).check()
    await expect(page.getByText(label).nth(2)).toBeVisible()
    await expect(page.getByRole('button', { name: label })).toBeEnabled()

    await page.getByText('not confident').click()

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedData = request.postDataJSON();
    const expectedResults: Array<WriteAnnotationResult> = [
      {
        id: null,
        label,
        detector_configuration: null,
        validations: [],
        comments: [],
        confidence_indicator: 'not confident',
        start_time: null,
        end_time: null,
        start_frequency: null,
        end_frequency: null
      }
    ]
    expect(submittedData.results).toEqual(expectedResults);
  })

  test('Can add presence with comment', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({
      status: 200,
      json: {
        ...DEFAULT_DATA,
        results: []
      }
    }))
    await accessAnnotator(page)

    await expect(page.getByRole('button', { name: label })).not.toBeEnabled()
    await page.getByRole('checkbox', { name: label }).check()
    await expect(page.getByText(label).nth(2)).toBeVisible()
    await expect(page.getByRole('button', { name: label })).toBeEnabled()

    await page.getByPlaceholder('Enter your comment').fill(comment)

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedData = request.postDataJSON();
    const expectedResults: Array<WriteAnnotationResult> = [
      {
        id: null,
        label,
        detector_configuration: null,
        validations: [],
        comments: [ { comment, id: null } ],
        confidence_indicator: defaultConfidence,
        start_time: null,
        end_time: null,
        start_frequency: null,
        end_frequency: null
      }
    ]
    expect(submittedData.results).toEqual(expectedResults);
    expect(submittedData.task_comments).toEqual([]);
  })

  test('Can add box', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({
      status: 200,
      json: {
        ...DEFAULT_DATA,
        results: []
      }
    }))
    await accessAnnotator(page)

    await expect(page.getByRole('button', { name: label })).not.toBeEnabled()
    await page.getByRole('checkbox', { name: label }).check()
    await expect(page.getByText(label).nth(2)).toBeVisible()
    await expect(page.getByRole('button', { name: label })).toBeEnabled()

    const canvas = page.locator('canvas.drawable').first()
    await expect(canvas).toBeVisible()
    await page.mouse.move(start_coords.clientX, start_coords.clientY)
    await page.mouse.down({ button: 'left' })
    await page.mouse.move(end_coords.clientX, end_coords.clientY)
    await page.mouse.up({ button: 'left' })

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedData = request.postDataJSON();
    const expectedResults: Array<WriteAnnotationResult> = [
      {
        id: null,
        label,
        detector_configuration: null,
        validations: [],
        comments: [],
        confidence_indicator: defaultConfidence,
        start_time: null,
        end_time: null,
        start_frequency: null,
        end_frequency: null
      },
      {
        id: null,
        label,
        detector_configuration: null,
        validations: [],
        comments: [],
        confidence_indicator: defaultConfidence,
        start_time: Math.min(start_coords.time, end_coords.time),
        end_time: Math.max(start_coords.time, end_coords.time),
        start_frequency: Math.min(start_coords.frequency, end_coords.frequency),
        end_frequency: Math.max(start_coords.frequency, end_coords.frequency),
      }
    ]
    expect(submittedData.results).toEqual(expectedResults);
  })

  test('Can add not confident box', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({
      status: 200,
      json: {
        ...DEFAULT_DATA,
        results: []
      }
    }))
    await accessAnnotator(page)

    await expect(page.getByRole('button', { name: label })).not.toBeEnabled()
    await page.getByRole('checkbox', { name: label }).check()
    await expect(page.getByText(label).nth(2)).toBeVisible()
    await expect(page.getByRole('button', { name: label })).toBeEnabled()

    const canvas = page.locator('canvas.drawable').first()
    await expect(canvas).toBeVisible()
    await page.mouse.move(start_coords.clientX, start_coords.clientY)
    await page.mouse.down({ button: 'left' })
    await page.mouse.move(end_coords.clientX, end_coords.clientY)
    await page.mouse.up({ button: 'left' })

    await page.getByText('not confident').click()

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedData = request.postDataJSON();
    const expectedResults: Array<WriteAnnotationResult> = [
      {
        id: null,
        label,
        detector_configuration: null,
        validations: [],
        comments: [],
        confidence_indicator: defaultConfidence,
        start_time: null,
        end_time: null,
        start_frequency: null,
        end_frequency: null
      },
      {
        id: null,
        label,
        detector_configuration: null,
        validations: [],
        comments: [],
        confidence_indicator: 'not confident',
        start_time: Math.min(start_coords.time, end_coords.time),
        end_time: Math.max(start_coords.time, end_coords.time),
        start_frequency: Math.min(start_coords.frequency, end_coords.frequency),
        end_frequency: Math.max(start_coords.frequency, end_coords.frequency),
      }
    ]
    expect(submittedData.results).toEqual(expectedResults);
  })

  test('Can add box with comment', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({
      status: 200,
      json: {
        ...DEFAULT_DATA,
        results: []
      }
    }))
    await accessAnnotator(page)

    await expect(page.getByRole('button', { name: label })).not.toBeEnabled()
    await page.getByRole('checkbox', { name: label }).check()
    await expect(page.getByText(label).nth(2)).toBeVisible()
    await expect(page.getByRole('button', { name: label })).toBeEnabled()

    const canvas = page.locator('canvas.drawable').first()
    await expect(canvas).toBeVisible()
    await page.mouse.move(start_coords.clientX, start_coords.clientY)
    await page.mouse.down({ button: 'left' })
    await page.mouse.move(end_coords.clientX, end_coords.clientY)
    await page.mouse.up({ button: 'left' })

    await page.getByPlaceholder('Enter your comment').fill(comment)

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedData = request.postDataJSON();
    const expectedResults: Array<WriteAnnotationResult> = [
      {
        id: null,
        label,
        detector_configuration: null,
        validations: [],
        comments: [],
        confidence_indicator: defaultConfidence,
        start_time: null,
        end_time: null,
        start_frequency: null,
        end_frequency: null
      },
      {
        id: null,
        label,
        detector_configuration: null,
        validations: [],
        comments: [ { comment, id: null } ],
        confidence_indicator: defaultConfidence,
        start_time: Math.min(start_coords.time, end_coords.time),
        end_time: Math.max(start_coords.time, end_coords.time),
        start_frequency: Math.min(start_coords.frequency, end_coords.frequency),
        end_frequency: Math.max(start_coords.frequency, end_coords.frequency),
      }
    ]
    expect(submittedData.results).toEqual(expectedResults);
    expect(submittedData.task_comments).toEqual([]);
  })

  test('Can remove confidence without boxes', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({
      status: 200,
      json: {
        ...DEFAULT_DATA,
        results: []
      }
    }))
    await accessAnnotator(page)

    // Create
    await expect(page.getByRole('button', { name: label })).not.toBeEnabled()
    await page.getByRole('checkbox', { name: label }).check()
    await expect(page.getByText(label).nth(2)).toBeVisible()
    await expect(page.getByRole('button', { name: label })).toBeEnabled()

    // Remove
    await page.getByRole('checkbox', { name: label }).click()
    const alert = page.getByRole('dialog')
    await alert.getByRole('button', { name: `Remove "${ label }" annotations` }).click()
    await expect(page.getByRole('button', { name: label })).not.toBeEnabled()

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedData = request.postDataJSON();
    expect(submittedData.results).toEqual([]);
  })

  test('Can remove confidence with boxes', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({
      status: 200,
      json: {
        ...DEFAULT_DATA,
        results: []
      }
    }))
    await accessAnnotator(page)

    // Create
    await expect(page.getByRole('button', { name: label })).not.toBeEnabled()
    await page.getByRole('checkbox', { name: label }).check()
    await expect(page.getByText(label).nth(2)).toBeVisible()
    await expect(page.getByRole('button', { name: label })).toBeEnabled()

    const canvas = page.locator('canvas.drawable').first()
    await expect(canvas).toBeVisible()
    await page.mouse.move(start_coords.clientX, start_coords.clientY)
    await page.mouse.down({ button: 'left' })
    await page.mouse.move(end_coords.clientX, end_coords.clientY)
    await page.mouse.up({ button: 'left' })

    // Remove
    await page.getByRole('checkbox', { name: label }).click()
    const alert = page.getByRole('dialog')
    await alert.getByRole('button', { name: `Remove "${ label }" annotations` }).click()
    await expect(page.getByRole('button', { name: label })).not.toBeEnabled()

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedData = request.postDataJSON();
    expect(submittedData.results).toEqual([]);
  })

  test('Can remove box', async ({ annotatorPage: page }) => {
    await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({
      status: 200,
      json: {
        ...DEFAULT_DATA,
        results: []
      }
    }))
    await accessAnnotator(page)

    // Create
    await expect(page.getByRole('button', { name: label })).not.toBeEnabled()
    await page.getByRole('checkbox', { name: label }).check()
    await expect(page.getByText(label).nth(2)).toBeVisible()
    await expect(page.getByRole('button', { name: label })).toBeEnabled()

    const canvas = page.locator('canvas.drawable').first()
    await expect(canvas).toBeVisible()
    await page.mouse.move(start_coords.clientX, start_coords.clientY)
    await page.mouse.down({ button: 'left' })
    await page.mouse.move(end_coords.clientX, end_coords.clientY)
    await page.mouse.up({ button: 'left' })

    // Remove
    await page.locator('p').filter({ hasText: label }).getByRole('button').last().click()

    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/\d\/file\/\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedData = request.postDataJSON();
    const expectedResults: Array<WriteAnnotationResult> = [
      {
        id: null,
        label,
        detector_configuration: null,
        validations: [],
        comments: [],
        confidence_indicator: defaultConfidence,
        start_time: null,
        end_time: null,
        start_frequency: null,
        end_frequency: null
      },
    ]
    expect(submittedData.results).toEqual(expectedResults);
  })
})

test('No confidence', async ({ annotatorPage: page }) => {
  await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({
    status: 200,
    json: {
      ...DEFAULT_DATA,
      confidence_set: undefined
    }
  }))
  await accessAnnotator(page)
  await expect(page.getByText('Confidence indicator')).not.toBeVisible()
})

test('Can go back to campaign', {
  tag: '@essential'
}, async ({ annotatorPage: page }) => {
  await page.route(/annotator\/campaign\/\d\/file\/\d/g, route => route.fulfill({ status: 200, json: DEFAULT_DATA }))
  await accessAnnotator(page)
  await page.getByRole('button', { name: 'Back to campaign' }).click()
  await expect(page.getByRole('heading', { name: DEFAULT_CAMPAIGN_NAME })).toBeVisible()
})
