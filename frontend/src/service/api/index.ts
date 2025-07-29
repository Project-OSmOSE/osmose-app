import { BaseQueryFn, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Token } from "@/service/types";

export function getTokenFromCookie(): Token | undefined {
  const tokenCookie = document.cookie?.split(';').filter((item) => item.trim().startsWith('token='))[0];
  return tokenCookie?.split('=').pop();
}

export function prepareHeaders(headers: Headers) {
  // Set Authorization
  const token = getTokenFromCookie();
  if (token) headers.set('Authorization', `Bearer ${ token }`);

  return headers;
}

const baseQueryWithHeaders = fetchBaseQuery({
  baseUrl: '/api/',
  prepareHeaders: prepareHeaders,
})

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQueryWithHeaders(args, api, extraOptions)
  if (result.error && result.error.status === 401) {
    document.cookie = 'token=;max-age=0;path=/';
  }
  return result
}

export const API_TAGS = [
  'User',
  'UserGroup',

  'Dataset',
  'DatasetToImport',
  'AudioMetadata',
  'SpectrogramConfiguration',

  'Campaign',
  'CampaignPhase',

  'FileRange',
  'FileRangeFiles',

  'Annotator',

  'Detector',

  'SQL',

  'Collaborator',
]
export const API = createApi({
  reducerPath: 'apiRTK',
  baseQuery: baseQueryWithReauth,
  tagTypes: API_TAGS,
  endpoints: () => ({})
})


// dispatch(API.endpoints.addCampaign.initiate(data), { track: false }) // track: false is set if we aren't interested in the result of the dispatch
// API.endpoints.addCampaign.useQuery()

// Reduce → CreateSelector : on ne devrait pas récupérer l'ensemble du store à chaque fois!