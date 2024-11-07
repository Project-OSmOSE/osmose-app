import { expect, test } from '../../utils/fixture';
import { accessCampaignDetail, canAccessCampaignFileList } from "../../utils/campaign/functions";
import { ADMIN, ANNOTATOR, BASE_USER } from "../../utils/auth/data";

test.describe('Showed information', () => {
  test('can view campaign global information ', async ({ annotatorPage }) => {
    await accessCampaignDetail(annotatorPage);
    await expect(annotatorPage.getByText('Label set:Test SPM campaign')).toBeVisible();
    await expect(annotatorPage.getByText('Confidence indicator set:Confident/NotConfident')).toBeVisible();
    await expect(annotatorPage.getByText('Dataset:Test Dataset')).toBeVisible();
    await expect(annotatorPage.getByText('Deadline:02/11/2010')).toBeVisible();
    await expect(annotatorPage.getByText('Mode:create')).toBeVisible();
    await expect(annotatorPage.getByText(/^Created on [0-9/]* by admin$/g)).toBeVisible();
  })

  test('can view campaign status ', async ({ annotatorPage }) => {
    await accessCampaignDetail(annotatorPage);
    await expect(annotatorPage.getByText('admin (Expert)')).toBeVisible()
    await expect(annotatorPage.getByText(ANNOTATOR.displayName)).toBeVisible()
    await expect(annotatorPage.getByText(ADMIN.displayName)).not.toBeVisible()
    await expect(annotatorPage.getByText(BASE_USER.displayName)).not.toBeVisible()
  })

  test('can view campaign spectrogram configurations ', async ({ annotatorPage }) => {
    await accessCampaignDetail(annotatorPage);
    await expect(annotatorPage.getByText('NFFT4096')).toBeVisible();
  })

  test('can view campaign audio metadata ', async ({ annotatorPage }) => {
    await accessCampaignDetail(annotatorPage);
    await expect(annotatorPage.getByText('Sample bits16')).toBeVisible();
  })
})

test.describe('Empty state', () => {

  test('admin can archive campaign', async ({ adminPage }) => {
    await adminPage.route(/\/api\/annotation-file-range\/?/g, route => {
      return route.fulfill({ status: 200, json: [] })
    })
    await accessCampaignDetail(adminPage);
    await adminPage.route(/\/api\/annotation-campaign\/\d\/archive\/?/g, route => {
      return route.fulfill({ status: 200 });
    })
    const button = adminPage.getByRole('button', { name: 'Archive' });
    await expect(button).toBeVisible();
    await Promise.all([
      adminPage.waitForRequest(/\/api\/annotation-campaign\/\d\/archive/g),
      button.click(),
    ])
  })

  test('No annotators are shown', async ({ adminPage }) => {
    await adminPage.route(/\/api\/annotation-file-range\/?/g, route => {
      return route.fulfill({ status: 200, json: [] })
    })
    await accessCampaignDetail(adminPage);
    await expect(adminPage.getByText('No annotators')).toBeVisible();
  })

  test('admin cannot download status', async ({ adminPage }) => {
    await adminPage.route(/\/api\/annotation-file-range\/?/g, route => {
      return route.fulfill({ status: 200, json: [] })
    })
    await accessCampaignDetail(adminPage);
    const resultButton = adminPage.getByRole('button', { name: 'Results (csv)' });
    await expect(resultButton).not.toBeVisible();
    const statusButton = adminPage.getByRole('button', { name: 'Task status (csv)' });
    await expect(statusButton).not.toBeVisible();
  })

  test('No spectrogram configuration are shown', async ({ adminPage }) => {
    await adminPage.route(/\/api\/spectrogram-configuration\/?/g, route => {
      return route.fulfill({ status: 200, json: [] })
    })
    await accessCampaignDetail(adminPage);
    await expect(adminPage.getByText('No spectrogram configuration')).toBeVisible();
  })

  test('admin cannot download spectrogram configuration', async ({ adminPage }) => {
    await adminPage.route(/\/api\/spectrogram-configuration\/?/g, route => {
      return route.fulfill({ status: 200, json: [] })
    })
    await accessCampaignDetail(adminPage);
    const button = adminPage.getByRole('button', { name: 'Spectrogram configuration (csv)' });
    await expect(button).not.toBeVisible();
  })

  test('No audio metadata are shown', async ({ adminPage }) => {
    await adminPage.route(/\/api\/audio-metadata\/?/g, route => {
      return route.fulfill({ status: 200, json: [] })
    })
    await accessCampaignDetail(adminPage);
    await expect(adminPage.getByText('No metadata')).toBeVisible();
  })

  test('admin cannot download audio metadata', async ({ adminPage }) => {
    await adminPage.route(/\/api\/audio-metadata\/?/g, route => {
      return route.fulfill({ status: 200, json: [] })
    })
    await accessCampaignDetail(adminPage);
    const button = adminPage.getByRole('button', { name: 'Audio files metadata (csv)' });
    await expect(button).not.toBeVisible();
  })
})

