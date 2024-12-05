import { expect, Page } from '../../../utils/fixture';
import { CREATE_CAMPAIGN_URL } from '../../../utils/url';
import { WriteAnnotationCampaign } from '../../../../src/service/campaign';

export const name = 'Test campaign';
export const desc = 'Test description';
export const url = 'url@test.co';
export const deadline = '2032-12-12';
export const dataset = 'Test Dataset'; // Spectro config: [1, 2, 3, 4]
export const labelSet = 'Test SPM campaign'; // ID: 1
export const confidenceSet = 'Confident/NotConfident'; // ID: 1
export const configuration = 'Test configuration';

export async function selectCreateAnnotations(page: Page) {
  await page.getByRole('button', { name: 'Select an annotation mode' }).click();
  await page.locator('#options').getByText('Create annotations').click();
}

export async function selectInAlert(page: Page, item: string) {
  const alert = page.locator('ion-alert:visible').first()
  await expect(alert).toBeVisible();
  await alert.getByText(item).click();
  await alert.getByRole('button', { name: 'Ok' }).click();
}

export async function submit(page: Page, mockResponse?: {
  status: number,
  json: any
}): Promise<Array<WriteAnnotationCampaign>> {
  await page.route(CREATE_CAMPAIGN_URL, (route, request) => {
    if (request.method() === 'POST') {
      route.fulfill(mockResponse ?? { status: 200, json: { id: -1, files_count: 99, datasets: ['Test Dataset'] } })
    }
  })
  const [ request ] = await Promise.all([
    page.waitForRequest(CREATE_CAMPAIGN_URL),
    page.getByRole('button', { name: 'Create campaign' }).click()
  ])
  return request.postDataJSON()
}

