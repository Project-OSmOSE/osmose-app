import { createSelector, createSlice } from "@reduxjs/toolkit";
import { CampaignFilter } from "@/service/api/campaign.ts";
import { useAppSearchParams } from "@/service/ui/search.ts";
import { useEffect } from "react";
import { AppState, useAppDispatch, useAppSelector } from "@/service/app.ts";
import { UserAPI } from "@/service/api/user.ts";
import { AuthAPI } from "@/service/api/auth.ts";
import { FileFilter } from "@/service/api/annotation-file-range.ts";

type FilterState = {
  campaign: CampaignFilter;
  file: FileFilter;
}

function reset(state: FilterState) {
  state.campaign = {}
  state.file = {}
}

export const FilterSlice = createSlice({
  name: 'FilterSlice',
  initialState: {
    campaign: {},
    file: {},
  } satisfies FilterState as FilterState,
  reducers: {
    updateCampaignFilters: (state: FilterState, { payload }: { payload: CampaignFilter }) => {
      state.campaign = payload;
    },
    updateFileFilters: (state: FilterState, { payload }: { payload: FileFilter }) => {
      state.file = payload;
    },
    reset
  },
  extraReducers: builder => {
    builder.addMatcher(AuthAPI.endpoints.logout.matchFulfilled, reset)
  }
})

export const selectCampaignFilters = createSelector(
  (state: AppState) => state.filter,
  (state: FilterState) => state.campaign,
)

export const useCampaignFilters = () => {
  const { params, updateParams } = useAppSearchParams<CampaignFilter>()
  const { data: user } = UserAPI.endpoints.getCurrentUser.useQuery()
  const loadedFilters = useAppSelector(selectCampaignFilters)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!user) return;

    // Load default params
    const updatedFilters = {
      phases__file_ranges__annotator_id: user.id,
      archive__isnull: true,
      ...loadedFilters
    }
    if (updatedFilters.phases__file_ranges__annotator_id !== user.id) {
      updatedFilters.phases__file_ranges__annotator_id = user.id
    }
    if (updatedFilters.owner && updatedFilters.owner !== user.id) {
      updatedFilters.owner = user.id
    }
    updateParams(updatedFilters)
  }, [ user ]);

  useEffect(() => {
    dispatch(FilterSlice.actions.updateCampaignFilters(params))
  }, [ params ]);

  return { params, updateParams }
}

export const selectFileFilters = createSelector(
  (state: AppState) => state.filter,
  (state: FilterState) => state.file,
)

export const useFileFilters = (clearOnLoad: boolean = false) => {
  const { params, updateParams, clearParams } = useAppSearchParams<FileFilter>()
  const loadedFilters = useAppSelector(selectFileFilters)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!clearOnLoad) return;
    updateParams(loadedFilters)
  }, []);

  useEffect(() => {
    dispatch(FilterSlice.actions.updateFileFilters(params))
  }, [ params ]);

  return { params, updateParams, clearParams }
}
