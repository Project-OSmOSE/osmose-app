import { ESSENTIAL, expect, Page, test } from './utils';
import { RESULTS } from './fixtures';

// Utils
const STEP = {
  submit: (page: Page, { presenceIsValid, boxIsValid }: {
    presenceIsValid: boolean,
    boxIsValid: boolean
  }) => test.step('Submit', async () => {
    const [ request ] = await Promise.all([
      page.waitForRequest(/annotator\/campaign\/-?\d\/file\/-?\d/g),
      page.getByRole('button', { name: 'Submit & load next recording' }).click()
    ])
    const submittedResults = request.postDataJSON().results;
    expect(submittedResults[0]).toEqual(expect.objectContaining({
      validations: [ { is_valid: presenceIsValid } ]
    }));
    expect(submittedResults[1]).toEqual(expect.objectContaining({
      validations: [ { is_valid: boxIsValid } ]
    }));
  })
}

// Tests
test.describe('Annotator', () => {
  test(`Empty`, ESSENTIAL, async ({ page }) => {
    await page.annotator.go('annotator', { mode: 'Check', empty: true });
    await page.annotator.resultsBlock.waitFor()

    await test.step('Initial state', async () => {
      await expect(page.getByText('Labels list')).not.toBeVisible()
      await expect(page.getByText('Presence / Absence')).not.toBeVisible()
      await expect(page.getByText('Confidence indicator')).not.toBeVisible()
      await expect(page.getByText('No results')).toBeVisible()
    })
  })

  test(`With annotations without updates`, ESSENTIAL, async ({ page }) => {
    await page.annotator.go('annotator', { mode: 'Check' });
    await page.annotator.resultsBlock.waitFor()

    await test.step('Initial state', async () => {
      await expect(page.annotator.resultsBlock.getByText(RESULTS.box.label).first()).toBeVisible()
      await expect(page.annotator.resultsBlock.getByText(RESULTS.box.confidence_indicator!)).toBeVisible()
      await expect(page.annotator.resultsBlock.getByText(RESULTS.box.start_frequency.toString())).toBeVisible()
      await expect(page.annotator.resultsBlock.getByText(RESULTS.box.end_frequency.toString())).toBeVisible()
      await expect(page.annotator.resultsBlock.getByText(Math.floor(RESULTS.box.start_time).toString())).toBeVisible()
      await expect(page.annotator.resultsBlock.getByText(Math.floor(RESULTS.box.end_time).toString())).toBeVisible()
      await page.annotator.presenceValidation.expectState(true)
      await page.annotator.boxValidation.expectState(true)
    })

    await STEP.submit(page, { presenceIsValid: true, boxIsValid: true });
  })

  test(`With annotations`, ESSENTIAL, async ({ page }) => {
    await page.annotator.go('annotator', { mode: 'Check' });
    await page.annotator.resultsBlock.waitFor()

    await test.step('Initial state', async () => {
      await expect(page.annotator.resultsBlock.getByText(RESULTS.box.label).first()).toBeVisible()
      await expect(page.annotator.resultsBlock.getByText(RESULTS.box.confidence_indicator!)).toBeVisible()
      await expect(page.annotator.resultsBlock.getByText(RESULTS.box.start_frequency.toString())).toBeVisible()
      await expect(page.annotator.resultsBlock.getByText(RESULTS.box.end_frequency.toString())).toBeVisible()
      await expect(page.annotator.resultsBlock.getByText(Math.floor(RESULTS.box.start_time).toString())).toBeVisible()
      await expect(page.annotator.resultsBlock.getByText(Math.floor(RESULTS.box.end_time).toString())).toBeVisible()
      await page.annotator.presenceValidation.expectState(true)
      await page.annotator.boxValidation.expectState(true)
    })

    await test.step('Invalidate presence > invalidate all', async () => {
      await page.annotator.boxValidation.validate()
      await page.annotator.presenceValidation.invalidate()
      await page.annotator.presenceValidation.expectState(false)
      await page.annotator.boxValidation.expectState(false)
    })

    await test.step('Validate box > validate all', async () => {
      await page.annotator.boxValidation.validate()
      await page.annotator.presenceValidation.expectState(true)
      await page.annotator.boxValidation.expectState(true)
    })

    await test.step('Invalidate box', async () => {
      await page.annotator.boxValidation.invalidate()
      await page.annotator.presenceValidation.expectState(true)
      await page.annotator.boxValidation.expectState(false)
    })

    await test.step('Validate presence', async () => {
      await page.annotator.presenceValidation.invalidate()
      await page.annotator.presenceValidation.expectState(false)
      await page.annotator.boxValidation.expectState(false)
      await page.annotator.presenceValidation.validate()
      await page.annotator.presenceValidation.expectState(true)
      await page.annotator.boxValidation.expectState(false)
    })

    await STEP.submit(page, { presenceIsValid: true, boxIsValid: false });
  })
})