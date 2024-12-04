import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { ID } from '@/service/type.ts';
import { LabelSet } from './type.ts';

export const LabelSetAPI = createApi({
  reducerPath: 'labelSetApi',
  baseQuery: getAuthenticatedBaseQuery('/api/label-set/'),
  endpoints: (builder) => ({
    list: builder.query<Array<LabelSet>, void>({ query: () => '' }),
    retrieve: builder.query<LabelSet, ID>({ query: (id) => `${ id }/` }),
  })
})

export const {
  useListQuery: useListLabelSetQuery,
  useRetrieveQuery: useRetrieveLabelSetQuery,
} = LabelSetAPI;