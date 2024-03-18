import { createSlice } from "@reduxjs/toolkit";

export type AuthSlice = {
  token: string | undefined;
}

export const authSlice = createSlice({
  name: 'Auth',
  initialState: {
    token: undefined
  } as AuthSlice,
  reducers: {
    login: (state, action: { payload: string }) => {
      state.token = action.payload;
      // Cookie is set to expire a bit before 8 hours
      document.cookie = `token=${ action.payload };max-age=28000;path=/`;
    },
    logout: (state) => {
      state.token = undefined;
      document.cookie = 'token=;max-age=0;path=/';
    }
  }
})

export const {
  login,
  logout
} = authSlice.actions;
export default authSlice.reducer;
