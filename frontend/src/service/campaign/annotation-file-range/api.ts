import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { ID, Paginated } from '@/service/type.ts';
import { AnnotationFile, AnnotationFileRange, PostAnnotationFileRange } from './type.ts';
import { encodeQueryParams } from '@/service/function.ts';
import { FileFilters } from "@/service/ui/type.ts";
import { getQueryParamsForFilters } from "@/service/campaign/annotation-file-range/function.ts";

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
      transformResponse: (baseQueryReturnValue: Array<AnnotationFileRange>): Array<AnnotationFileRange> => {
        return baseQueryReturnValue.map(range => ({
          ...range,
          first_file_index: range.first_file_index + 1,
          last_file_index: range.last_file_index + 1
        }));
      }
    }),
    listFilesWithPagination: builder.query<Paginated<AnnotationFile> & { resume?: number }, {
      page: number,
      filters: FileFilters
    }>({
      query: ({ page, filters },) => `campaign/${ filters.campaignID }/files/${ encodeQueryParams({
        page,
        page_size: FILES_PAGE_SIZE,
        ...getQueryParamsForFilters(filters)
      }) }`,
    }),

    post: builder.mutation<Array<AnnotationFileRange>, {
      campaignID: ID,
      filesCount: number,
      data: Array<PostAnnotationFileRange>,
      force?: boolean
    }>({
      query: ({ campaignID, filesCount, data, force }) => {
        return {
          url: `campaign/${ campaignID }/`,
          method: 'POST',
          body: {
            data: data.map(range => {
              const first_file_index = !range.first_file_index ? 1 : range.first_file_index;
              const last_file_index = !range.last_file_index ? filesCount : range.last_file_index;
              return {
                id: range.id >= 0 ? range.id : undefined,
                first_file_index: first_file_index - 1,
                last_file_index: last_file_index - 1,
                annotator: range.annotator
              }
            }),
            force
          }
        }
      }
    })
  })
})

export const {
  useListFilesWithPaginationQuery,
} = AnnotationFileRangeAPI;