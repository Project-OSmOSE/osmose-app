import { Locator, Page } from "@playwright/test";
import { expect } from "../fixture";
import { DEFAULT_CAMPAIGN_NAME } from "./data";
import { CONFIDENCE_SET_URL, DATASET_URL, FILE_RANGE_URL, LABEL_SET_URL, waitFileRangeResponse } from '../url';
import { ConfidenceIndicatorSet } from '../../../src/services/api';
import { Dataset } from '../../../src/service/dataset';
import { LabelSet } from '../../../src/service/campaign/label-set';
import { AnnotationFileRange } from '../../../src/service/campaign/annotation-file-range';

type Mock = {
  datasets?: Array<Dataset>,
  labels?: Array<LabelSet>,
  confidences?: Array<ConfidenceIndicatorSet>,
}

async function doMock(page: Page, { datasets, labels, confidences }: Mock) {
  if (datasets) await page.route(DATASET_URL, route => route.fulfill({ json: datasets }))
  if (labels) await page.route(LABEL_SET_URL, route => route.fulfill({ json: labels }))
  if (confidences) await page.route(CONFIDENCE_SET_URL, route => route.fulfill({ json: confidences }))
}

export async function accessCreateCampaign(page: Page,
                                           mock?: Mock) {
  if (mock) await doMock(page, mock)
  const button = page.getByRole('button', { name: 'New annotation campaign' });
  await expect(button).toBeVisible();
  await Promise.all([
    page.waitForURL('**/annotation-campaign/create'),
    page.waitForRequest(DATASET_URL),
    button.click(),
  ]);
}

export async function canAccessUserGuide(page: Page) {
  const button = page.getByRole('button', { name: 'User guide' });
  await expect(button).toBeVisible();

  const newTabPromise = page.waitForEvent('popup');
  await button.click();
  const newTab = await newTabPromise;
  await newTab.waitForLoadState();
  const title = newTab.getByRole('heading', { name: 'user guide' });
  await expect(title).toBeVisible();
}

export async function canAccessCampaignDetail(page: Page, locator: Locator | Page) {
  const button = locator.getByRole('button', { name: 'Manage' });
  await expect(button).toBeVisible();
  await button.click();
  await page.waitForURL(/.*\/annotation-campaign\/\d/g);
  await expect(page.getByRole('heading', { name: DEFAULT_CAMPAIGN_NAME })).toBeVisible();
}

export async function canAccessCampaignFileList(page: Page, locator: Locator | Page) {
  const button = locator.getByRole('button', { name: 'Annotate' });
  await expect(button).toBeVisible();
  await button.click();
  await page.waitForURL(/.*\/annotation-campaign\/\d\/file/g);
  await expect(page.getByRole('heading', { name: DEFAULT_CAMPAIGN_NAME })).toBeVisible();
}

export async function accessCampaignDetail(page: Page) {
  await page.getByPlaceholder('Search campaign').locator('input').fill(DEFAULT_CAMPAIGN_NAME);
  const card = page.locator('.campaign-card').first()
  await card.waitFor()
  await Promise.all([
    canAccessCampaignDetail(page, card),
    page.waitForLoadState(),
    page.waitForResponse(/\/api\/label-set\/\d/g),
    page.waitForResponse(/\/api\/confidence-indicator\/\d/g),
    waitFileRangeResponse(page)
  ])
}

export async function accessCampaignFileList(page: Page) {
  await page.getByPlaceholder('Search campaign').locator('input').fill(DEFAULT_CAMPAIGN_NAME);
  const card = page.locator('.campaign-card').first()
  await card.waitFor()
  await Promise.all([
    canAccessCampaignFileList(page, card),
    page.waitForLoadState(),
    waitFileRangeResponse(page)
  ])
}

export async function accessCampaignEdit(page: Page, mockFileRange?: Array<AnnotationFileRange>) {
  await accessCampaignDetail(page);
  if (mockFileRange) await page.route(FILE_RANGE_URL, route => route.fulfill({
    status: 200,
    json: mockFileRange
  }), { times: 1 })
  const button = page.getByRole('button', { name: 'Manage annotators' });
  await Promise.all([
    button.click(),
    page.waitForURL(/\/annotation-campaign\/\d\/edit/g),
    page.waitForLoadState(),
    waitFileRangeResponse(page)
  ])
  await expect(page.getByPlaceholder('Search annotator').locator('input')).toBeVisible()
}