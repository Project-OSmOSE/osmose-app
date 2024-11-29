import { createSlice } from '@reduxjs/toolkit'
import { AppState } from '@/slices/app.ts';
import { AuthAPI } from './api.ts';
import { catch401, getTokenFromCookie } from './function.ts';
import { AuthState } from './type.ts';
import { UserAPI } from '@/service/user/api.ts';


const slice = createSlice({
  name: 'auth',
  initialState: { token: undefined } as AuthState,
  reducers: {
    logout: (state) => {
      state.token = undefined;
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      AuthAPI.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.token = payload;
      },
    )
    builder.addMatcher(UserAPI.endpoints.getCurrentUser.matchRejected, catch401)
  },
})

export const AuthReducer = slice.reducer;
export const { logout } = slice.actions

export const selectIsConnected = (state: AppState) => {
  if (state.auth.token) return true;
  return !!getTokenFromCookie()
}