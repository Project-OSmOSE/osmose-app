import { expect, Page, test } from '../../utils/fixture';
import { accessCampaignEdit } from "../../utils/campaign/functions";
import { ADMIN, ANNOTATOR, BASE_USER } from "../../utils/auth/data";
import { FILE_RANGE_URL } from '../../utils/url';
import { WriteAnnotationFileRange } from '../../../src/service/campaign/annotation-file-range';

async function submit(page: Page): Promise<Array<WriteAnnotationFileRange>> {
  await page.route(/api\/annotation-file-range\/?\??.*$/g, route => route.fulfill({ status: 200 }))
  const [ request ] = await Promise.all([
    page.waitForRequest(FILE_RANGE_URL),
    page.getByRole('button', { name: 'Update campaign' }).click()
  ])
  return request.postDataJSON()
}

test.describe('Loading', () => {
  test('Empty state', async ({ adminPage }) => {
    await accessCampaignEdit(adminPage, [])
    await expect(adminPage.getByPlaceholder('Search annotator').locator('input')).toBeVisible()
    await expect(adminPage.locator('.table-aplose')).not.toBeVisible()
  })

  test('Filled state', {
    tag: '@essential'
  }, async ({ adminPage }) => {
    await accessCampaignEdit(adminPage, [
      {
        "id": 1,
        "annotator": ANNOTATOR.id,
        "annotation_campaign": 1,
        "finished_tasks_count": 5,
        "files_count": 10,
        "first_file_index": 0,
        "last_file_index": 9
      },
      {
        "id": 1,
        "annotator": ADMIN.id,
        "annotation_campaign": 1,
        "finished_tasks_count": 0,
        "files_count": 10,
        "first_file_index": 0,
        "last_file_index": 9
      },
    ])
    await expect(adminPage.getByText(ANNOTATOR.displayName)).toBeVisible()
    await expect(adminPage.getByText('1-10')).toBeVisible()

    await expect(adminPage.getByText(ADMIN.displayName)).toBeVisible()
    await expect(adminPage.getByPlaceholder('1')).toHaveValue('1')

    await expect(adminPage.getByText(BASE_USER.displayName)).not.toBeVisible()
  })
})

test.describe('Adding an annotator', {
  tag: '@essential'
}, () => {
  test('not in campaign', async ({ adminPage }) => {
    await accessCampaignEdit(adminPage, []);
    await adminPage.getByPlaceholder('Search annotator').locator('input').fill(ANNOTATOR.displayName);
    await adminPage.locator('#searchbar-results').getByText(ANNOTATOR.displayName).click();
    const submittedData = await submit(adminPage)
    const expectedData: Array<WriteAnnotationFileRange> = [ {
      "annotator": ANNOTATOR.id,
      "first_file_index": 0,
      "last_file_index": 98
    } ]
    expect(submittedData).toEqual(expectedData)
  })

  test('in campaign with all files is not possible', async ({ adminPage }) => {
    await accessCampaignEdit(adminPage, [
      {
        "id": 1,
        "annotator": ANNOTATOR.id,
        "annotation_campaign": 1,
        "finished_tasks_count": 5,
        "files_count": 100,
        "first_file_index": 0,
        "last_file_index": 98
      },
    ]);
    await adminPage.getByPlaceholder('Search annotator').locator('input').fill(ANNOTATOR.displayName);
    await expect(adminPage.locator('#searchbar-results').getByText(ANNOTATOR.displayName)).not.toBeVisible();
  })

  test('in campaign with some files', async ({ adminPage }) => {
    await accessCampaignEdit(adminPage, [
      {
        "id": 1,
        "annotator": ANNOTATOR.id,
        "annotation_campaign": 1,
        "finished_tasks_count": 5,
        "files_count": 10,
        "first_file_index": 0,
        "last_file_index": 9
      },
    ]);
    await adminPage.getByPlaceholder('Search annotator').locator('input').fill(ANNOTATOR.displayName);
    await adminPage.locator('#searchbar-results').getByText(ANNOTATOR.displayName).click();
    const submittedData = await submit(adminPage)
    const expectedData: Array<WriteAnnotationFileRange> = [ {
      "id": 1,
      "annotator": ANNOTATOR.id,
      "first_file_index": 0,
      "last_file_index": 9
    }, {
      "annotator": ANNOTATOR.id,
      "first_file_index": 0,
      "last_file_index": 98
    } ]
    expect(submittedData).toEqual(expectedData)
  })
})

test.describe('Edit an annotator', {
  tag: '@essential'
}, () => {
  test('without finished task is possible', async ({ adminPage }) => {
    await accessCampaignEdit(adminPage, [
      {
        "id": 1,
        "annotator": ANNOTATOR.id,
        "annotation_campaign": 1,
        "finished_tasks_count": 0,
        "files_count": 10,
        "first_file_index": 0,
        "last_file_index": 9
      },
    ]);
    await adminPage.getByPlaceholder("1").fill("5")
    await adminPage.getByPlaceholder("99").fill("15")
    const submittedData = await submit(adminPage)
    const expectedData: Array<WriteAnnotationFileRange> = [ {
      "id": 1,
      "annotator": ANNOTATOR.id,
      "first_file_index": 4,
      "last_file_index": 14
    } ]
    expect(submittedData).toEqual(expectedData)
  })

  test('with finished task is not possible', async ({ adminPage }) => {
    await accessCampaignEdit(adminPage, [
      {
        "id": 1,
        "annotator": ANNOTATOR.id,
        "annotation_campaign": 1,
        "finished_tasks_count": 5,
        "files_count": 10,
        "first_file_index": 0,
        "last_file_index": 9
      },
    ]);
    await expect(adminPage.getByPlaceholder("1")).not.toBeVisible()
    await expect(adminPage.getByPlaceholder("99")).not.toBeVisible()
  })
})

test.describe('Remove an annotator', {
  tag: '@essential'
}, () => {
  test('without finished task is possible', async ({ adminPage }) => {
    await accessCampaignEdit(adminPage, [
      {
        "id": 1,
        "annotator": ANNOTATOR.id,
        "annotation_campaign": 1,
        "finished_tasks_count": 0,
        "files_count": 10,
        "first_file_index": 0,
        "last_file_index": 9
      },
    ]);
    const button = adminPage.locator('.table-content button').last()
    await expect(button).toBeVisible()
    await button.click()
    const submittedData = await submit(adminPage)
    const expectedData: Array<WriteAnnotationFileRange> = []
    expect(submittedData).toEqual(expectedData)
  })

  test('with finished task is not possible', async ({ adminPage }) => {
    await accessCampaignEdit(adminPage, [
      {
        "id": 1,
        "annotator": ANNOTATOR.id,
        "annotation_campaign": 1,
        "finished_tasks_count": 5,
        "files_count": 10,
        "first_file_index": 0,
        "last_file_index": 9
      },
    ]);
    const button = adminPage.locator('.table-content button').last()
    await expect(button).toBeVisible()
    await expect(button).toBeDisabled()
  })
})