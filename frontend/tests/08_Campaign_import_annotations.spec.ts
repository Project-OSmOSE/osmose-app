import { API_URL, ESSENTIAL, expect, test } from "./utils";
import { WriteCheckAnnotationCampaign } from "../src/service/campaign";
import { CAMPAIGN, DATASET, DETECTOR_CONFIGURATION, LABEL } from "./fixtures";


test('[Check] Can create a campaign', ESSENTIAL, async ({ page }) => {
  await page.campaign.create.go('annotator');
  await page.campaign.create.fillGlobal({ complete: true });
  await page.campaign.create.fillData();
  await page.campaign.create.fillAnnotationCheck();
  await page.campaign.create.fillAcousticFeatures();

  const [
    submitResultsRequest,
    submittedCampaign
  ] = await Promise.all([
    page.waitForRequest(API_URL.result.import),
    page.waitForRequest(API_URL.campaign.create),
    page.campaign.create.createButton.click()
  ])
  const expectedCampaign: WriteCheckAnnotationCampaign = {
    name: CAMPAIGN.name,
    instructions_url: CAMPAIGN.instructions_url,
    desc: CAMPAIGN.desc,
    deadline: CAMPAIGN.deadline,
    datasets: [ DATASET.name ],
    spectro_configs: DATASET.spectros.map(s => s.id),
    labels_with_acoustic_features: [ LABEL.withFeatures ],
    usage: 'Check',
    allow_point_annotation: false,
  }
  expect(await submittedCampaign.postDataJSON()).toEqual(expectedCampaign);
  expect(submitResultsRequest.url()).toContain(`dataset_name=${ encodeURI(DATASET.name) }`)
  expect(submitResultsRequest.url()).toContain(`detectors_map=${ encodeURI(JSON.stringify({
    detector1: { detector: 'detector1', configuration: DETECTOR_CONFIGURATION },
    detector3: { detector: 'detector3', configuration: DETECTOR_CONFIGURATION },
    detector2: { detector: 'detector2', configuration: DETECTOR_CONFIGURATION },
  })) }`)
});

test('[Check] Can import only first Dataset x Detector', ESSENTIAL, async ({ page }) => {
  await page.campaign.create.go('annotator')
  await page.campaign.create.fillData()
  await page.campaign.create.fillAnnotationCheck({ onlyFirstDataset: true, onlyFirstDetector: true })

  //TODO: Filter labels shown with the dataset and detectors filtering
  // await expect(page.getByText(Mock.CLASSIC_LABEL, { exact: true })).toBeVisible();
  // await expect(page.getByText(Mock.FEATURE_LABEL, { exact: true })).not.toBeVisible();
  await expect(page.getByText('detector1', { exact: true })).toBeVisible();
  await expect(page.getByText('detector2', { exact: true })).not.toBeVisible();
  await expect(page.getByText('detector3', { exact: true })).not.toBeVisible();
});

test('[Check] Can handle existing detector', ESSENTIAL, async ({ page }) => {
  await page.campaign.create.go('annotator', { loadDetectors: true })
  await page.campaign.create.fillData()
  await page.campaign.create.selectMode('Check annotations')
  const modal = await page.campaign.create.openImportModal()
  await page.campaign.create.importFile(modal);
  await page.campaign.create.selectDataset(modal, { onlyFirstDataset: true, onlyFirstDetector: true })

  await test.step('Select Detectors', async () => {
    await expect(modal.getByText('detector1Already in database').first()).toBeVisible()
    await modal.getByRole('button', { name: `Confirm` }).click({ force: true });
  })

  await test.step('Select Detectors configurations', async () => {
    await modal.getByText('Select configuration').first().click()
    await expect(modal.getByText(DETECTOR_CONFIGURATION).and(modal.locator('div'))).toBeVisible()
  })
});

test('[Check] Can delete import', async ({ page }) => {
  await page.campaign.create.go('annotator')
  await page.campaign.create.fillData()
  await page.campaign.create.fillAnnotationCheck()

  await test.step('Remove detectors', async () => {
    await page.locator('#detector-import-results').getByRole('button').click()
  })

  await expect(page.getByRole('button', { name: 'Import annotations' })).toBeVisible();
});