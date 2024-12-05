import { expect, Page, test } from '../utils/fixture';
import { ImportDataset } from '../../src/service/dataset';

const TEST_IMPORT_DATASET_NAME = 'Test import dataset'

function mockDatasetImportList(page: Page) {
  return page.route(/api\/dataset\/list_to_import\/?/, route => route.fulfill({
    status: 200, json: [ {
      name: TEST_IMPORT_DATASET_NAME,
      dataset: TEST_IMPORT_DATASET_NAME,
      file_type: '.wav',
      path: TEST_IMPORT_DATASET_NAME
    } ] as Array<ImportDataset>
  }))
}

test.describe('Access', () => {
  test('Base user cannot access datasets', async ({ baseUserPage }) => {
    const datasetLink = baseUserPage.getByRole('link', { name: 'Datasets' })
    await expect(datasetLink).not.toBeVisible();
  })

  test('Annotator cannot access datasets', async ({ annotatorPage }) => {
    const datasetLink = annotatorPage.getByRole('link', { name: 'Datasets' })
    await expect(datasetLink).not.toBeVisible();
  })

  test('Admin can access datasets', {
    tag: '@essential'
  }, async ({ adminPage }) => {
    const datasetLink = adminPage.getByRole('link', { name: 'Datasets' })
    await expect(datasetLink).toBeVisible();

    await mockDatasetImportList(adminPage)
    await Promise.all([
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset') && resp.status() === 200),
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset/list_to_import') && resp.status() === 200),
      datasetLink.click()
    ])
    const title = adminPage.getByRole('heading', { name: 'Datasets' });
    await expect(title).toBeVisible();

    const table = adminPage.getByRole('table')
    await expect(table).toBeVisible();
    const rowsCount = await table.locator('tr').count()
    expect(rowsCount).toBeGreaterThan(1);

    const importButton = adminPage.getByRole('button', { name: 'Import' })
    await expect(importButton).toBeVisible()
    await expect(importButton).not.toBeDisabled()
  })
})

test.describe('Empty states', () => {
  test('List should not appear', async ({ adminPage }) => {
    await adminPage.route('/api/dataset/', route => route.fulfill({ status: 200, json: [] }))
    await mockDatasetImportList(adminPage);
    await adminPage.getByRole('link', { name: 'Datasets' }).click();

    const table = adminPage.getByRole('table')
    await expect(table).not.toBeVisible();
    const explanation = adminPage.getByText('No datasets');
    await expect(explanation).toBeVisible();
  })

  test('Import should not be available', async ({ adminPage }) => {
    await adminPage.route(/api\/dataset\/list_to_import\/?/, route => route.fulfill({ status: 200, json: [] }))
    await adminPage.getByRole('link', { name: 'Datasets' }).click();

    const importButton = adminPage.getByRole('button', { name: 'Import' })
    await expect(importButton).toBeVisible()
    await expect(importButton).toBeDisabled()
  })
})

test.describe('Import', () => {

  test('should have an available dataset', {
    tag: '@essential'
  }, async ({ adminPage }) => {
    await mockDatasetImportList(adminPage);
    await Promise.all([
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset') && resp.status() === 200),
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset/list_to_import') && resp.status() === 200),
      adminPage.getByRole('link', { name: 'Datasets' }).click()
    ])

    await adminPage.getByRole('button', { name: 'Import' }).click()

    const modal = adminPage.locator('.modal-dialog').first()
    await expect(modal).toBeVisible();

    const itemCounts = await modal.locator('li').count()
    expect(itemCounts).toBeGreaterThan(1) // Includes "all checkbox"
  })

  test('incorrect search should have 0 result', async ({ adminPage }) => {
    await mockDatasetImportList(adminPage);
    await Promise.all([
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset') && resp.status() === 200),
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset/list_to_import') && resp.status() === 200),
      adminPage.getByRole('link', { name: 'Datasets' }).click()
    ])
    await adminPage.getByRole('button', { name: 'Import' }).click()

    const modal = adminPage.locator('.modal-dialog').first()
    await modal.getByPlaceholder('Search').fill('incorrect')
    const itemCounts = await modal.locator('li').count()
    expect(itemCounts).toEqual(1) // Includes "all checkbox"
  })

  test('valid search should have 1 result', async ({ adminPage }) => {
    await mockDatasetImportList(adminPage);
    await Promise.all([
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset') && resp.status() === 200),
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset/list_to_import') && resp.status() === 200),
      adminPage.getByRole('link', { name: 'Datasets' }).click()
    ])
    await adminPage.getByRole('button', { name: 'Import' }).click()

    const modal = adminPage.locator('.modal-dialog').first()
    await modal.getByPlaceholder('Search').fill(TEST_IMPORT_DATASET_NAME)
    const itemCounts = await modal.locator('li').count()
    expect(itemCounts).toEqual(2) // Includes "all checkbox"
  })

  test('cancel should not import', async ({ adminPage }) => {
    await mockDatasetImportList(adminPage)
    await Promise.all([
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset') && resp.status() === 200),
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset/list_to_import') && resp.status() === 200),
      adminPage.getByRole('link', { name: 'Datasets' }).click()
    ])
    const table = adminPage.getByRole('table')
    await expect(table).toBeVisible();
    const initialRowsCount = await table.locator('tr').count()
    expect(initialRowsCount).toBeGreaterThan(1);
    await adminPage.getByRole('button', { name: 'Import' }).click()

    const modal = adminPage.locator('.modal-dialog').first()
    await modal.getByLabel(TEST_IMPORT_DATASET_NAME).check()
    await modal.getByText('Close').click()

    const currentRowsCount = await adminPage.getByRole('table').locator('tr').count()
    expect(currentRowsCount).toEqual(initialRowsCount)
  })

  test('should import', {
    tag: '@essential'
  }, async ({ adminPage }) => {
    await mockDatasetImportList(adminPage);
    await Promise.all([
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset') && resp.status() === 200),
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset/list_to_import') && resp.status() === 200),
      adminPage.getByRole('link', { name: 'Datasets' }).click()
    ])
    await adminPage.getByRole('button', { name: 'Import' }).click()

    const modal = adminPage.locator('.modal-dialog').first()
    await modal.getByLabel(TEST_IMPORT_DATASET_NAME).check()

    await adminPage.route(/\/api\/dataset\/datawork_import\/?/g, async route => {
      return route.fulfill({ status: 200 })
    });
    await Promise.all([
      adminPage.waitForRequest(resp => resp.url().includes('/api/dataset/datawork_import') && resp.method() === 'POST'),
      modal.getByText('Save changes').click()
    ])
  })
})