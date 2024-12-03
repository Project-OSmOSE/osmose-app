import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareHeadersWithToken } from '@/service/auth';
import { AnnotatorData, WriteAnnotatorData } from './type.ts';
import { ID } from '@/service/type.ts';
import { AnnotationCampaign } from '@/service/campaign';

export const AnnotatorAPI = createApi({
  reducerPath: 'annotatorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/annotator/',
    prepareHeaders: prepareHeadersWithToken,
  }),
  endpoints: (builder) => ({
    retrieve: builder.query<AnnotatorData, { campaignID: ID, fileID: ID }>({
      query: ({ campaignID, fileID }) => `campaign/${ campaignID }/file/${ fileID }/`
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