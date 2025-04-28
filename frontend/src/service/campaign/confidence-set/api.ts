import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { ID } from '@/service/type.ts';
import { ConfidenceIndicatorSet } from './type.ts';
import { usePageCampaign } from "@/service/routing";
import { skipToken } from "@reduxjs/toolkit/query";

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
} = ConfidenceSetAPI;

export const useRetrieveConfidenceSetQuery = () => {
  const campaign = usePageCampaign();
  return ConfidenceSetAPI.useRetrieveQuery(campaign?.label_set ?? skipToken);
}
