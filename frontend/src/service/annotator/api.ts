import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth';
import { AnnotatorData, WriteAnnotatorData } from './type.ts';
import { ID } from '@/service/type.ts';
import { AnnotationCampaign } from '@/service/campaign';
import { FileFilters } from "@/service/ui/type.ts";
import { encodeQueryParams } from "@/service/function.ts";

export const AnnotatorAPI = createApi({
  reducerPath: 'annotatorApi',
  baseQuery: getAuthenticatedBaseQuery('/api/annotator/'),
  endpoints: (builder) => ({
    retrieve: builder.query<AnnotatorData, { campaignID: ID, fileID: ID } & Partial<FileFilters>>({
      query: ({ campaignID, fileID, search, withUserAnnotations, isSubmitted }) => {
        console.log('[useAnnotator]', campaignID, withUserAnnotations)
        const params: any = { }
        if (search) params['search'] = search;
        if (withUserAnnotations !== undefined) params['with_user_annotations'] = withUserAnnotations;
        if (isSubmitted !== undefined) params['is_submitted'] = isSubmitted;
        return `campaign/${ campaignID }/file/${ fileID }/${ encodeQueryParams(params) }`;
      },
    }),
    post: builder.mutation<void, {
      campaign: AnnotationCampaign,
      fileID: ID,
      data: WriteAnnotatorData,
    }>({
      query: ({ campaign, fileID, data }) => ({
        url: `campaign/${ campaign.id }/file/${ fileID }/`,
        method: 'POST',
        body: {
          ...data,
          results: campaign.usage === 'Check' ? data.results.map(r => ({
            ...r,
            validations: r.validations.length > 0 ? r.validations : [ {
              id: null,
              is_valid: false
            } ],
          })) : data.results,
          session: {
            start: data.session.start.toISOString(),
            end: data.session.start.toISOString(),
          }
        }
      })
    })
  })
})

export const {
  useRetrieveQuery: useRetrieveAnnotatorQuery,
  usePostMutation: usePostAnnotatorMutation,
} = AnnotatorAPI;