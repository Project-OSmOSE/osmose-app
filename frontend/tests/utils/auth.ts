import { Cookie, Page } from "@playwright/test";
import { expect } from "./fixture";

export class Auth {

  constructor(private readonly page: Page) {
  }

  private async getAuthToken(): Promise<Cookie | undefined> {
    const cookies = await this.page.context().cookies()
    return cookies.find(c => c.name === 'token');
  }

  async login(username: string = 'admin',
              password: string = 'osmose29',
              shouldSucceed: boolean = true) {
    if (shouldSucceed && await this.getAuthToken()) return;
    await this.page.getByPlaceholder('username').fill(username)
    await this.page.getByPlaceholder('password').fill(password)
    await Promise.all([
      this.page.waitForResponse(/\/api\/token\/?/g),
      this.page.getByRole('button', { name: 'Login' }).click(),
    ])
    if (shouldSucceed) {
      expect(await this.getAuthToken()).not.toBeUndefined();
    }
  }
}
