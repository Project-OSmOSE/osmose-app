import { Page } from '@playwright/test';

export const FILE_RANGE_URL = /.*\/api\/annotation-file-range\/?\??.*$/g
export const CAMPAIGN_URL = /.*\/api\/annotation-campaign\/?\??.*$/g
export const CREATE_CAMPAIGN_URL = '*/**/api/annotation-campaign/'
export const DATASET_URL = '*/**/api/dataset'
export const LABEL_SET_URL = /api\/label-set\/?$/g
export const CONFIDENCE_SET_URL = /api\/confidence-indicator\/?$/g

export function waitFileRangeResponse(page: Page) {
  return page.waitForResponse(response => {
    return !!response.url().match(FILE_RANGE_URL) && response.status() == 200
  })
}