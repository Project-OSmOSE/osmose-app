import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { Detector } from './type.ts';
import { encodeQueryParams } from "@/service/function.ts";
import { AnnotationCampaign, CampaignAPI } from "@/service/campaign";
import { skipToken } from "@reduxjs/toolkit/query";

const _DetectorAPI = createApi({
  reducerPath: 'detectorApi',
  baseQuery: getAuthenticatedBaseQuery('/api/detector/'),
  endpoints: (builder) => ({
    list: builder.query<Array<Detector>, { campaign?: AnnotationCampaign } | undefined>({
      query: (params) => {
        if (!params) return '';
        const queryParams: any = {}
        if (params.campaign) queryParams['configurations__annotation_results__annotation_campaign'] = params.campaign.id
        return encodeQueryParams(queryParams)
      }
    }),
  })
})

const useListForCampaignQuery = () => {
  const { data: campaign, currentPhase } = CampaignAPI.useRetrieveQuery()
  return _DetectorAPI.useListQuery(campaign ? { campaign } : skipToken, {
    skip: currentPhase?.phase !== 'Verification'
  })
}

const useListQuery = () => {
  return _DetectorAPI.useListQuery(undefined)
}

export const DetectorAPI = {
  ..._DetectorAPI,
  useListQuery,
  useListForCampaignQuery
}