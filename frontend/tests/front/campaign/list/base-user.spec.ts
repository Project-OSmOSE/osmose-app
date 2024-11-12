import { expect, test } from '../../../utils/fixture';

test('See no campaigns', async ({ baseUserPage }) => {
  await expect(baseUserPage.getByText('No campaigns')).toBeVisible();
})
