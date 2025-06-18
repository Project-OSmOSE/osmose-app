import { Page, test } from '@playwright/test';
import { Mock } from '../services';
import { CAMPAIGN, UserType } from '../../fixtures';
import { CampaignDetailPage } from './campaign-detail';

export class CampaignEditPage {

  get firstIndexInputs() {
    return this.page.getByPlaceholder('1')
  }


  get lastIndexInputs() {
    return this.page.getByPlaceholder((CAMPAIGN.files_count).toString())
  }

  constructor(private page: Page,
              private detail = new CampaignDetailPage(page),
              private mock = new Mock(page)) {
  }

  async go(as: UserType, options?: { empty: boolean }) {
    await test.step('Navigate to Campaign detail', async () => {
      await this.detail.go(as, options)
      await this.mock.fileRanges(options?.empty)
      await this.mock.annotatorGroups(options?.empty)
      await this.detail.manageButton.click();
    });
  }
}