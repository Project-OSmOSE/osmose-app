import { ESSENTIAL, expect, test } from './utils';
import { CAMPAIGN, COMMENT, CONFIDENCE, FILE_RANGE, LABEL, UserType } from './fixtures';
import { BoxBounds } from '../src/service/campaign/result';

// Utils
const TEST = {
  empty: (as: UserType, { submit }: { submit: 'mouse' | 'key' }) => {
    return test(`Empty (submit ${ submit })`, ESSENTIAL, async ({ page }) => {
      await page.annotator.go(as, { phase: 'Annotation', empty: true });
      await expect(page.getByText('Confidence indicator ')).toBeVisible();

      await test.step('See no results', () => expect(page.getByText('No results')).toBeVisible())

      await test.step('Can add presence - mouse', async () => {
        const label = page.annotator.getLabel(LABEL.classic);
        expect(await label.getLabelState()).toBeFalsy();
        await label.addPresence();
        await expect(label.getWeakResult()).toBeVisible();
        expect(await label.getLabelState()).toBeTruthy();
      })

      await test.step('Can add presence - keyboard', async () => {
        const label = page.annotator.getLabel(LABEL.withFeatures);
        expect(await label.getLabelState()).toBeFalsy();
        await page.keyboard.press('2')
        await expect(label.getWeakResult()).toBeVisible();
        expect(await label.getLabelState()).toBeTruthy();
      })

      await test.step('Can remove presence', async () => {
        const label = page.annotator.getLabel(LABEL.classic);
        await label.remove();
        await expect(label.getWeakResult()).not.toBeVisible();
        expect(await label.getLabelState()).toBeFalsy();
      })

      await test.step('Can update confidence', async () => {
        const label = page.annotator.getLabel(LABEL.withFeatures);
        await label.getWeakResult().click();
        await expect(page.getByText(CONFIDENCE.sure.label, { exact: true }).nth(1)).toBeVisible()
        await expect(page.getByText(CONFIDENCE.notSure.label, { exact: true }).nth(1)).not.toBeVisible()
        const confidence = page.annotator.getConfidence(CONFIDENCE.notSure.label);
        await confidence.select()
        await expect(page.getByText(CONFIDENCE.sure.label, { exact: true }).nth(1)).not.toBeVisible()
        await expect(page.getByText(CONFIDENCE.notSure.label, { exact: true }).nth(1)).toBeVisible()
      })

      await test.step('Can add presence comment', async () => {
        await page.annotator.commentInput.fill(COMMENT.presence.comment);
        await expect(page.getByText(COMMENT.presence.comment)).toBeVisible();
      })

      await test.step('Can add task comment', async () => {
        await page.annotator.taskCommentButton.click();
        await expect(page.getByText(COMMENT.presence.comment)).not.toBeVisible();
        await page.annotator.commentInput.fill(COMMENT.task.comment);
        await expect(page.getByText(COMMENT.task.comment)).toBeVisible();
      })

      await test.step('Can switch to presence comment', async () => {
        const label = page.annotator.getLabel(LABEL.withFeatures);
        await label.getWeakResult().click();
        await expect(page.getByText(COMMENT.task.comment)).not.toBeVisible();
        await expect(page.getByText(COMMENT.presence.comment)).toBeVisible();
      })

      await test.step('Can add box', async () => {
        const label = page.annotator.getLabel(LABEL.withFeatures);
        await label.getWeakResult().click();

        const bounds = await page.annotator.draw('Box') as BoxBounds;

        await expect(label.getNthStrongResult(0)).toBeVisible();
        await expect(page.annotator.resultsBlock.getByText(Math.floor(bounds.start_time).toString()).first()).toBeVisible();
        await expect(page.annotator.resultsBlock.getByText(Math.floor(bounds.end_time).toString()).first()).toBeVisible();
        await expect(page.annotator.resultsBlock.getByText(bounds.start_frequency.toString()).first()).toBeVisible();
        await expect(page.annotator.resultsBlock.getByText(bounds.end_frequency.toString()).first()).toBeVisible();
      })

      await test.step('Can remove box', async () => {
        await page.annotator.removeStrong()
        const label = page.annotator.getLabel(LABEL.withFeatures);
        await expect(label.getNthStrongResult(0)).not.toBeVisible();
      })

      await test.step('Cannot add point', async () => {
        const label = page.annotator.getLabel(LABEL.withFeatures);
        await label.getWeakResult().click();
        await page.annotator.draw('Point');
        await expect(label.getNthStrongResult(0)).not.toBeVisible();
      })


      await test.step('Can remove presence with boxes', async () => {
        const label = page.annotator.getLabel(LABEL.withFeatures);
        await label.getWeakResult().click();

        await page.annotator.draw('Box');
        await label.remove();
        await expect(label.getWeakResult()).not.toBeVisible();
        await expect(label.getNthStrongResult(0)).not.toBeVisible();
        expect(await label.getLabelState()).toBeFalsy();
      })

      if (submit === 'mouse') {
        await test.step('Can submit - mouse', async () => {
          const [ request ] = await Promise.all([
            page.waitForRequest(`/api/annotator/campaign/${ CAMPAIGN.id }/file/${ FILE_RANGE.unsubmittedFile.id }/`),
            page.annotator.submitButton.click()
          ])
          const submittedData = request.postDataJSON();
          expect(submittedData.results).toEqual([]);
          expect(submittedData.task_comments).toEqual([ { comment: COMMENT.task.comment } ]);
        })
      } else {
        await test.step('Can submit - keyboard', async () => {
          const [ request ] = await Promise.all([
            page.waitForRequest(`/api/annotator/campaign/${ CAMPAIGN.id }/file/${ FILE_RANGE.unsubmittedFile.id }/`),
            page.keyboard.press('Enter')
          ])
          const submittedData = request.postDataJSON();
          expect(submittedData.results).toEqual([]);
          expect(submittedData.task_comments).toEqual([ { comment: COMMENT.task.comment } ]);
        })
      }
    })
  },
}

