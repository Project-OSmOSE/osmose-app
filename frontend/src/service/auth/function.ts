import { Token } from './type.ts';
import { AppState } from '@/service/app';
import { BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '@/service/auth/slice.ts';
import { UserAPI } from "@/service/user";

export function prepareHeadersWithToken(headers: Headers, { getState }: Pick<BaseQueryApi, 'getState'>) {
  const token = (getState() as AppState).auth.token ?? getTokenFromCookie();
  if (token) headers.set('Authorization', `Bearer ${ token }`);
  return headers;
}

export function getTokenFromCookie(): Token {
  if (!document.cookie) return undefined;
  const tokenCookie = document.cookie.split(';').filter((item) => item.trim().startsWith('token='))[0];
  return tokenCookie?.split('=').pop();
}

export const selectIsConnected = (state: AppState): boolean => {
  if (state.auth.token) return true;
  return !!getTokenFromCookie()
}

export function getAuthenticatedBaseQuery(baseUrl: string) {
  return async function authenticatedBaseQuery(args: string | FetchArgs, api: BaseQueryApi, extraOptions: any) {
    const result = await fetchBaseQuery({ baseUrl, prepareHeaders: prepareHeadersWithToken })(args, api, extraOptions);
    if (result.error && result.error.status === 401) {
      api.dispatch(logout());
      api.dispatch(UserAPI.util.invalidateTags([ { type: 'User', id: 'CURRENT' } ]))
    }
    return result;
  }
}