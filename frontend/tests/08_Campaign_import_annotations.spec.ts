import { API_URL, ESSENTIAL, expect, test } from "./utils";
import { DATASET, DETECTOR_CONFIGURATION } from "./fixtures";


test.describe('Campaign creator', () => {
  test('[Check] Can import all', ESSENTIAL, async ({ page }) => {
    await page.campaign.create.go('annotator');
    await page.campaign.create.fillGlobal()
    await page.campaign.create.fillData()
    await page.campaign.create.selectMode('Check annotations')
    await page.mock.detectors(true)
    await page.mock.resultImport()
    await page.mock.campaignDetail(false, "Check")
    await page.campaign.create.createButton.click()
    await expect(page.getByRole('heading', { name: "Import annotations" })).toBeVisible()

    await page.campaign.import.fillAnnotationCheck();

    const [
      submitResultsRequest,
    ] = await Promise.all([
      page.waitForRequest(API_URL.result.import),
      page.campaign.import.importButton.click()
    ])
    expect(submitResultsRequest.url()).toContain(`dataset_name=${ encodeURI(DATASET.name) }`)
    expect(submitResultsRequest.url()).toContain(`detectors_map=${ encodeURI(JSON.stringify({
      detector1: { detector: 'detector1', configuration: DETECTOR_CONFIGURATION },
      detector2: { detector: 'detector2', configuration: DETECTOR_CONFIGURATION },
      detector3: { detector: 'detector3', configuration: DETECTOR_CONFIGURATION },
    })) }`)
    expect(submitResultsRequest.url()).toContain(`detectors_map=${ encodeURI(JSON.stringify({
      detector1: { detector: 'detector1', configuration: DETECTOR_CONFIGURATION },
      detector2: { detector: 'detector2', configuration: DETECTOR_CONFIGURATION },
      detector3: { detector: 'detector3', configuration: DETECTOR_CONFIGURATION },
    })) }`)

    const expectedLines = submitResultsRequest.postDataJSON().data.replaceAll('"', '').split('\n');
    const fileLines = page.campaign.import.fileData.split('\r\n')
    expect(expectedLines.length).toEqual(fileLines.length)
    for (const index in expectedLines) {
      expect(expectedLines[index]).toEqual(fileLines[index])
    }

    await expect(page.getByRole('heading', { name: "Manage annotators" })).toBeVisible()
  });

  test('[Check] Can import only first Detector', ESSENTIAL, async ({ page }) => {
    await page.campaign.import.go('creator');
    await page.campaign.import.fillAnnotationCheck({ onlyFirstDetector: true });

    await expect(page.getByText('detector1', { exact: true })).toBeVisible();
    await expect(page.getByText('detector2', { exact: true })).not.toBeVisible();
    await expect(page.getByText('detector3', { exact: true })).not.toBeVisible();
  });

  test('[Check] Can handle existing detector', ESSENTIAL, async ({ page }) => {
    await page.campaign.import.go('creator', { loadDetectors: true });
    await page.campaign.import.importFile();

    await test.step('Select Detectors', async () => {
      await expect(page.getByText('detector1Already in database').first()).toBeVisible()
    })

    await test.step('Select Detectors configurations', async () => {
      await page.getByText('Select configuration').first().click()
      await expect(page.getByText(DETECTOR_CONFIGURATION).and(page.locator('div'))).toBeVisible()
    })
  });

  test('[Check] Can reset import', async ({ page }) => {
    await page.campaign.import.go('creator')
    await page.campaign.import.fillAnnotationCheck()

    await test.step('Reset file', async () => {
      await page.campaign.import.resetFileButton.click()
    })

    await expect(page.getByText('Import annotations (csv)')).toBeVisible();
  });
});