test.describe('Admin', () => {
  test('cannot access campaign annotation file list', async ({ adminPage }) => {
    await accessCampaignDetail(adminPage);
    const button = adminPage.getByRole('button', { name: 'Annotate' });
    await expect(button).not.toBeVisible();
  })

  test('can archive campaign', async ({ adminPage }) => {
    await accessCampaignDetail(adminPage);
    await adminPage.route(/\/api\/annotation-campaign\/\d\/archive\/?/g, route => {
      return route.fulfill({ status: 200 });
    })
    const button = adminPage.getByRole('button', { name: 'Archive' });
    await expect(button).toBeVisible();
    await button.click();

    const alert = adminPage.locator('ion-alert').first()
    await expect(alert).toBeVisible();
    await Promise.all([
      adminPage.waitForRequest(/\/api\/annotation-campaign\/\d\/archive/g),
      alert.getByRole('button', { name: 'Archive' }).click(),
    ])
  })

  test('can manage annotators', async ({ adminPage }) => {
    await accessCampaignDetail(adminPage);
    const button = adminPage.getByRole('button', { name: 'Manage annotators' });
    await expect(button).toBeVisible();
    await button.click();
    await adminPage.waitForURL(/\/annotation-campaign\/\d\/edit/g);
  })

  test('can download status', async ({ adminPage }) => {
    await adminPage.route(/\/api\/annotation-campaign\/\d\/report\/?\??.*/g, route => {
      return route.fulfill({ status: 200 })
    })
    await adminPage.route(/\/api\/annotation-campaign\/\d\/report-status\/?\??.*/g, route => {
      return route.fulfill({ status: 200 })
    })
    await accessCampaignDetail(adminPage);
    const resultButton = adminPage.getByRole('button', { name: 'Results (csv)' });
    await expect(resultButton).toBeVisible();
    await Promise.all([
      adminPage.waitForRequest(/\/api\/annotation-campaign\/\d\/report/g),
      resultButton.click(),
    ])
    const statusButton = adminPage.getByRole('button', { name: 'Task status (csv)' });
    await expect(statusButton).toBeVisible();
    await Promise.all([
      adminPage.waitForRequest(/\/api\/annotation-campaign\/\d\/report-status/g),
      statusButton.click(),
    ])
  })

  test('can download spectrogram configuration', async ({ adminPage }) => {
    await adminPage.route(/\/api\/spectrogram-configuration\/export\/?\??.*/g, route => {
      return route.fulfill({ status: 200 })
    })
    await accessCampaignDetail(adminPage);
    const button = adminPage.getByRole('button', { name: 'Spectrogram configuration (csv)' });
    await expect(button).toBeVisible();
    await Promise.all([
      adminPage.waitForRequest(/\/api\/spectrogram-configuration\/export\??.*/g),
      button.click(),
    ])
  })

  test('can download audio metadata', async ({ adminPage }) => {
    await adminPage.route(/\/api\/audio-metadata\/export\/?\??.*/g, route => {
      return route.fulfill({ status: 200 })
    })
    await accessCampaignDetail(adminPage);
    const button = adminPage.getByRole('button', { name: 'Audio files metadata (csv)' });
    await expect(button).toBeVisible();
    await Promise.all([
      adminPage.waitForRequest(/\/api\/audio-metadata\/export\??.*/g),
      button.click(),
    ])
  })
})

test.describe('Annotator', () => {
  test('can access campaign annotation file list', async ({ annotatorPage }) => {
    await accessCampaignDetail(annotatorPage);
    await canAccessCampaignFileList(annotatorPage, annotatorPage)
  })

  test('cannot archive campaign', async ({ annotatorPage }) => {
    await accessCampaignDetail(annotatorPage);
    const button = annotatorPage.getByRole('button', { name: 'Archive' });
    await expect(button).not.toBeVisible();
  })

  test('cannot manage annotators', async ({ annotatorPage }) => {
    await accessCampaignDetail(annotatorPage);
    const button = annotatorPage.getByRole('button', { name: 'Manage annotators' });
    await expect(button).not.toBeVisible();
  })

  test('cannot download status', async ({ annotatorPage }) => {
    await accessCampaignDetail(annotatorPage);
    const resultButton = annotatorPage.getByRole('button', { name: 'Results (csv)' });
    await expect(resultButton).not.toBeVisible();
    const statusButton = annotatorPage.getByRole('button', { name: 'Task status (csv)' });
    await expect(statusButton).not.toBeVisible();
  })

  test('cannot download spectrogram configuration', async ({ annotatorPage }) => {
    await accessCampaignDetail(annotatorPage);
    const button = annotatorPage.getByRole('button', { name: 'Spectrogram configuration (csv)' });
    await expect(button).not.toBeVisible();
  })

  test('cannot download audio metadata', async ({ annotatorPage }) => {
    await accessCampaignDetail(annotatorPage);
    const button = annotatorPage.getByRole('button', { name: 'Audio files metadata (csv)' });
    await expect(button).not.toBeVisible();
  })
})