import { expect, ExtendedPage, test } from './utils/fixture';
import { Mock } from "./utils/mock";
import { ESSENTIAL } from "./utils/detail";
import { expectNoRequestsOnAction } from "./utils/functions";

test.describe.configure({ mode: "serial" })

test.beforeEach(async ({ staff, superuser }) => {
  await staff.nav.goDatasets()
  await superuser.nav.goDatasets()
})

async function openImport(page: ExtendedPage) {
  await page.getByRole('button', { name: 'Import dataset' }).click()

  const modal = page.getByRole('dialog').first()
  await expect(modal).toBeVisible();
  return modal;
}

async function empty(page: ExtendedPage) {
  await page.nav.goDatasets({ datasets: [], importDatasets: [] });
  await expect(page.locator('.table-content')).not.toBeVisible();
  await expect(page.getByText('No datasets')).toBeVisible();
  const importButton = page.getByRole('button', { name: 'Import dataset' })
  await expect(importButton).toBeVisible()
  await expect(importButton).toBeDisabled()
}

async function seeDatasets(page: ExtendedPage) {
  const content = page.locator('.table-content')
  await expect(content.first()).toBeVisible();
  const textContent = await Promise.all((await content.all()).map(c => c.textContent()))
  expect(textContent).toContain(Mock.DATASET.name)
}

async function seeImportDataset(page: ExtendedPage) {
  const modal = await openImport(page);
  const content = modal.locator('.table-content')
  await expect(content.first()).toBeVisible();
  const textContent = (await Promise.all((await content.all()).map(c => c.textContent()))).join(' ')
  expect(textContent).toContain(Mock.IMPORT_DATASET.name)
}

async function searchImport(page: ExtendedPage, isValid: boolean) {
  const modal = await openImport(page);
  await modal.getByPlaceholder('Search').fill(isValid ? Mock.IMPORT_DATASET.name : 'incorrect')

  const content = await modal.locator('.table-content').count()
  expect(content).toEqual(isValid ? 1 : 0)
}

async function doImport(page: ExtendedPage, finalize: boolean) {
  const modal = await openImport(page);
  await modal.getByText(Mock.IMPORT_DATASET.name).click()
  if (finalize) {
    await Promise.all([
      page.waitForRequest(/\/api\/dataset\/datawork_import\/?/g),
      modal.getByRole('button', { name: 'Import datasets' }).click()
    ])
  } else {
    await expectNoRequestsOnAction(
      page,
      () => page.getByRole('button', { name: 'Cancel' }).click(),
      /\/api\/dataset\/datawork_import\/?/g
    )
  }
}

// Annotator user does not have access to this page (see navigation tests)

test.describe('Staff', () => {
  test('Empty state', ({ staff: page }) => empty(page));
  test('See datasets', ESSENTIAL, ({ staff: page }) => seeDatasets(page));
  test('See available import datasets', ({ staff: page }) => seeImportDataset(page));
  test('Incorrect import search has no result', ({ staff: page }) => searchImport(page, false));
  test('Correct import search has one result', ({ staff: page }) => searchImport(page, true));
  test('Can cancel an import', ({ staff: page }) => doImport(page, false));
  test('Can import', ESSENTIAL, ({ staff: page }) => doImport(page, true));
})

test.describe('Superuser', () => {
  test('Empty state', ({ superuser: page }) => empty(page));
  test('See datasets', ESSENTIAL, ({ superuser: page }) => seeDatasets(page));
  test('See available import datasets', ({ superuser: page }) => seeImportDataset(page));
  test('Incorrect import search has no result', ({ superuser: page }) => searchImport(page, false));
  test('Correct import search has one result', ({ superuser: page }) => searchImport(page, true));
  test('Can cancel an import', ({ superuser: page }) => doImport(page, false));
  test('Can import', ESSENTIAL, ({ superuser: page }) => doImport(page, true));
})