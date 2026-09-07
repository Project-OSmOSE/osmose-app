import { expect, Locator, Page, test } from '@playwright/test';
import { type Annotation, type Confidence, type Label } from '../mock/types';
import { AnnotationType } from '../../../src/api/types.gql-generated';
import { PhaseDetailPage } from './phase-detail';
import type { Params } from '../types';


export class AnnotatorPage {

  get backToCampaignButton(): Locator {
    return this.page.getByRole('button', { name: 'Back to campaign' });
  }

  get commentInput(): Locator {
    return this.page.getByPlaceholder('Enter your comment');
  }

  get taskCommentButton(): Locator {
    return this.page.getByRole('button', { name: 'Task Comment' });
  }

  get annotationsBlock(): Locator {
    return this.page.getByTestId('annotation-bloc');
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Submit & load next recording' })
  }

  constructor(private page: Page,
              private phaseDetailPage = new PhaseDetailPage(page)) {
  }

  async go({ as, phase }: Pick<Params, 'as' | 'phase'>) {
    await this.phaseDetailPage.go({ as, phase })
    await this.phaseDetailPage.resumeButton.click()
  }

  getLabelChip(label: Label) {
    return this.page.getByTestId('label-chip').filter({ hasText: label.name })
  }

  getConfidenceChip(confidence: Confidence) {
    return this.page.getByTestId('confidence-chip').getByText(confidence.label, { exact: true })
  }

  getAnnotationForLabel(label: Label, { type }: Pick<Params, 'type'>): Locator {
    return this.annotationsBlock.getByText(label.name).nth(type === AnnotationType.Weak ? 0 : 1)
  }

  getAnnotationValidateBtn({ type }: Pick<Params, 'type'>): Locator {
    return this.annotationsBlock.getByTestId('validate').nth(type === AnnotationType.Weak ? 0 : 1)
  }

  getAnnotationInvalidateBtn({ type }: Pick<Params, 'type'>): Locator {
    return this.annotationsBlock.getByTestId('invalidate').nth(type === AnnotationType.Weak ? 0 : 1)
  }

  async invalidateAnnotation({ type }: Pick<Params, 'type'>): Promise<void> {
    await this.getAnnotationInvalidateBtn({ type }).click()
    if (type !== AnnotationType.Weak)
      await this.page.getByRole('dialog').getByRole('button', { name: 'Remove' }).click()
  }

  async updateBoxAnnotationLabel(newLabel: Label): Promise<void> {
    await this.getAnnotationInvalidateBtn({ type: AnnotationType.Box }).click()
    await this.page.getByRole('dialog').getByRole('button', { name: 'Change the label' }).click()
    await this.page.getByRole('dialog').getByRole('button', { name: newLabel.name }).click()
  }

  async isLabelUsed(label: Label): Promise<boolean> {
    const color = await this.getLabelChip(label).getAttribute('data-color');
    return color !== 'medium';
  }

  async isAnnotationValid({ type }: Pick<Params, 'type'>): Promise<boolean> {
    return await this.getAnnotationValidateBtn({ type }).getAttribute('color') === 'success'
  }

  async addWeak(label: Label, { method }: Pick<Params, 'method'>) {
    switch (method) {
      case 'mouse':
        await this.getLabelChip(label).click()
        break;
      case 'shortcut':
        await this.page.keyboard.press(label.id, { delay: 1_000 })
        break;
    }
  }

  async removeWeak(label: Label, { method }: Pick<Params, 'method'>) {
    switch (method) {
      case 'mouse':
        await this.getLabelChip(label).getByTestId('remove-label').click()
        break;
      case 'shortcut':
        await this.getAnnotationForLabel(label, { type: AnnotationType.Weak }).click() // Set focus
        await this.page.keyboard.press('Delete')
        break;
    }
  }

  async confirmeRemoveWeak(label: Label, { method }: Pick<Params, 'method'>) {
    switch (method) {
      case 'mouse':
        await this.page.getByRole('dialog').getByRole('button', { name: `Remove "${ label.name }" annotations` }).click()
        break;
      case 'shortcut':
        await this.page.keyboard.press('Enter')
        break;
    }
  }

  async submit({ method }: Pick<Params, 'method'>) {
    await this.submitButton.waitFor()
    switch (method) {
      case 'mouse':
        await this.submitButton.click()
        break;
      case 'shortcut':
        await this.page.keyboard.press('Enter')
        break;
    }
  }

  async removeStrong(label: Label, { type, method }: Pick<Params, 'type' | 'method'>): Promise<void> {
    // Focus
    await this.getAnnotationForLabel(label, { type }).click({ force: true})
    switch (method) {
      case 'mouse':
        await this.page.getByTestId('remove-box').click()
        break;
      case 'shortcut':
        await this.page.keyboard.press('Delete')
        break;
    }
  }

  private async scrollTop() {
    await this.page.evaluate(() => window.scrollTo({ left: 0, top: 0 }))
  }

  async draw(type: Exclude<AnnotationType, AnnotationType.Weak>): Promise<Pick<Annotation, 'startTime' | 'startFrequency' | 'endTime' | 'endFrequency'>> {
    return test.step(`Draw ${ type }`, async () => {
      await this.scrollTop();
      const canvas = this.page.getByTestId('drawable-canvas').first()
      await expect(canvas).toBeVisible()
      await this.page.mouse.move(380, 368)
      await this.page.mouse.down({ button: 'left' })
      if (type === 'Box') await this.page.mouse.move(610, 480)
      await this.page.mouse.up({ button: 'left' })
      return {
        startTime: 2.704,
        endTime: type === 'Box' ? 4.607 : undefined,
        startFrequency: type === 'Box' ? 0.000 : 55.000,
        endFrequency: type === 'Box' ? 55.000 : undefined,
      } as Pick<Annotation, 'startTime' | 'startFrequency' | 'endTime' | 'endFrequency'>
    })
  }

}