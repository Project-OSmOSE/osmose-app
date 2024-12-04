import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { ID } from '@/service/type.ts';
import { ConfidenceIndicatorSet } from './type.ts';

export const ConfidenceSetAPI = createApi({
  reducerPath: 'confidenceSetApi',
  baseQuery: getAuthenticatedBaseQuery('/api/confidence-indicator/'),
  endpoints: (builder) => ({
    list: builder.query<Array<ConfidenceIndicatorSet>, void>({ query: () => '' }),
    retrieve: builder.query<ConfidenceIndicatorSet, ID>({ query: (id) => `${ id }/` }),
  })
})

export const {
  useListQuery: useListConfidenceSetQuery,
  useRetrieveQuery: useRetrieveConfidenceSetQuery,
} = ConfidenceSetAPI;