import { Locator, Page, test } from '@playwright/test';
import { Mock } from '../services';
import { CAMPAIGN, DATASET, UserType } from '../../fixtures';
import { CampaignListPage } from './campaign-list';
import { selectInAlert } from '../functions';


export class CampaignCreatePage {

  get createButton(): Locator {
    return this.page.getByRole('button', { name: 'Create campaign' })
  }

  constructor(private page: Page,
              private list = new CampaignListPage(page),
              private mock = new Mock(page)) {
  }

  async go(as: UserType, options?: { empty?: boolean, withErrors?: boolean, loadDetectors?: boolean }): Promise<void> {
    await test.step('Navigate to Campaign create', async () => {
      await this.list.go(as)
      await this.mock.datasets(options?.empty)
      await this.mock.users(options?.empty)
      await this.mock.detectors(!(options?.loadDetectors ?? false))
      await this.mock.resultImport()
      await this.list.createButton.click();
      await this.mock.campaignCreate(options?.withErrors);
      await this.mock.campaignDetail(options?.empty);
    });
  }

  async fillGlobal(options?: { complete: boolean }) {
    return test.step('Campaign global information', async () => {
      await this.page.getByPlaceholder('Campaign name').fill(CAMPAIGN.name);
      if (options?.complete) {
        await this.page.getByPlaceholder('Enter your campaign description').fill(CAMPAIGN.desc);
        await this.page.getByPlaceholder('URL').fill(CAMPAIGN.instructions_url);
        const d = new Date(CAMPAIGN.deadline);
        await this.page.getByPlaceholder('Deadline').fill(d.toISOString().split('T')[0]);
      }
    })
  }

  async fillData() {
    return test.step('Campaign data', async () => {
      await this.page.getByRole('button', { name: 'Select a dataset' }).click();
      await selectInAlert(this.page, DATASET.name);
    })
  }

  // async selectMode(mode: 'Create annotations' | 'Check annotations') {
  //   await this.page.getByText(mode).click();
  // }
  //
  // async fillAcousticFeatures() {
  //   return test.step('Acoustic features', async () => {
  //     await this.page.locator('.table-content').nth((LABEL.set.labels.indexOf(LABEL.withFeatures) + 1) * 2 - 1).locator('ion-checkbox').click()
  //   });
  // }
  //
  // async fillAnnotationCreate(options?: { complete: boolean }) {
  //   return test.step('Campaign annotation - Create mode', async () => {
  //     await this.selectMode('Create annotations')
  //     await this.page.getByRole('button', { name: 'Select a label set' }).click();
  //     await selectInAlert(this.page, LABEL.set.name);
  //     if (options?.complete) {
  //       await this.fillAcousticFeatures()
  //       // Confidence
  //       await this.page.getByRole('button', { name: 'Select a confidence set' }).click();
  //       await selectInAlert(this.page, CONFIDENCE.set.name);
  //       // Point
  //       await this.page.getByText('Allow annotations of type "Point"').click();
  //     }
  //   })
  // }

}