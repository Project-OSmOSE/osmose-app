import { createApi } from '@reduxjs/toolkit/query/react';
import { downloadResponseHandler, encodeQueryParams } from '@/service/function';
import { getAuthenticatedBaseQuery } from '@/service/auth';
import { ID } from "@/service/type.ts";
import { AnnotationCampaignPhase } from "@/service/campaign/phase/type.ts";
import { AnnotationCampaign, Phase } from "@/service/campaign";

export const CampaignPhaseAPI = createApi({
  reducerPath: 'campaignPhaseApi',
  baseQuery: getAuthenticatedBaseQuery('/api/annotation-campaign-phase/'),
  endpoints: (builder) => ({
    create: builder.mutation<AnnotationCampaignPhase, {
      campaign: AnnotationCampaign,
      phase: Phase,
    }>({
      query: ({ campaign, phase }) => ({
        url: '',
        method: 'POST',
        body: {
          phase,
          annotation_campaign: campaign.id
        }
      }),
    }),
    downloadReport: builder.mutation<undefined, {
      phaseID: ID;
      filename: string;
    }>({
      query: ({ phaseID, filename }) => ({
        url: `${ phaseID }/report/${ encodeQueryParams({ filename }) }`,
        responseHandler: downloadResponseHandler
      }),
    }),
    downloadStatus: builder.mutation<void, {
      phaseID: ID;
      filename: string;
    }>({
      query: ({ phaseID, filename }) => ({
        url: `${ phaseID }/report-status/${ encodeQueryParams({ filename }) }`,
        responseHandler: downloadResponseHandler
      }),
    }),
  })
})
