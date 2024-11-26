import { expect, test } from '../../../utils/fixture';

test('See no campaigns', {
  tag: '@essential'
}, async ({ baseUserPage }) => {
  await expect(baseUserPage.getByText('No campaigns')).toBeVisible();
})
