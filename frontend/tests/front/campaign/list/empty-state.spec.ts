import { expect, test } from '../../../utils/fixture';
import { accessCreateCampaign, canAccessUserGuide } from '../../../utils/campaign/functions';

test('Show no campaigns', async ({ adminPage }) => {
  await adminPage.route(/\/api\/annotation-campaign\/?/g, async route => {
    return route.fulfill({ status: 200, json: [] })
  });
  await expect(adminPage.getByText('No campaigns')).toBeVisible();
})

test('can create campaign', async ({ baseUserPage }) => {
  await accessCreateCampaign(baseUserPage)
})

test('can access user guide', async ({ baseUserPage }) => {
  await canAccessUserGuide(baseUserPage)
})