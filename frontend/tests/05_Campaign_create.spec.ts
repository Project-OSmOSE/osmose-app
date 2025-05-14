import { API_URL, ESSENTIAL, expect, expectNoRequestsOnAction, test } from './utils';
import { CAMPAIGN, DATASET } from './fixtures';
import { Mock } from './utils/services';
import { PostAnnotationCampaign } from "../src/service/api/campaign";

test.describe('Annotator', () => {

  test('Can submit only required fields', ESSENTIAL, async ({ page }) => {
    await page.campaign.create.go('annotator');
    await page.campaign.create.fillGlobal()
    await page.campaign.create.fillData()

    const [ request ] = await Promise.all([
      page.waitForRequest(API_URL.campaign.create),
      page.campaign.create.createButton.click()
    ]);

    await test.step('Check campaign', async () => {
      const data = request.postDataJSON() as PostAnnotationCampaign;
      const expectedData: PostAnnotationCampaign = {
        name: CAMPAIGN.name,
        datasets: [ DATASET.name ],
        spectro_configs: DATASET.spectros.map(s => s.id),
        instructions_url: null,
        desc: null,
        deadline: null,
        allow_image_tuning: false,
        allow_colormap_tuning: false,
        colormap_default: null,
        colormap_inverted_default: null,
      }
      expect(data).toEqual(expectedData);
    })

    await expect(page.getByRole('heading', { name: CAMPAIGN.name })).toBeVisible()
  })

  // test('[Check] Can submit only required fields', ESSENTIAL, async ({ page }) => {
  //   await page.campaign.create.go('annotator');
  //   await page.campaign.create.fillGlobal()
  //   await page.campaign.create.fillData()
  //   await page.campaign.create.selectMode('Check annotations')
  //
  //   await Promise.all([
  //     page.waitForRequest(API_URL.campaign.create),
  //     page.campaign.create.createButton.click()
  //   ]);
  //
  //   await expect(page.getByRole('heading', { name: "Import annotations" })).toBeVisible()
  // })

  test('Can submit complete form', ESSENTIAL, async ({ page }) => {
    await page.campaign.create.go('annotator');
    await page.campaign.create.fillGlobal({ complete: true });
    await page.campaign.create.fillData();
    const [ campaignRequest, ] = await Promise.all([
      page.waitForRequest(API_URL.campaign.create),
      page.campaign.create.createButton.click()
    ]);

    await test.step('Check campaign', async () => {
      const campaignData = campaignRequest.postDataJSON() as PostAnnotationCampaign;
      const expectedCampaign: PostAnnotationCampaign = {
        name: CAMPAIGN.name,
        instructions_url: CAMPAIGN.instructions_url,
        desc: CAMPAIGN.desc,
        deadline: CAMPAIGN.deadline,
        datasets: [ DATASET.name ],
        spectro_configs: DATASET.spectros.map(s => s.id),
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
    });
  });

  test('Empty', async ({ page }) => {
    await page.campaign.create.go('annotator', { empty: true });

    await test.step('Cannot select a dataset if none is imported', async () => {
      await expect(page.getByRole('button', { name: 'Select a dataset' })).toBeDisabled();
      await expect(page.getByText('You should first import a dataset')).toBeVisible();
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
