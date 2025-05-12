import { expect, Locator, Page, test } from '@playwright/test';
import { UserType } from '../../fixtures';
import { Phase } from '../../../src/service/campaign';
import { AnnotationResultType, BoxBounds, PointBounds } from '../../../src/service/campaign/result';
import { Mock } from "../services";
import { CampaignDetailPage } from "./campaign-detail";

export type Label = {
  addPresence: () => Promise<void>;
  selectLabel: () => Promise<void>;
  getLabelState: () => Promise<boolean>;
  remove: () => Promise<void>;
  getWeakResult: () => Locator;
  getNthStrongResult: (nth: number) => Locator;
}
export type Confidence = {
  select: () => Promise<void>;
}

export type Validation = {
  validate: () => Promise<void>;
  invalidate: () => Promise<void>;
  expectState: (isValid: boolean) => Promise<void>;
}

export class AnnotatorPage {

  get backToCampaignButton(): Locator {
    return this.page.getByRole('button', { name: 'Back to Campaign' });
  }

  get commentInput(): Locator {
    return this.page.getByPlaceholder('Enter your comment');
  }

  get taskCommentButton(): Locator {
    return this.page.getByRole('button', { name: 'Task Comment' });
  }

  get resultsBlock(): Locator {
    return this.page.locator('.results');
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Submit & load next recording' })
  }

  private getValidationWithButtons(validateBtn: Locator, invalidateBtn: Locator): Validation {
    return {
      validate: async () => {
        await validateBtn.click()
      },
      invalidate: async () => {
        await invalidateBtn.click()
        await this.page.getByRole('button', { name: 'Remove' }).last().click()
      },
      expectState: async (isValid: boolean) => {
        await expect(validateBtn).toHaveAttribute('color', isValid ? 'success' : 'medium')
        await expect(invalidateBtn).toHaveAttribute('color', isValid ? 'medium' : 'danger')
      }
    }
  }

  get presenceValidation(): Validation {
    return this.getValidationWithButtons(
      this.page.locator('ion-button.validate').first(),
      this.page.locator('ion-button.invalidate').first(),
    )
  }

  get boxValidation(): Validation {
    return this.getValidationWithButtons(
      this.page.locator('ion-button.validate').nth(1),
      this.page.locator('ion-button.invalidate').nth(1),
    )
  }

  constructor(private page: Page,
              private mock = new Mock(page),
              private detail = new CampaignDetailPage(page)) {
  }

  async go(as: UserType, options: {
    phase: Phase,
    empty?: boolean,
    noConfidence?: boolean
    allowPoint?: boolean
  }) {
    await test.step('Navigate to Annotator', async () => {
      await this.detail.go(as, {
        noConfidence: options.noConfidence,
        phase: options.phase,
        allowPoint: options.allowPoint
      })
      await this.mock.confidenceSetDetail()
      await this.mock.detectors()
      await this.mock.labelSetDetail()
      await this.mock.campaignDetail(false, options?.phase, !options.noConfidence, options.allowPoint)
      await this.mock.annotator(options.phase, options.empty)
      await this.detail.resumeButton.click()
      await this.mock.annotator(options.phase, options.empty)
    });
  }

  getLabel(label: string): Label {
    return {
      addPresence: async () => {
        await this.page.locator('.label ion-chip').filter({ hasText: label }).click()
      },
      remove: async () => {
        await this.page.locator('.label ion-chip').filter({ hasText: label }).locator('svg').last().click()
        const alert = this.page.getByRole('dialog')
        await alert.getByRole('button', { name: `Remove "${ label }" annotations` }).click()
      },
      selectLabel: async () => {
        await this.page.locator('.label ion-chip').filter({ hasText: label }).click()
      },
      getLabelState: async () => {
        const outline = await this.page.locator('.label ion-chip').filter({ hasText: label }).getAttribute('outline');
        return outline !== 'true';
      },
      getWeakResult: () => {
        return this.resultsBlock.getByText(label).first()
      },
      getNthStrongResult: (nth: number) => {
        return this.resultsBlock.getByText(label).nth(1 + nth)
      },
    }
  }

  getConfidence(confidence: string): Confidence {
    return {
      select: async () => {
        await this.page.locator('ion-chip').filter({ hasText: confidence }).click()
      }
    }
  }

  private async scrollTop() {
    await this.page.evaluate(() => window.scrollTo({ left: 0, top: 0 }))
  }

  async draw(type: Exclude<AnnotationResultType, 'Weak'>): Promise<BoxBounds | PointBounds> {
    return test.step(`Draw ${ type }`, async () => {
      await this.scrollTop();
      const canvas = this.page.locator('canvas.drawable').first()
      await expect(canvas).toBeVisible()
      await this.page.mouse.move(380, 410)
      await this.page.mouse.down({ button: 'left' })
      if (type === 'Box') await this.page.mouse.move(610, 480)
      await this.page.mouse.up({ button: 'left' })
      return {
        type,
        start_time: type === 'Box' ? 2.704 : 4.607,
        end_time: type === 'Box' ? 4.607 : null,
        start_frequency: type === 'Box' ? 0 : 29,
        end_frequency: type === 'Box' ? 29 : null,
      } as BoxBounds | PointBounds
    })
  }

  async removeStrong(): Promise<void> {
    await this.page.locator('.remove-box').click()
  }
}