import { createApi } from '@reduxjs/toolkit/query/react';

import { AnnotationCampaign, OldAnnotationCampaign, Phase, WriteAnnotationCampaign } from '@/service/campaign';
import { ID } from '@/service/type';
import { downloadResponseHandler, encodeQueryParams } from '@/service/function';
import { getAuthenticatedBaseQuery } from '@/service/auth';

export const CampaignAPI = createApi({
  reducerPath: 'campaignApi',
  baseQuery: getAuthenticatedBaseQuery('/api/annotation-campaign/'),
  endpoints: (builder) => ({
    list: builder.query<Array<AnnotationCampaign>, {
      onlyArchived?: boolean;
      phase?: Phase;
      owner?: ID;
      annotator?: ID;
      search?: string;
    }>({
      query: (clientParams) => {
        const params: { [key in string]: any } = {}
        if (clientParams?.onlyArchived !== undefined) params.archive__isnull = !clientParams.onlyArchived;
        if (clientParams?.phase) params.phases__phase = clientParams.phase[0];
        if (clientParams?.owner) params.owner = clientParams.owner;
        if (clientParams?.annotator) params.phases__file_ranges__annotator_id = clientParams.annotator;
        if (clientParams?.search !== undefined) params.search = clientParams.search;
        return {
          url: `/${ encodeQueryParams(params) }`
        }
      },
    }),
    retrieve: builder.query<OldAnnotationCampaign, ID>({ query: (id) => `${ id }/`, }),
    create: builder.mutation<OldAnnotationCampaign, WriteAnnotationCampaign>({
      query: (data) => {
        if (data.deadline?.trim()) data.deadline = new Date(data.deadline).toISOString().split('T')[0];
        else data.deadline = null
        data.desc = data.desc?.trim() ? data.desc.trim() : null;
        data.instructions_url = data.instructions_url?.trim() ? data.instructions_url.trim() : null;
        return {
          url: '',
            method: 'POST',
          body: data
        }
      },
    }),
    patch: builder.mutation<OldAnnotationCampaign, Pick<WriteAnnotationCampaign, 'labels_with_acoustic_features'> & {
      id: ID
    }>({
      query: (data) => ({
        url: `${ data.id }/`,
        method: 'PATCH',
        body: {
          ...data,
          id: undefined
        }
      }),
    }),
    archive: builder.mutation<OldAnnotationCampaign, ID>({
      query: (id) => ({
        url: `${ id }/archive/`,
        method: 'POST',
      }),
    }),
    downloadReport: builder.query<undefined, OldAnnotationCampaign>({
      query: (campaign) => ({
        url: `${ campaign.id }/report/${ encodeQueryParams({
          filename: campaign.name.replaceAll(' ', '_') + '_results.csv',
        }) }`,
        responseHandler: downloadResponseHandler
      }),
    }),
    downloadStatus: builder.query<void, OldAnnotationCampaign>({
      query: (campaign) => ({
        url: `${ campaign.id }/report-status/${ encodeQueryParams({
          filename: campaign.name.replaceAll(' ', '_') + '_status.csv',
        }) }`,
        responseHandler: downloadResponseHandler
      }),
    }),
  })
})

export const {
  useListQuery: useListCampaignsQuery,
  useRetrieveQuery: useRetrieveCampaignQuery,
} = CampaignAPI;