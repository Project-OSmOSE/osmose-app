import { Page, test } from '@playwright/test';
import { AplosePage } from './interface';
import { Mock } from "../services";

export class HomePage implements AplosePage {

  constructor(private page: Page,
              private mock: Mock = new Mock(page)) {
  }

  async go() {
    await test.step('Navigate to home', async () => {
      await this.mock.userSelf(null);
      await this.mock.collaborators();
      await this.page.goto('/app/');
    });
  }
}