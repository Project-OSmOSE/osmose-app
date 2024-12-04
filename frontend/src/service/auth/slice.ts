import { createSlice } from '@reduxjs/toolkit'
import { AuthAPI } from './api.ts';
import { AuthState } from './type.ts';


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
  },
})

export const { logout } = AuthSlice.actions
