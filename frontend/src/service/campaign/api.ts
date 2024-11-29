import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareHeadersWithToken } from '@/service/auth/function.ts';
import { AnnotationCampaign, WriteAnnotationCampaign } from '@/service/campaign/type.ts';
import { ID } from '@/service/type.ts';
import { encodeQueryParams } from '@/service/function.ts';

export const CampaignAPI = createApi({
  reducerPath: 'campaignApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/annotation-campaign/',
    prepareHeaders: prepareHeadersWithToken,
  }),
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
    downloadReport: builder.mutation<void, AnnotationCampaign>({
      query: (campaign) => ({
        url: `${ campaign.id }/report/${ encodeQueryParams({
          filename: campaign.name.replace(' ', '_') + '_results.csv',
        }) }`,
        method: 'POST',
      }),
      transformResponse: (response) => {
        console.warn('transformResponse', response)
        // TODO
      }
    }),
    downloadStatus: builder.mutation<void, AnnotationCampaign>({
      query: (campaign) => ({
        url: `${ campaign.id }/report-status/${ encodeQueryParams({
          filename: campaign.name.replace(' ', '_') + '_status.csv',
        }) }`,
        method: 'POST',
      }),
      transformResponse: (response) => {
        console.warn('transformResponse', response)
        // TODO
      }
    }),
  })
})

export const {
  useListQuery: useListCampaignsQuery,
  useRetrieveQuery: useRetrieveCampaignQuery,
  useCreateMutation: useCreateCampaignMutation,
  useArchiveMutation: useArchiveCampaignMutation,
  useDownloadReportMutation: useDownloadCampaignReportMutation,
  useDownloadStatusMutation: useDownloadCampaignStatusMutation,
} = CampaignAPI;