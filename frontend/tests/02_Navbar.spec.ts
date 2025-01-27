import { expect, ExtendedPage, test } from './utils/fixture';
import { ESSENTIAL } from "./utils/detail";

test.describe.configure({ mode: "serial" })

test.beforeEach(({ annotator: page }) => page.nav.goAnnotationCampaigns())

test('can go back regular', async ({ annotator: page }) => {
  const url = await page.getByRole('link', { name: 'Back to Home' }).getAttribute('href')
  expect(url).toEqual('/app/')
})

test('can access campaign', ESSENTIAL, async ({ annotator: page }) => {
  const url = await page.getByRole('link', { name: 'Annotation campaigns' }).getAttribute('href')
  expect(url).toEqual('/app/annotation-campaign')
})

test('cannot access datasets', async ({ annotator: page }) => {
  await expect(page.getByRole('link', { name: 'Datasets' })).not.toBeVisible();
})

test('cannot access administration', async ({ annotator: page }) => {
  await expect(page.getByRole('link', { name: 'Admin' })).not.toBeVisible();
})

test('Can access documentation', async ({ annotator: page }) => {
  const url = await page.getByRole('link', { name: 'Documentation', exact: true }).first().getAttribute('href')
  expect(url).toEqual('/doc/')
})

test('Can access account', async ({ annotator: page }) => {
  const url = await page.getByRole('link', { name: 'Account', exact: true }).first().getAttribute('href')
  expect(url).toEqual('/app/account')
})

test('Can logout', ESSENTIAL, async ({ annotator: page }) => {
  await page.getByRole('button', { name: 'Logout' }).click()
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
})

async function superCanAccessDataset(page: ExtendedPage) {
  const url = await page.getByRole('link', { name: 'Datasets' }).getAttribute('href')
  expect(url).toEqual('/app/datasets')
}

async function superCanAccessAdmin(page: ExtendedPage) {
  const url = await page.getByRole('link', { name: 'Admin' }).getAttribute('href')
  expect(url).toEqual('/backend/admin')
}

test.describe('Staff', ESSENTIAL, () => {
  test.beforeEach(({ staff: page }) => page.nav.goAnnotationCampaigns())
  test('can access datasets', ({ staff: page }) => superCanAccessDataset(page))
  test('can access administration', ({ staff: page }) => superCanAccessAdmin(page))
})

test.describe('Superuser', ESSENTIAL, () => {
  test.beforeEach(({ superuser: page }) => page.nav.goAnnotationCampaigns())
  test('can access datasets', ({ superuser: page }) => superCanAccessDataset(page))
  test('can access administration', ({ superuser: page }) => superCanAccessAdmin(page))
})
