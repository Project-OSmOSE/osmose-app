import { expect, test } from '../../utils/fixture';
import { accessCampaignFileList, canAccessUserGuide } from "../../utils/campaign/functions";


test.describe('Annotator', () => {

  test('can access user guide', {
    tag: '@essential'
  }, async ({ annotatorPage }) => {
    await accessCampaignFileList(annotatorPage);
    await canAccessUserGuide(annotatorPage);
  })

  test('can access campaign instructions', async ({ annotatorPage }) => {
    await accessCampaignFileList(annotatorPage);
    const button = annotatorPage.getByRole('button', { name: 'Campaign instructions' });
    await expect(button).toBeVisible();
  })

  test('can annotate submitted file', {
    tag: '@essential'
  }, async ({ annotatorPage }) => {
    await accessCampaignFileList(annotatorPage);
    const table = annotatorPage.getByRole('table')
    await expect(table).toBeVisible();
    const submittedRow = table.locator('tr.table-success').first()
    await submittedRow.waitFor()
    await submittedRow.getByRole('link', { name: 'Task link' }).click()
    await annotatorPage.waitForURL(/.*\/annotation-campaign\/\d+\/file\/\d+/g);
  })

  test('can annotate unsubmitted file', {
    tag: '@essential'
  }, async ({ annotatorPage }) => {
    await accessCampaignFileList(annotatorPage);
    const table = annotatorPage.getByRole('table')
    await expect(table).toBeVisible();
    const submittedRow = table.locator('tbody tr:not(.table-success)').first()
    await submittedRow.waitFor()
    await submittedRow.getByRole('link', { name: 'Task link' }).click()
    await annotatorPage.waitForURL(/.*\/annotation-campaign\/\d+\/file\/\d+/g);
  })

  test('can resume annotation', {
    tag: '@essential'
  }, async ({ annotatorPage }) => {
    await accessCampaignFileList(annotatorPage);
    const table = annotatorPage.getByRole('table')
    await expect(table).toBeVisible();
    await table.locator('tbody tr:not(.table-success)').first().waitFor()
    await annotatorPage.getByRole('button', { name: 'Resume annotation' }).click();
    await annotatorPage.waitForURL(/.*\/annotation-campaign\/\d+\/file\/\d+/g);
  })
})