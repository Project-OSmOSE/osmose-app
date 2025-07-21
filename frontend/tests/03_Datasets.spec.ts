import { ESSENTIAL, expect, Page, test } from './utils';
import { DATASET } from './fixtures';

// Utils

const STEP = {
  displayDatasets: (page: Page) => test.step('Display datasets', async () => {
    const content = page.locator('.table-content')
    await expect(content.first()).toBeVisible();
    const textContent = await Promise.all((await content.all()).map(c => c.textContent()))
    expect(textContent).toContain(DATASET.name)
  }),
}

const TEST = {
  empty: async (page: Page) => {
    await expect(page.locator('.table-content')).not.toBeVisible();
    await expect(page.getByText('No datasets')).toBeVisible();
  },
  display: async (page: Page) => {
    await STEP.displayDatasets(page);
  },
}


// Tests

test.describe('Staff', ESSENTIAL, () => {
  test('Should display empty state', async ({ page }) => {
    await page.dataset.go('staff', { empty: true });
    await TEST.empty(page)
  });
  test('Should display loaded data', async ({ page }) => {
    await page.dataset.go('staff');
    await TEST.display(page)
  })
})

test.describe('Superuser', ESSENTIAL, () => {
  test('Should display empty state', async ({ page }) => {
    await page.dataset.go('superuser', { empty: true });
    await TEST.empty(page)
  });
  test('Should display loaded data', async ({ page }) => {
    await page.dataset.go('superuser');
    await TEST.display(page)
  })
})
