import { createSlice } from '@reduxjs/toolkit'
import { AuthAPI } from './api.ts';
import { catch401 } from './function.ts';
import { AuthState } from './type.ts';
import { UserAPI } from '@/service/user/api.ts';
import { CampaignAPI } from '@/service/campaign';
import { AnnotationFileRangeAPI } from '@/service/annotation-file-range';
import { DatasetAPI } from '@/service/dataset';


export const AuthSlice = createSlice({
  name: 'auth',
  initialState: { token: undefined } as AuthState,
  reducers: {
    logout: (state) => {
      state.token = undefined;
      document.cookie = 'token=;max-age=0;path=/';
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      AuthAPI.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.token = payload;
        // Cookie is set to expire a bit before 8 hours
        document.cookie = `token=${ payload };max-age=28000;path=/`;
      },
    )

    // Handle 401: Unauthenticated
    builder.addMatcher(UserAPI.endpoints.getCurrentUser.matchRejected, catch401)
    builder.addMatcher(UserAPI.endpoints.list.matchRejected, catch401)
    builder.addMatcher(CampaignAPI.endpoints.list.matchRejected, catch401)
    builder.addMatcher(CampaignAPI.endpoints.retrieve.matchRejected, catch401)
    builder.addMatcher(CampaignAPI.endpoints.create.matchRejected, catch401)
    builder.addMatcher(CampaignAPI.endpoints.archive.matchRejected, catch401)
    builder.addMatcher(CampaignAPI.endpoints.downloadReport.matchRejected, catch401)
    builder.addMatcher(CampaignAPI.endpoints.downloadStatus.matchRejected, catch401)
    builder.addMatcher(AnnotationFileRangeAPI.endpoints.list.matchRejected, catch401)
    builder.addMatcher(AnnotationFileRangeAPI.endpoints.listWithFiles.matchRejected, catch401)
    builder.addMatcher(AnnotationFileRangeAPI.endpoints.update.matchRejected, catch401)
    builder.addMatcher(DatasetAPI.endpoints.list.matchRejected, catch401)
    builder.addMatcher(DatasetAPI.endpoints.listForImport.matchRejected, catch401)
    builder.addMatcher(DatasetAPI.endpoints.import.matchRejected, catch401)
  },
})

export const { logout } = AuthSlice.actions
