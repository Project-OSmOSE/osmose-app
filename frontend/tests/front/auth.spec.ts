import { expect, test } from '../utils/fixture';
import { login } from "../utils/auth/function";
import { ADMIN, ANNOTATOR, TestUser } from "../utils/auth/data";
import { Cookie, Page } from "@playwright/test";

async function checkTokenCookie(page: Page) {
  const cookies = await page.context().cookies()
  expect(cookies.length).toBeGreaterThanOrEqual(1);
  const tokenCookie: Cookie | undefined = cookies.find(c => c.name === 'token');
  expect(tokenCookie).not.toBeUndefined();
}

test.describe('Login', () => {
  test('logs in with admin credentials', {
    tag: '@essential'
  }, async ({ page }) => {
    await login(page, ADMIN);

    const title = page.getByRole('heading', { name: 'Annotation Campaigns' })
    await expect(title).toBeVisible();

    await checkTokenCookie(page);
  })

  test('logs in with annotator credentials', {
    tag: '@essential'
  }, async ({ page }) => {
    await login(page, ANNOTATOR);

    const title = page.getByRole('heading', { name: 'Annotation Campaigns' })
    await expect(title).toBeVisible();

    await checkTokenCookie(page);
  })

  test('logs in with invalid password', async ({ page }) => {
    await login(page, {
      ...ADMIN,
      password: 'incorrect password'
    } as TestUser);

    const error = page.locator("text='No active account found with the given credentials'")
    await expect(error).toBeVisible();
  })

  test('logs in with invalid username', async ({ page }) => {
    await login(page, {
      username: 'invalid username',
      password: 'incorrect password'
    } as TestUser);

    const error = page.locator("text='No active account found with the given credentials'")
    await expect(error).toBeVisible();
  })

  test('logs in after error', async ({ page }) => {
    await login(page, {
      username: 'invalid username',
      password: 'incorrect password'
    } as TestUser);

    const error = page.locator("text='No active account found with the given credentials'")
    await expect(error).toBeVisible();

    await login(page, ADMIN);

    const title = page.getByRole('heading', { name: 'Annotation Campaigns' })
    await expect(title).toBeVisible();

    await checkTokenCookie(page);
  })
})

test.describe('Logout', {
  tag: '@essential'
}, () => {
  test('logs out with admin credentials', async ({ adminPage: page }) => {
    await page.getByRole('button', { name: 'Logout' }).click()

    const title = page.getByRole('heading', { name: 'Login' })
    await expect(title).toBeVisible();
  })

  test('logs out with annotator credentials', async ({ annotatorPage: page }) => {
    await page.getByRole('button', { name: 'Logout' }).click()

    const title = page.getByRole('heading', { name: 'Login' })
    await expect(title).toBeVisible();
  })
})