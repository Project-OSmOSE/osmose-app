import { ESSENTIAL, expect, test } from './utils';
import { LoginPage } from './utils/pages';
import { AUTH } from './fixtures';

test('Login - Unauthorized', ESSENTIAL, async ({ page }) => {
  await page.login.go();
  await page.login.fillForm();
  await page.login.submit({ status: 401, submitAction: 'button' });
  await expect(page.getByText(LoginPage.SERVER_ERROR)).toBeVisible();
})

test('Login - Success', ESSENTIAL, async ({ page }) => {
  await page.login.go();
  await page.login.fillForm();
  const request = await page.login.submit({ status: 200, submitAction: 'button' });
  expect(await request.postDataJSON()).toEqual({
    username: AUTH.username,
    password: AUTH.password
  })
  await expect(page.getByRole('heading', { name: 'Annotation Campaigns' })).toBeVisible();
})

test('Login - Success with Enter key', ESSENTIAL, async ({ page }) => {
  await page.login.go();
  await page.login.fillForm();
  const request = await page.login.submit({ status: 200, submitAction: 'enterKey' });
  expect(await request.postDataJSON()).toEqual({
    username: AUTH.username,
    password: AUTH.password
  })
  await expect(page.getByRole('heading', { name: 'Annotation Campaigns' })).toBeVisible();
})
