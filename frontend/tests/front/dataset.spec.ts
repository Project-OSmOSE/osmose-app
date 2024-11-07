import { test, expect } from '../utils/fixture';


test.describe('Access', () => {
  test('Base user cannot access datasets', async ({ baseUserPage }) => {
    const datasetLink = baseUserPage.getByRole('link', { name: 'Datasets' })
    await expect(datasetLink).not.toBeVisible();
  })

  test('Annotator cannot access datasets', async ({ annotatorPage }) => {
    const datasetLink = annotatorPage.getByRole('link', { name: 'Datasets' })
    await expect(datasetLink).not.toBeVisible();
  })

  test('Admin can access datasets', async ({ adminPage }) => {
    const datasetLink = adminPage.getByRole('link', { name: 'Datasets' })
    await expect(datasetLink).toBeVisible();

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
    await adminPage.route(/\/api\/dataset\/?/g, async route => {
      await route.fulfill({ json: [] });
    });
    await adminPage.getByRole('link', { name: 'Datasets' }).click();

    const table = adminPage.getByRole('table')
    await expect(table).not.toBeVisible();
    const explanation = adminPage.getByText('No datasets');
    await expect(explanation).toBeVisible();
  })

  test('Import should not be available', async ({ adminPage }) => {
    await adminPage.route(/\/api\/dataset\/list_to_import\/?/g, async route => {
      await route.fulfill({ json: [] });
    });
    await adminPage.getByRole('link', { name: 'Datasets' }).click();

    const importButton = adminPage.getByRole('button', { name: 'Import' })
    await expect(importButton).toBeVisible()
    await expect(importButton).toBeDisabled()
  })
})

test.describe('Import', () => {

  test('should have an available dataset', async ({ adminPage }) => {
    await Promise.all([
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset/') && resp.status() === 200),
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset/list_to_import/') && resp.status() === 200),
      adminPage.getByRole('link', { name: 'Datasets' }).click()
    ])

    await adminPage.getByRole('button', { name: 'Import' }).click()

    const modal = adminPage.locator('.modal-dialog').first()
    await expect(modal).toBeVisible();

    const itemCounts = await modal.locator('li').count()
    expect(itemCounts).toBeGreaterThan(1) // Includes "all checkbox"
  })

  test('incorrect search should have 0 result', async ({ adminPage }) => {
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
    await Promise.all([
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset') && resp.status() === 200),
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset/list_to_import') && resp.status() === 200),
      adminPage.getByRole('link', { name: 'Datasets' }).click()
    ])
    await adminPage.getByRole('button', { name: 'Import' }).click()

    const modal = adminPage.locator('.modal-dialog').first()
    await modal.getByPlaceholder('Search').fill('glider')
    const itemCounts = await modal.locator('li').count()
    expect(itemCounts).toEqual(2) // Includes "all checkbox"
  })

  test('cancel should not import', async ({ adminPage }) => {
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
    await modal.getByLabel('glider').check()
    await modal.getByText('Close').click()

    const currentRowsCount = await adminPage.getByRole('table').locator('tr').count()
    expect(currentRowsCount).toEqual(initialRowsCount)
  })

  test('should import', async ({ adminPage }) => {
    await Promise.all([
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset') && resp.status() === 200),
      adminPage.waitForResponse(resp => resp.url().includes('/api/dataset/list_to_import') && resp.status() === 200),
      adminPage.getByRole('link', { name: 'Datasets' }).click()
    ])
    await adminPage.getByRole('button', { name: 'Import' }).click()

    const modal = adminPage.locator('.modal-dialog').first()
    await modal.getByLabel('glider').check()

    await adminPage.route(/\/api\/dataset\/datawork_import\/?/g, async route => {
      return route.fulfill({ status: 200 })
    });
    await Promise.all([
      adminPage.waitForRequest(resp => resp.url().includes('/api/dataset/datawork_import') && resp.method() === 'POST'),
      modal.getByText('Save changes').click()
    ])
  })
})