import { createApi } from '@reduxjs/toolkit/query/react';

import { AnnotationCampaign, OldAnnotationCampaign, Phase, WriteAnnotationCampaign } from '@/service/campaign';
import { ID } from '@/service/type';
import { downloadResponseHandler, encodeQueryParams } from '@/service/function';
import { getAuthenticatedBaseQuery } from '@/service/auth';
import { useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useMemo } from "react";

const _CampaignAPI = createApi({
  reducerPath: 'campaignApi',
  baseQuery: getAuthenticatedBaseQuery('/api/annotation-campaign/'),
  tagTypes: [ 'AnnotationCampaign' ],
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
      providesTags: campaigns => campaigns ? [ ...campaigns.map(({ id }) => ({
        type: 'AnnotationCampaign' as const,
        id
      })), 'AnnotationCampaign' ] : [ 'AnnotationCampaign' ]
    }),
    retrieve: builder.query<AnnotationCampaign, ID>({
      query: (id) => `${ id }/`,
      providesTags: (campaign, _, arg) => [ { type: 'AnnotationCampaign', id: campaign?.id ?? arg } ]
    }),
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
      invalidatesTags: [ 'AnnotationCampaign' ]
    }),
    patch: builder.mutation<AnnotationCampaign, Pick<WriteAnnotationCampaign, 'labels_with_acoustic_features'> & {
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      invalidatesTags: (result, error, arg) => [ { type: 'AnnotationCampaign', id: arg.id } ],
    }),
    archive: builder.mutation<AnnotationCampaign, ID>({
      query: (id) => ({
        url: `${ id }/archive/`,
        method: 'POST',
      }),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      invalidatesTags: (result, error, arg) => [ { type: 'AnnotationCampaign', id: arg } ],
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

const useRetrieveQuery = () => {
  const { campaignID, phaseID } = useParams<{ campaignID: string; phaseID: string }>();
  const { data, ...info } = _CampaignAPI.useRetrieveQuery(campaignID ?? skipToken)
  const currentPhase = useMemo(() => data?.phases.find(p => p.id.toString() === phaseID), [ data ]);
  return { data, ...info, currentPhase }
}

export const CampaignAPI = {
  ..._CampaignAPI,
  useRetrieveQuery
}