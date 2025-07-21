import { ESSENTIAL, expect, test } from './utils';
import { UserType } from './fixtures';
import { MOCK } from "./utils/services";

// Utils

// const STEP = {
//   importSearchIncorrect: (modal: DatasetImportModal) => test.step('Incorrect import search has no result', async () => {
//     await modal.search('incorrect')
//     const content = await modal.locator('.table-content').count()
//     expect(content).toEqual(0)
//   }),
//   importSearchCorrect: (modal: DatasetImportModal) => test.step('Correct import search has one result', async () => {
//     await modal.search(IMPORT_DATASET.name)
//     const content = await modal.locator('.table-content').count()
//     expect(content).toEqual(1)
//   }),
//   importCancel: (modal: DatasetImportModal, page: Page) => test.step('Cancel import will have no effect', async () => {
//     await modal.getByText(IMPORT_DATASET.name).click()
//     await expectNoRequestsOnAction(
//       page,
//       () => page.getByRole('button', { name: 'Cancel' }).click(),
//       API_URL.dataset.import
//     )
//   }),
//   import: (modal: DatasetImportModal, page: Page) => test.step('Can import dataset', async () => {
//     await modal.getByText(IMPORT_DATASET.name).click()
//     await Promise.all([
//       page.waitForRequest(API_URL.dataset.import),
//       modal.getByRole('button', { name: 'Import datasets' }).click()
//     ])
//   })
// }

const TEST = {
  empty: (as: UserType) => {
    return test('Should display empty state', async ({ page, interceptGQL }) => {
      await page.dataset.go(as, { empty: true });
      interceptGQL(page, "getAvailableDatasetsForImport", MOCK.getDatasetsAvailableForImport.empty)
      const modal = await page.dataset.openImportModal()

      await expect(modal.locator).toContainText('There is no new dataset or analysis')
    });
  },
  display: (as: UserType) => {
    return test('Should display loaded data', async ({ page, interceptGQL }) => {
      await page.dataset.go(as);
      interceptGQL(page, "getAvailableDatasetsForImport", MOCK.getDatasetsAvailableForImport.filled)
      const modal = await page.dataset.openImportModal()

      await expect(modal.locator).toContainText('Test import dataset')
      await expect(modal.locator).toContainText('Test analysis 1')
      await expect(modal.locator).toContainText('Test analysis 2')

      await modal.locator.getByText('Test import dataset').first().click()
      await expect(modal.locator).toContainText('1 Dataset selected (2 analysis)')

      await modal.locator.getByText('Test import dataset').first().click()
      await modal.locator.getByText('Test analysis 1').first().click()
      await expect(modal.locator).toContainText('1 Dataset selected (1 analysis)')
    })
  },
  // manageImport: async (page: Page) => {
  //   let modal = await page.dataset.openImportModal()
  //   await STEP.importSearchIncorrect(modal);
  //   await STEP.importSearchCorrect(modal);
  //
  //   await STEP.importCancel(modal, page);
  //   modal = await page.dataset.openImportModal()
  //   await STEP.import(modal, page);
  // }
}


// Tests

test.describe('Staff', ESSENTIAL, () => {
  TEST.empty('staff')
  TEST.display('staff')


  // test('Should manage import', async ({ page }) => {
  //   await page.dataset.go('staff');
  //   await TEST.manageImport(page)
  // })
})

test.describe('Superuser', ESSENTIAL, () => {
  TEST.empty('superuser')
  TEST.display('superuser')

  // test('Should display loaded data', async ({ page }) => {
  //   await page.dataset.go('superuser');
  //   await TEST.display(page)
  // })
  // test('Should manage import', async ({ page }) => {
  //   await page.dataset.go('superuser');
  //   await TEST.manageImport(page)
  // })
})
