import { test } from '../../utils/fixture';
import {
  accessDetail,
  createCampaign,
  seeArchivedCampaigns,
  seeCampaigns,
  seeModeCampaigns,
  seeOwnedCampaigns,
  seeSearchCampaigns
} from "./list/functions";

test.describe('Admin', () => {
  test('Has annotations to do', ({ adminPage }) => seeCampaigns(adminPage, true))
  test('Can see search campaign', ({ adminPage }) => seeSearchCampaigns(adminPage, true))
  test('Can see archived campaigns', ({ adminPage }) => seeArchivedCampaigns(adminPage, true))
  test('Can see only \'Create\' campaign', ({ adminPage }) => seeModeCampaigns(adminPage, 'Create', true))
  test('Can see only \'Check\' campaign', ({ adminPage }) => seeModeCampaigns(adminPage, 'Check', true))
  test('Can see owned campaigns', ({ adminPage }) => seeOwnedCampaigns(adminPage, true))
  test('Can create campaign', ({ adminPage }) => createCampaign(adminPage, true))
  test('Can access detail', { tag: '@essential' }, ({ adminPage }) => accessDetail(adminPage));
})

test.describe('Annotators', { tag: '@essential' }, () => {
  test('Has annotations to do', ({ annotatorPage }) => seeCampaigns(annotatorPage, true))
  test('Can see search campaign', ({ annotatorPage }) => seeSearchCampaigns(annotatorPage, true))
  test('Cannot see archived campaigns', ({ annotatorPage }) => seeArchivedCampaigns(annotatorPage, false))
  test('Can see only \'Create\' campaign', ({ annotatorPage }) => seeModeCampaigns(annotatorPage, 'Create', true))
  test('Cannot see only \'Check\' campaign', ({ annotatorPage }) => seeModeCampaigns(annotatorPage, 'Check', false))
  test('Cannot see owned campaigns', ({ annotatorPage }) => seeOwnedCampaigns(annotatorPage, false))
  test('Can create campaign', ({ annotatorPage }) => createCampaign(annotatorPage, true))
  test('Can access detail', ({ annotatorPage }) => accessDetail(annotatorPage));
})

test.describe('Base user', () => {
  test('Has no annotations to do', { tag: '@essential' }, ({ baseUserPage }) => seeCampaigns(baseUserPage, false))
  test('Cannot see search campaign', ({ baseUserPage }) => seeSearchCampaigns(baseUserPage, false))
  test('Cannot see archived campaigns', ({ baseUserPage }) => seeArchivedCampaigns(baseUserPage, false))
  test('Cannot see only \'Create\' campaign', ({ baseUserPage }) => seeModeCampaigns(baseUserPage, 'Create', false))
  test('Cannot see only \'Check\' campaign', ({ baseUserPage }) => seeModeCampaigns(baseUserPage, 'Check', false))
  test('Cannot see owned campaigns', ({ baseUserPage }) => seeOwnedCampaigns(baseUserPage, false))
  test('Can create campaign', ({ baseUserPage }) => createCampaign(baseUserPage, true))
})
