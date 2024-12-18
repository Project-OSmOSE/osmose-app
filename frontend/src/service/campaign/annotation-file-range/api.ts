import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { ID, Paginated } from '@/service/type.ts';
import { AnnotationFile, AnnotationFileRange, WriteAnnotationFileRange } from './type.ts';
import { encodeQueryParams } from '@/service/function.ts';

export const FILES_PAGE_SIZE = 20;

export const AnnotationFileRangeAPI = createApi({
  reducerPath: 'fileRangeApi',
  baseQuery: getAuthenticatedBaseQuery('/api/annotation-file-range/'),
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
    listFilesWithPagination: builder.query<Paginated<AnnotationFile> & { resume: number }, {
      campaignID?: ID,
      page: number,
      search?: string,
    }>({
      query: ({ campaignID, page, search }) => {
        const params: any = { page, page_size: FILES_PAGE_SIZE }
        if (search) params['search'] = search;
        return `campaign/${ campaignID }/files/${ encodeQueryParams(params) }`;
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
  useListFilesWithPaginationQuery,
  usePostMutation: usePostAnnotationFileRangeMutation,
} = AnnotationFileRangeAPI;