// Tests

test.describe('Annotator', () => {

  test(`Can go back to campaign`, ESSENTIAL, async ({ page }) => {
    await page.annotator.go('annotator', { phase: 'Annotation' });
    await page.annotator.backToCampaignButton.click();
    await page.waitForURL(`/app/annotation-campaign/${ CAMPAIGN.id }`)
  })

  TEST.empty('annotator', { submit: 'mouse' })
  TEST.empty('annotator', { submit: 'key' })

  test(`Empty | allow point annotation`, ESSENTIAL, async ({ page }) => {
    await page.annotator.go('annotator', { phase: 'Annotation', empty: true, allowPoint: true });

    await test.step('Can add presence - mouse', async () => {
      const label = page.annotator.getLabel(LABEL.classic);
      expect(await label.getLabelState()).toBeFalsy();
      await label.addPresence();
      await expect(label.getWeakResult()).toBeVisible();
      expect(await label.getLabelState()).toBeTruthy();
    })

    await test.step('Can add point', async () => {
      const label = page.annotator.getLabel(LABEL.classic);
      await label.getWeakResult().click();

      const bounds = await page.annotator.draw('Point');

      await expect(label.getNthStrongResult(0)).toBeVisible();
      await expect(page.annotator.resultsBlock.getByText(Math.floor(bounds.start_time).toString()).first()).toBeVisible();
      await expect(page.annotator.resultsBlock.getByText(bounds.start_frequency.toString()).first()).toBeVisible();
    })

    await test.step('Can remove point', async () => {
      await page.annotator.removeStrong()
      const label = page.annotator.getLabel(LABEL.withFeatures);
      await expect(label.getNthStrongResult(0)).not.toBeVisible();
    })

  })

  test(`No confidence`, ESSENTIAL, async ({ page }) => {
    await page.annotator.go('annotator', { phase: 'Annotation', noConfidence: true });
    await expect(page.getByText('Confidence indicator ')).not.toBeVisible();
  })
})
