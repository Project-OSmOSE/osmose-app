import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { Detector } from './type.ts';

export const DetectorAPI = createApi({
  reducerPath: 'detectorApi',
  baseQuery: getAuthenticatedBaseQuery('/api/detector/'),
  endpoints: (builder) => ({
    list: builder.query<Array<Detector>, void>({ query: () => '' }),
  })
})

export const {
  useListQuery: useListDetectorQuery,
} = DetectorAPI;