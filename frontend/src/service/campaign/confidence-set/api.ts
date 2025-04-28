import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { ID } from '@/service/type.ts';
import { ConfidenceIndicatorSet } from './type.ts';
import { skipToken } from "@reduxjs/toolkit/query";
import { CampaignAPI } from "@/service/campaign";

const _ConfidenceSetAPI = createApi({
  reducerPath: 'confidenceSetApi',
  baseQuery: getAuthenticatedBaseQuery('/api/confidence-indicator/'),
  endpoints: (builder) => ({
    list: builder.query<Array<ConfidenceIndicatorSet>, void>({ query: () => '' }),
    retrieve: builder.query<ConfidenceIndicatorSet, ID>({ query: (id) => `${ id }/` }),
  })
})

const useRetrieveQuery = () => {
  const { data: campaign } = CampaignAPI.useRetrieveQuery()
  return _ConfidenceSetAPI.useRetrieveQuery(campaign?.confidence_indicator_set ?? skipToken);
}

export const ConfidenceSetAPI = {
  ..._ConfidenceSetAPI,
  useRetrieveQuery
}

