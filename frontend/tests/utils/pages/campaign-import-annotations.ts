import { expect, Locator, Page, test } from '@playwright/test';
import { Mock } from '../services';
import { DETECTOR_CONFIGURATION, UserType } from '../../fixtures';
import { fileURLToPath } from 'url';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import path from 'path';
import { CampaignDetailPage } from "./campaign-detail";
import * as fs from "node:fs";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename).split(/[/\\]/g); // get the name of the directory
__dirname.pop();
__dirname.pop();
const __file = path.join(__dirname.join('/'), "fixtures", "annotation_results.csv")

type CheckOptions = {
  onlyFirstDetector: boolean,
}

export class CampaignImportAnnotationsPage {

  get importButton(): Locator {
    return this.page.getByRole('button', { name: 'Import' })
  }
  get backButton(): Locator {
    return this.page.getByRole('button', { name: 'Back to campaign' })
  }
  get resetFileButton(): Locator {
    return this.page.getByRole('button', { name: 'Reset' })
  }

  get fileData(): string {
    return fs.readFileSync(__file, 'utf8');
  }

  constructor(private page: Page,
              private detail = new CampaignDetailPage(page),
              private mock = new Mock(page)) {
  }

  async go(as: UserType, options?: { empty?: boolean, withErrors?: boolean, loadDetectors?: boolean }): Promise<void> {
    await test.step('Navigate to Campaign create', async () => {
      await this.detail.go(as, { phase: 'Verification' })
      await this.mock.detectors(!(options?.loadDetectors ?? false))
      await this.mock.resultImport()
      await this.detail.importAnnotationsButton.click();
    });
  }

  async importFile() {
    return test.step('Import file', async () => {
      const [ fileChooser ] = await Promise.all([
        this.page.waitForEvent('filechooser'),
        this.page.getByText('Import annotations (csv)').click()
      ])
      await fileChooser.setFiles(__file);
    })
  }

  async selectDetectors(options?: CheckOptions) {
    return test.step('Select Detectors', async () => {
      await expect(this.page.getByText('Unknown detector').first()).toBeVisible()
      await this.page.getByText('Assign to detector').first().click()
      await this.page.locator('#options:visible').getByText('Create').first().click()
      if (!options?.onlyFirstDetector) {
        await this.page.getByText('Assign to detector').first().click()
        await this.page.locator('#options:visible').getByText('Create').first().click()
        await this.page.getByText('Assign to detector').first().click()
        await this.page.locator('#options:visible').getByText('Create').first().click()
      }
    })
  }

  async selectDetectorsConfigurationsStep(options?: CheckOptions) {
    return test.step('Select Detectors configuration', async () => {
      await this.page.getByText('Select configuration').first().click()
      await this.page.locator('#options:visible').getByText('Create new').first().click()
      await this.page.locator('textarea').nth(0).fill(DETECTOR_CONFIGURATION)
      if (!options?.onlyFirstDetector) {
        await this.page.getByText('Select configuration').first().click()
        await this.page.locator('#options:visible').getByText('Create new').first().click()
        await this.page.locator('textarea').nth(1).fill(DETECTOR_CONFIGURATION)
        await this.page.getByText('Select configuration').first().click()
        await this.page.locator('#options:visible').getByText('Create new').first().click()
        await this.page.locator('textarea').last().fill(DETECTOR_CONFIGURATION)
      } else {
        await expect(this.page.getByText('detector2').nth(1)).not.toBeVisible();
        await expect(this.page.getByText('detector3').nth(1)).not.toBeVisible();
      }
    })
  }

  async fillAnnotationCheck(options?: CheckOptions) {
    return test.step('Campaign annotation - Check mode', async () => {
      await this.importFile();
      await this.selectDetectors(options)
      await this.selectDetectorsConfigurationsStep(options)
    })

  }

  async submit() {
    await this.mock.annotatorGroups()
    await this.mock.fileRanges()
    await this.importButton.click()
  }

}