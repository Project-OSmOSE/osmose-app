import { Page } from '@playwright/test';
import { TestUser } from "./data";

export async function login(page: Page, user: TestUser) {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('/');

  await page.getByText('Login').click()

  await page.getByPlaceholder('username').fill(user.username)
  await page.getByPlaceholder('password').fill(user.password)

  await Promise.all([
    page.waitForRequest(request => request.url().includes('/api/token') && request.method() === 'POST'),
    page.getByRole('button', { name: 'Submit' }).click()
  ])

  await page.waitForLoadState()
}