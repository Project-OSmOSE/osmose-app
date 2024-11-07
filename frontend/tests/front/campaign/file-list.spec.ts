import { expect, test } from '../../utils/fixture';
import { accessCampaignFileList, canAccessCampaignDetail, canAccessUserGuide } from "../../utils/campaign/functions";


test.describe('Empty state', () => {
  test('show empty list', async ({ annotatorPage }) => {
    await annotatorPage.route(/\/api\/annotation-file-range\/?/g, route => {
      return route.fulfill({ status: 200, json: [] })
    })
    await accessCampaignFileList(annotatorPage);
    await expect(annotatorPage.getByText('No files to annotate')).toBeVisible();
  })
})

test.describe('Annotator', () => {
  test('can access detail', async ({ annotatorPage }) => {
    await accessCampaignFileList(annotatorPage);
    await canAccessCampaignDetail(annotatorPage, annotatorPage);
  })

  test('can access user guide', async ({ annotatorPage }) => {
    await accessCampaignFileList(annotatorPage);
    await canAccessUserGuide(annotatorPage);
  })

  test('can access campaign instructions', async ({ annotatorPage }) => {
    await accessCampaignFileList(annotatorPage);
    const button = annotatorPage.getByRole('button', { name: 'Campaign instructions' });
    await expect(button).toBeVisible();
  })

  test('show file list', async ({ annotatorPage }) => {
    await accessCampaignFileList(annotatorPage);
    const table = annotatorPage.getByRole('table')
    await expect(table).toBeVisible();
    const rowsCount = await table.locator('tr').count()
    expect(rowsCount).toBeGreaterThan(1);
  })

  test('can annotate submitted file', async ({ annotatorPage }) => {
    await accessCampaignFileList(annotatorPage);
    const table = annotatorPage.getByRole('table')
    await expect(table).toBeVisible();
    const submittedRow = table.locator('tr.table-success').first()
    await submittedRow.waitFor()
    await submittedRow.getByRole('link', { name: 'Task link' }).click()
    await annotatorPage.waitForURL(/.*\/annotation-campaign\/\d+\/file\/\d+/g);
  })

  test('can annotate unsubmitted file', async ({ annotatorPage }) => {
    await accessCampaignFileList(annotatorPage);
    const table = annotatorPage.getByRole('table')
    await expect(table).toBeVisible();
    const submittedRow = table.locator('tbody tr:not(.table-success)').first()
    await submittedRow.waitFor()
    await submittedRow.getByRole('link', { name: 'Task link' }).click()
    await annotatorPage.waitForURL(/.*\/annotation-campaign\/\d+\/file\/\d+/g);
  })
})