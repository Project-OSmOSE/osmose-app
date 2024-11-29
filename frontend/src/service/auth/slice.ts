import { createSlice } from '@reduxjs/toolkit'
import { AuthAPI } from './api.ts';
import { catch401 } from './function.ts';
import { AuthState } from './type.ts';
import { UserAPI } from '@/service/user/api.ts';


const slice = createSlice({
  name: 'auth',
  initialState: { token: undefined, user: undefined } as AuthState,
  reducers: {
    logout: (state) => {
      state.token = undefined;
      state.user = undefined;
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      AuthAPI.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.token = payload;
      },
    )
    builder.addMatcher(
      UserAPI.endpoints.getCurrentUser.matchFulfilled,
      (state, { payload }) => {
        state.user = payload;
      }
    )

    // Handle 401: Unauthenticated
    builder.addMatcher(UserAPI.endpoints.getCurrentUser.matchRejected, catch401)
    builder.addMatcher(UserAPI.endpoints.list.matchRejected, catch401)
  },
})

export const AuthReducer = slice.reducer;
export const { logout } = slice.actions
