import { createSelector, createSlice } from "@reduxjs/toolkit";
import { AuthAPI } from "@/service/api/auth.ts";
import { Token } from "@/service/types";
import { AppState } from "@/service/app.ts";
import { getTokenFromCookie } from "@/service/api";

type AuthState = {
  isConnected: boolean,
  accessToken?: Token,
  refreshToken?: Token,
}

const initialToken: Token | undefined = getTokenFromCookie()

export const AuthSlice = createSlice({
  name: 'AuthSlice',
  initialState: {
    isConnected: !!initialToken,
    accessToken: initialToken,
    refreshToken: undefined,
  } satisfies AuthState as AuthState,
  reducers: {},
  extraReducers: builder => {
    builder.addMatcher(AuthAPI.endpoints.login.matchFulfilled, (state, { payload }) => {
      state.isConnected = true
      state.accessToken = payload.access
      state.refreshToken = payload.refresh
    })
    builder.addMatcher(AuthAPI.endpoints.logout.matchFulfilled, (state) => {
      state.isConnected = false
      delete state.accessToken
      delete state.refreshToken
    })
  }
})

export const selectIsConnected = createSelector(
  (state: AppState) => state.auth,
  (state: AuthState) => state.isConnected,
)
