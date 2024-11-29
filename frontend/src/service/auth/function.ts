import { AuthState, Token } from './type.ts';
import { AppState } from '@/slices/app.ts';
import { BaseQueryApi, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { PayloadAction } from '@reduxjs/toolkit';

export function prepareHeadersWithToken(headers: Headers, { getState }: Pick<BaseQueryApi, 'getState'>) {
  const token = (getState() as AppState).auth.token ?? getTokenFromCookie();
  if (token) headers.set('authorization', `Bearer ${ token }`);
  return headers;
}

export function getTokenFromCookie(): Token {
  if (!document.cookie) return undefined;
  const tokenCookie = document.cookie.split(';').filter((item) => item.trim().startsWith('token='))[0];
  return tokenCookie?.split('=').pop();
}

export function catch401(state: AuthState, { payload }: PayloadAction<FetchBaseQueryError | undefined>) {
  if (payload?.status === 401) state.token = undefined;
}

export const selectIsConnected = (state: AppState): boolean => {
  if (state.auth.token) return true;
  return !!getTokenFromCookie()
}