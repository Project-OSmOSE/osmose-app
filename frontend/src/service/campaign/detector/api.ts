import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareHeadersWithToken } from '@/service/auth/function.ts';
import { Detector } from './type.ts';

export const DetectorAPI = createApi({
  reducerPath: 'detectorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/detector/',
    prepareHeaders: prepareHeadersWithToken,
  }),
  endpoints: (builder) => ({
    list: builder.query<Array<Detector>, void>({ query: () => '' }),
  })
})

export const {
  useListQuery: useListDetectorQuery,
} = DetectorAPI;