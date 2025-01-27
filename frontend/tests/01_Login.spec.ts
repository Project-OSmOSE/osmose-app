import { expect, test } from './utils/fixture';
import { ESSENTIAL } from "./utils/detail";

test.describe.configure({mode: "serial"})

test.beforeEach(({annotator: page}) => page.nav.goLogin())

test('can go back regular', async ({ annotator: page }) => {
  const url = await page.getByRole('link', { name: 'Back to Home' }).getAttribute('href')
  expect(url).toEqual('/app/')
})

test('logs in with good credentials', ESSENTIAL, async ({ annotator: page }) => {
  await page.auth.login();
  await expect(page.getByRole('heading', { name: 'Annotation Campaigns' })).toBeVisible();
})

test('logs in with invalid password', async ({ annotator: page }) => {
  await page.auth.login(undefined, 'incorrect password', false);
  await expect(page.getByText('No active account found with the given credentials')).toBeVisible();
})

test('logs in with invalid username', async ({ annotator: page }) => {
  await page.auth.login('incorrect username', undefined, false);
  await expect(page.getByText('No active account found with the given credentials')).toBeVisible();
})

test('logs in after error', async ({ annotator: page }) => {
  await page.auth.login('invalid username', 'incorrect password', false);
  await expect(page.getByText('No active account found with the given credentials')).toBeVisible();

  await page.auth.login();
  await expect(page.getByRole('heading', { name: 'Annotation Campaigns' })).toBeVisible();
})