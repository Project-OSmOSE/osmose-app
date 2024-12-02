import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareHeadersWithToken } from '@/service/auth/function.ts';
import { ID } from '@/service/type.ts';
import { ConfidenceIndicatorSet } from './type.ts';

export const ConfidenceSetAPI = createApi({
  reducerPath: 'confidenceSetApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/confidence-indicator/',
    prepareHeaders: prepareHeadersWithToken,
  }),
  endpoints: (builder) => ({
    list: builder.query<Array<ConfidenceIndicatorSet>, void>({ query: () => '' }),
    retrieve: builder.query<ConfidenceIndicatorSet, ID>({ query: (id) => `${ id }/` }),
  })
})

export const {
  useListQuery: useListConfidenceSetQuery,
  useRetrieveQuery: useRetrieveConfidenceSetQuery,
} = ConfidenceSetAPI;