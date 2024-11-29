import { createSlice } from '@reduxjs/toolkit'
import { CampaignAPI } from './api.ts';
import { CampaignState } from '@/service/campaign/type.ts';


export const CampaignSlice = createSlice({
  name: 'campaign',
  initialState: { currentCampaign: undefined } as CampaignState,
  reducers: {
    clear: (state) => {
      state.currentCampaign = undefined;
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      CampaignAPI.endpoints.retrieve.matchFulfilled,
      (state, { payload }) => {
        state.currentCampaign = payload;
      },
    )
    builder.addMatcher(
      CampaignAPI.endpoints.create.matchFulfilled,
      (state, { payload }) => {
        state.currentCampaign = payload;
      },
    )
    builder.addMatcher(
      CampaignAPI.endpoints.archive.matchFulfilled,
      (state, { payload }) => {
        state.currentCampaign = payload;
      },
    )
  },
})

export const { clear: clearCampaign } = CampaignSlice.actions
