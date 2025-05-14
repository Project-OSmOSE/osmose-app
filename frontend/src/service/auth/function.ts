import { Token } from "@/service/types";
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export function prepareHeadersWithToken(headers: Headers) {
  const token = getTokenFromCookie();
  if (token) headers.set('Authorization', `Bearer ${ token }`);
  return headers;
}

export function getTokenFromCookie(): Token {
  if (!document.cookie) return undefined;
  const tokenCookie = document.cookie.split(';').filter((item) => item.trim().startsWith('token='))[0];
  return tokenCookie?.split('=').pop();
}

export function getAuthenticatedBaseQuery(baseUrl: string) {
  return fetchBaseQuery({ baseUrl, prepareHeaders: prepareHeadersWithToken })
}