import { API_URL, ESSENTIAL, expect, expectNoRequestsOnAction, test } from './utils';
import { CAMPAIGN, CONFIDENCE, DATASET, LABEL } from './fixtures';
import { WriteCreateAnnotationCampaign } from '../src/service/campaign';
import { Mock } from './utils/services';

test.describe('Annotator', () => {

  test('[Create] Can submit only required fields', ESSENTIAL, async ({ page }) => {
    await page.campaign.create.go('annotator');
    await page.campaign.create.fillGlobal()
    await page.campaign.create.fillData()
    await page.campaign.create.fillAnnotationCreate()

    const [ request ] = await Promise.all([
      page.waitForRequest(API_URL.campaign.create),
      page.campaign.create.createButton.click()
    ]);


    await test.step('Check campaign', async () => {
      const data = request.postDataJSON() as WriteCreateAnnotationCampaign;
      const expectedData: WriteCreateAnnotationCampaign = {
        name: CAMPAIGN.name,
        datasets: [ DATASET.name ],
        spectro_configs: DATASET.spectros.map(s => s.id),
        instructions_url: null,
        desc: null,
        deadline: null,
        confidence_indicator_set: null,
        label_set: LABEL.set.id,
        usage: 'Create',
        labels_with_acoustic_features: [],
        allow_point_annotation: false,
        allow_image_tuning: false,
        allow_colormap_tuning: false,
        colormap_default: null,
        colormap_inverted_default: null,
      }
      expect(data).toEqual(expectedData);
    })
  })

  test('[Create] Can submit complete form', ESSENTIAL, async ({ page }) => {
    await page.campaign.create.go('annotator');
    await page.campaign.create.fillGlobal({ complete: true });
    await page.campaign.create.fillData();
    await page.campaign.create.fillAnnotationCreate({ complete: true });
    const [ campaignRequest, ] = await Promise.all([
      page.waitForRequest(API_URL.campaign.create),
      page.campaign.create.createButton.click()
    ]);

    await test.step('Check campaign', async () => {
      const campaignData = campaignRequest.postDataJSON() as WriteCreateAnnotationCampaign;
      const expectedCampaign: WriteCreateAnnotationCampaign = {
        name: CAMPAIGN.name,
        instructions_url: CAMPAIGN.instructions_url,
        desc: CAMPAIGN.desc,
        deadline: CAMPAIGN.deadline,
        datasets: [ DATASET.name ],
        spectro_configs: DATASET.spectros.map(s => s.id),
        confidence_indicator_set: CONFIDENCE.set.id,
        label_set: LABEL.set.id,
        usage: 'Create',
        labels_with_acoustic_features: [ LABEL.withFeatures ],
        allow_point_annotation: true,
        allow_image_tuning: false,
        allow_colormap_tuning: false,
        colormap_default: null,
        colormap_inverted_default: null,
      }
      expect(campaignData).toEqual(expectedCampaign);
    })
  })

  test('Handle errors', ESSENTIAL, async ({ page }) => {
    await page.campaign.create.go('annotator', { withErrors: true });
    await page.campaign.create.fillGlobal()
    await page.campaign.create.fillData()
    await page.campaign.create.fillAnnotationCreate()

    await Promise.all([
      page.waitForRequest(API_URL.campaign.create),
      await page.campaign.create.createButton.click()
    ]);

    await test.step('Check errors are shown', async () => {
      await expect(page.getByText(Mock.getError('name'), { exact: true })).toBeVisible()
      await expect(page.getByText(Mock.getError('desc'), { exact: true })).toBeVisible()
      await expect(page.getByText(Mock.getError('instructions_url'), { exact: true })).toBeVisible()
      await expect(page.getByText(Mock.getError('deadline'), { exact: true })).toBeVisible()
      await expect(page.getByText(Mock.getError('datasets'), { exact: true })).toBeVisible()
      await expect(page.getByText(Mock.getError('spectro_configs'), { exact: true })).toBeVisible()
      await expect(page.getByText(Mock.getError('usage'), { exact: true })).toBeVisible()
      await expect(page.getByText(Mock.getError('label_set'), { exact: true })).toBeVisible()
      await expect(page.getByText(Mock.getError('confidence_indicator_set'), { exact: true })).toBeVisible()
    });
  });

  test('Empty', async ({ page }) => {
    await page.campaign.create.go('annotator', { empty: true });

    await test.step('Cannot select a dataset if none is imported', async () => {
      await expect(page.getByRole('button', { name: 'Select a dataset' })).toBeDisabled();
      await expect(page.getByText('You should first import a dataset')).toBeVisible();
    })

    await page.campaign.create.selectMode('Create annotations');

    await test.step('Cannot select a label set if none exists', async () => {
      await expect(page.getByRole('button', { name: 'Select a label set' })).toBeDisabled();
      await expect(page.getByText('You need to create a label set to use it in your campaign')).toBeVisible();
    })

    await test.step('Cannot select a confidence set if none exists', async () => {
      await expect(page.getByRole('button', { name: 'Select a confidence set' })).toBeDisabled();
      await expect(page.getByText('You need to create a confidence set to use it in your campaign')).toBeVisible();
    })

    await test.step('Cannot submit empty form', async () => {
      await expectNoRequestsOnAction(
        page,
        () => page.campaign.create.createButton.click(),
        API_URL.campaign.create
      )
    })
  })
})
