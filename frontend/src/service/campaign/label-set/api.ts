import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { ID } from '@/service/type.ts';
import { LabelSet } from './type.ts';
import { skipToken } from "@reduxjs/toolkit/query";
import { CampaignAPI } from "@/service/campaign";

const _LabelSetAPI = createApi({
  reducerPath: 'labelSetApi',
  baseQuery: getAuthenticatedBaseQuery('/api/label-set/'),
  endpoints: (builder) => ({
    list: builder.query<Array<LabelSet>, void>({ query: () => '' }),
    retrieve: builder.query<LabelSet, ID>({ query: (id) => `${ id }/` }),
  })
})

const useRetrieveQuery = () => {
  const { data: campaign } = CampaignAPI.useRetrieveQuery()
  return _LabelSetAPI.useRetrieveQuery(campaign?.label_set ?? skipToken);
}

export const LabelSetAPI = {
  ..._LabelSetAPI,
  useRetrieveQuery
}
