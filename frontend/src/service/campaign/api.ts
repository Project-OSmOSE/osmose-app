import { createApi } from '@reduxjs/toolkit/query/react';

import { AnnotationCampaign, WriteAnnotationCampaign } from '@/service/campaign';
import { ID } from '@/service/type';
import { downloadResponseHandler, encodeQueryParams } from '@/service/function';
import { getAuthenticatedBaseQuery } from '@/service/auth';

export const CampaignAPI = createApi({
  reducerPath: 'campaignApi',
  baseQuery: getAuthenticatedBaseQuery('/api/annotation-campaign/'),
  endpoints: (builder) => ({
    list: builder.query<Array<AnnotationCampaign>, void>({ query: () => '', }),
    retrieve: builder.query<AnnotationCampaign, ID>({ query: (id) => `${ id }/`, }),
    create: builder.mutation<AnnotationCampaign, WriteAnnotationCampaign>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data
      }),
    }),
    archive: builder.mutation<AnnotationCampaign, ID>({
      query: (id) => ({
        url: `${ id }/archive/`,
        method: 'POST',
      }),
    }),
    downloadReport: builder.query<undefined, AnnotationCampaign>({
      query: (campaign) => ({
        url: `${ campaign.id }/report/${ encodeQueryParams({
          filename: campaign.name.replace(' ', '_') + '_results.csv',
        }) }`,
        responseHandler: downloadResponseHandler
      }),
    }),
    downloadStatus: builder.mutation<void, AnnotationCampaign>({
      query: (campaign) => ({
        url: `${ campaign.id }/report-status/${ encodeQueryParams({
          filename: campaign.name.replace(' ', '_') + '_status.csv',
        }) }`,
        responseHandler: downloadResponseHandler
      }),
    }),
  })
})

export const {
  useListQuery: useListCampaignsQuery,
  useRetrieveQuery: useRetrieveCampaignQuery,
  useCreateMutation: useCreateCampaignMutation,
  useArchiveMutation: useArchiveCampaignMutation,
  useLazyDownloadReportQuery: useDownloadCampaignReportLazyQuery,
  useDownloadStatusMutation: useDownloadCampaignStatusMutation,
} = CampaignAPI;