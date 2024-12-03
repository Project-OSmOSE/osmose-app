import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareHeadersWithToken } from '@/service/auth/function.ts';
import { ID } from '@/service/type.ts';
import { AnnotationFileRange, AnnotationFileRangeWithFiles, WriteAnnotationFileRange } from './type.ts';
import { encodeQueryParams } from '@/service/function.ts';

export const AnnotationFileRangeAPI = createApi({
  reducerPath: 'fileRangeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/annotation-file-range/',
    prepareHeaders: prepareHeadersWithToken,
  }),
  endpoints: (builder) => ({

    list: builder.query<Array<AnnotationFileRange>, {
      campaignID?: ID,
      forCurrentUser?: boolean,
    }>({
      query: ({ campaignID, forCurrentUser }) => {
        const params: any = {}
        if (campaignID) params.annotation_campaign = campaignID;
        if (forCurrentUser) params.for_current_user = true;
        return encodeQueryParams(params);
      },
    }),
    listWithFiles: builder.query<Array<AnnotationFileRangeWithFiles>, {
      campaignID?: ID,
      forCurrentUser?: boolean,
    }>({
      query: ({ campaignID, forCurrentUser }) => {
        const params: any = { with_files: true }
        if (campaignID) params.annotation_campaign = campaignID;
        if (forCurrentUser) params.for_current_user = true;
        return encodeQueryParams(params);
      },
    }),

    post: builder.mutation<Array<AnnotationFileRange>, { campaignID: ID, data: Array<WriteAnnotationFileRange> }>({
      query: ({ campaignID, data }) => ({
        url: `campaign/${ campaignID }/`,
        method: 'POST',
        body: data
      })
    })
  })
})

export const {
  useListQuery: useListAnnotationFileRangeQuery,
  useListWithFilesQuery: useListAnnotationFileRangeWithFilesQuery,
  usePostMutation: usePostAnnotationFileRangeMutation,
} = AnnotationFileRangeAPI;