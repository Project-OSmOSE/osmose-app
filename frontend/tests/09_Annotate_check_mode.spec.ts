import { ESSENTIAL, expect, test } from './utils';
import { RESULTS, UserType } from './fixtures';

// Utils

function getTag(isNew: boolean) {
  return `[${ isNew ? 'new' : 'old' }]`
}

const TEST = {
  empty: (as: UserType, { isNew }: { isNew: boolean }) => {
    return test(`${ getTag(isNew) } Empty`, ESSENTIAL, async ({ page }) => {
      const annotator = isNew ? page.annotatorNew : page.annotator;
      await annotator.go(as, { mode: 'Check', empty: true });
      await page.annotator.resultsBlock.waitFor()

      await test.step('Initial state', async () => {
        await expect(page.getByText('Labels list')).not.toBeVisible()
        await expect(page.getByText('Presence / Absence')).not.toBeVisible()
        await expect(page.getByText('Confidence indicator')).not.toBeVisible()
        await expect(page.getByText('No results')).toBeVisible()
      })
    })
  },
  filled: (as: UserType, { isNew }: { isNew: boolean }) => {
    return test(`${ getTag(isNew) } With annotations`, ESSENTIAL, async ({ page }) => {
      const annotator = isNew ? page.annotatorNew : page.annotator;
      await annotator.go(as, { mode: 'Check' });
      await page.annotator.resultsBlock.waitFor()

      await test.step('Initial state', async () => {
        await expect(page.annotator.resultsBlock.getByText(RESULTS.box.label).first()).toBeVisible()
        await expect(page.annotator.resultsBlock.getByText(RESULTS.box.confidence_indicator!)).toBeVisible()
        await expect(page.annotator.resultsBlock.getByText(RESULTS.box.start_frequency!.toString())).toBeVisible()
        await expect(page.annotator.resultsBlock.getByText(RESULTS.box.end_frequency!.toString())).toBeVisible()
        await expect(page.annotator.resultsBlock.getByText(Math.floor(RESULTS.box.start_time!).toString())).toBeVisible()
        await expect(page.annotator.resultsBlock.getByText(Math.floor(RESULTS.box.end_time!).toString())).toBeVisible()
        await page.annotator.presenceValidation.expectState(false)
        await page.annotator.boxValidation.expectState(false)
      })

      await test.step('Validate presence', async () => {
        await page.annotator.presenceValidation.validate()
        await page.annotator.presenceValidation.expectState(true)
        await page.annotator.boxValidation.expectState(false)
      })

      await test.step('Invalidate presence', async () => {
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

      await test.step('Invalidate presence > invalidate all', async () => {
        await page.annotator.boxValidation.validate()
        await page.annotator.presenceValidation.invalidate()
        await page.annotator.presenceValidation.expectState(false)
        await page.annotator.boxValidation.expectState(false)
      })

      await test.step('Submit', async () => {
        const [ request ] = await Promise.all([
          page.waitForRequest(/annotator\/campaign\/-?\d\/file\/-?\d/g),
          page.getByRole('button', { name: 'Submit & load next recording' }).click()
        ])
        const submittedResults = request.postDataJSON().results;
        expect(submittedResults[0]).toEqual(expect.objectContaining({
          validations: [ { is_valid: false } ]
        }));
        expect(submittedResults[1]).toEqual(expect.objectContaining({
          validations: [ { is_valid: false } ]
        }));
      })
    })
  }
}

// Tests

test.describe('Annotator', () => {
  TEST.empty('annotator', { isNew: false });
  TEST.filled('annotator', { isNew: false });
})

test.describe('Staff', () => {
  TEST.empty('staff', { isNew: true });
  TEST.filled('staff', { isNew: true });
})
