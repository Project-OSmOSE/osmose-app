import { expect, test } from './utils/fixture';
import { ESSENTIAL } from "./utils/detail";

test.describe.configure({mode: "serial"})

test('Can access Login', ESSENTIAL, async ({ annotator: page }) => {
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.getByRole('heading', { name: 'Login', exact: true }).first()).toBeVisible();
})

test('Can access OSmOSE website', ESSENTIAL, async ({ annotator: page }) => {
  const url = await page.getByRole('link', { name: 'OSmOSE', exact: true }).getAttribute('href')
  expect(url).toEqual('/')
})

test('Can access documentation', ESSENTIAL, async ({ annotator: page }) => {
  const url = await page.getByRole('link', { name: 'Documentation', exact: true }).first().getAttribute('href')
  expect(url).toEqual('/doc/')
})