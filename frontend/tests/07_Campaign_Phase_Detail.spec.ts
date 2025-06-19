import { API_URL, ESSENTIAL, expect, Page, test } from './utils';
import { FILE_RANGE, USERS } from './fixtures';

// Utils

const STEP = {
  accessImportAnnotations: (page: Page) => {
    return test.step('Can import annotations', async () => {
      await expect(page.campaign.detail.importAnnotationsButton).toBeEnabled();
    })
  },
  accessDownloadCSV: async (page: Page) => {
    await test.step('Access progress downloads and update', async () => {
      const modal = await page.campaign.detail.openProgressModal();
      await expect(modal.downloadResultsButton).toBeEnabled();
      await expect(modal.downloadStatusButton).toBeEnabled();
      await modal.close()
    })
  },
  accessManageAnnotators: (page: Page) => test.step('Access manage annotators', async () => {
    await expect(page.campaign.detail.manageButton).toBeEnabled();
    const modal = await page.campaign.detail.openProgressModal();
    await modal.close()
  }),
}

// Tests

test.describe('Annotator', () => {
  test('Progress', async ({ page }) => {
    await page.campaign.detail.go('annotator');

    await test.step('Cannot manage', async () => {
      await expect(page.campaign.detail.manageButton).not.toBeVisible()
    })

    const modal = await page.campaign.detail.openProgressModal();
    await expect(modal.getByText(`${ USERS.annotator.first_name } ${ USERS.annotator.last_name }`)).toBeVisible();
    await expect(modal.getByText(USERS.creator.first_name)).not.toBeVisible();

    await test.step('Cannot download', async () => {
      await expect(modal.downloadStatusButton).not.toBeVisible()
      await expect(modal.downloadStatusButton).not.toBeVisible()
    })
  })

  test('Files', ESSENTIAL, async ({ page }) => {
    await page.campaign.detail.go('annotator');
    await test.step('See files', async () => {
      await expect(page.locator('.table-content').first()).toBeVisible();
    })
    await test.step('Can search file', async () => {
      await page.mock.fileRangesFiles()
      await Promise.all([
        page.waitForRequest(/\/api\/annotation-file-range\/phase\/.*filename__icontains/g),
        page.campaign.detail.searchFile(FILE_RANGE.submittedFile.filename)
      ])
      await page.campaign.detail.searchFile(undefined);
    })
  })

  test('Can annotate submitted file', ESSENTIAL, async ({ page }) => {
    await page.campaign.detail.go('annotator');
    await page.mock.annotator()
    const button = page.locator('.table-content.disabled ion-button')
    await button.waitFor()
    await Promise.all([
      page.waitForURL(/.*\/annotation-campaign\/-?\d+\/phase\/-?\d+\/file\/-?\d+/g),
      button.click(),
    ])
  })

  test('Can annotate unsubmitted file', ESSENTIAL, async ({ page }) => {
    await page.campaign.detail.go('annotator');
    await page.mock.annotator()
    const button = page.locator('.table-content:not(.disabled) ion-button')
    await button.waitFor()
    await Promise.all([
      page.waitForURL(/.*\/annotation-campaign\/-?\d+\/phase\/-?\d+\/file\/-?\d+/g),
      button.click(),
    ])
  })

  test('Can resume annotation', ESSENTIAL, async ({ page }) => {
    await page.campaign.detail.go('annotator');
    await page.mock.annotator()
    await Promise.all([
      page.waitForURL(/.*\/annotation-campaign\/-?\d+\/phase\/-?\d+\/file\/-?\d+/g),
      page.campaign.detail.resumeButton.click(),
    ])
  })

  test('Empty', ESSENTIAL, async ({ page }) => {
    await page.campaign.detail.go('annotator', { empty: true });

    await test.step('Progress', async () => {
      const modal = await page.campaign.detail.openProgressModal({ empty: true });
      await expect(modal.getByText('No annotators')).toBeVisible();
      await modal.close()
    })

    await test.step('Files', async () => {
      await expect(page.getByText('No files to annotate')).toBeVisible();
      await expect(page.campaign.detail.resumeButton).not.toBeEnabled();
    })
  })
})

test.describe('Campaign creator', () => {

  test('Can import annotations', async ({ page }) => {
    await page.campaign.detail.go('creator', { phase: 'Annotation' });
    await STEP.accessImportAnnotations(page)
  })

  test('Can download progress results and status', async ({ page }) => {
    await page.campaign.detail.go('creator');
    const modal = await page.campaign.detail.openProgressModal()

    await test.step('Results', () => Promise.all([
      page.waitForRequest(API_URL.phase.report),
      modal.downloadResultsButton.click(),
    ]))

    await test.step('Status', () => Promise.all([
      page.waitForRequest(API_URL.phase.reportStatus),
      modal.downloadStatusButton.click(),
    ]))
  })

  test('Can manage annotators', async ({ page }) => {
    await page.campaign.detail.go('creator');
    await Promise.all([
      page.waitForURL(/.*\/annotation-campaign\/-?\d+\/phase\/-?\d+\/edit\/?/g),
      page.campaign.detail.manageButton.click(),
    ])
  })

  test('Empty', async ({ page }) => {
    await page.campaign.detail.go('creator', { empty: true });

    await test.step('Progress', async () => {
      await expect(page.campaign.detail.manageButton).toBeVisible();
      const modal = await page.campaign.detail.openProgressModal({ empty: true });
      await expect(modal.downloadStatusButton).not.toBeVisible();
      await expect(modal.downloadStatusButton).not.toBeVisible();
      await modal.close()
    })
  })

})

test('Staff', async ({ page }) => {
  await page.campaign.detail.go('staff', { phase: 'Annotation' });

  await STEP.accessImportAnnotations(page)
  await STEP.accessDownloadCSV(page)
  await STEP.accessManageAnnotators(page)
})

test('Superuser', ESSENTIAL, async ({ page }) => {
  await page.campaign.detail.go('superuser', { phase: 'Annotation' });

  await STEP.accessImportAnnotations(page)
  await STEP.accessDownloadCSV(page)
  await STEP.accessManageAnnotators(page)
})
