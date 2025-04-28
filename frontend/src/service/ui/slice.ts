import { createSlice } from "@reduxjs/toolkit";
import { FileFilters, UIState } from "./type.ts";
import { CampaignAPI } from "@/service/campaign";

const initialFileFiltersState: FileFilters = {
  search: undefined,
  isSubmitted: undefined,
  withUserAnnotations: undefined,
}

export const UISlice = createSlice({
  name: "ui",
  initialState: {
    campaignID: undefined,
    fileFilters: initialFileFiltersState
  } satisfies UIState as UIState,
  reducers: {
    setFileFilters: (state, { payload }: { payload: FileFilters }) => {
      state.fileFilters = payload;
    },
  },
  extraReducers:
    (builder) => {
      builder.addMatcher(
        CampaignAPI.endpoints.retrieve.matchFulfilled,
        (state, { payload }) => {
          // Reset file filters if new campaign
          if (state.campaignID !== payload.id) {
            state.fileFilters = initialFileFiltersState;
          }
          state.campaignID = payload.id;
        },
      )
    }
})

export const {
  setFileFilters,
} = UISlice.actions;