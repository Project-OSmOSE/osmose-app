import { createSlice } from '@reduxjs/toolkit'
import { CampaignAPI } from './api.ts';
import { CampaignState, WriteAnnotationCampaign } from './type';
import { Errors } from '@/service/type.ts';


export const CampaignSlice = createSlice({
  name: 'campaign',
  initialState: {
    currentCampaign: undefined,
    draftCampaign: {},
    submissionErrors: {},
  } as CampaignState,
  reducers: {
    clear: (state) => {
      state.currentCampaign = undefined;
      state.draftCampaign = {};
      state.submissionErrors = {};
    },
    updateDraftCampaign: (state, { payload }: { payload: Partial<WriteAnnotationCampaign> }) => {
      Object.assign(state.draftCampaign, payload);
    },
    updateSubmissionErrors: (state, { payload }: { payload: Errors<WriteAnnotationCampaign> }) => {
      for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined) state.submissionErrors[key as keyof WriteAnnotationCampaign] = value;
        else delete state.submissionErrors[key as keyof WriteAnnotationCampaign];
      }
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

export const {
  clear: clearCampaign,
  updateDraftCampaign,
  updateSubmissionErrors: updateCampaignSubmissionErrors,
} = CampaignSlice.actions
