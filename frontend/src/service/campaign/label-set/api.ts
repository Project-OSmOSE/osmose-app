import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareHeadersWithToken } from '@/service/auth/function.ts';
import { ID } from '@/service/type.ts';
import { LabelSet } from './type.ts';

export const LabelSetAPI = createApi({
  reducerPath: 'labelSetApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/label-set/',
    prepareHeaders: prepareHeadersWithToken,
  }),
  endpoints: (builder) => ({
    list: builder.query<Array<LabelSet>, void>({ query: () => '' }),
    retrieve: builder.query<LabelSet, ID>({ query: (id) => `${ id }/` }),
  })
})

export const {
  useListQuery: useListLabelSetQuery,
  useRetrieveQuery: useRetrieveLabelSetQuery,
} = LabelSetAPI;