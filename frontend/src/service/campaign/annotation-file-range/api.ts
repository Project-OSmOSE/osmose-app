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
  tagTypes: [ 'AnnotationFileRange', 'AnnotationFileRangeFile' ],
  endpoints: (builder) => ({
    list: builder.query<Array<AnnotationFileRange>, {
      phaseID?: ID,
      forCurrentUser?: boolean,
    }>({
      query: ({ phaseID, forCurrentUser }) => {
        const params: any = {}
        if (phaseID) params.annotation_campaign_phase = phaseID;
        if (forCurrentUser) params.for_current_user = true;
        return encodeQueryParams(params);
      },
      transformResponse: (baseQueryReturnValue: Array<AnnotationFileRange>): Array<AnnotationFileRange> => {
        return baseQueryReturnValue.map(range => ({
          ...range,
          first_file_index: range.first_file_index + 1,
          last_file_index: range.last_file_index + 1
        }));
      },
      providesTags: [ 'AnnotationFileRange' ]
    }),
    listFilesWithPagination: builder.query<Paginated<AnnotationFile> & { resume?: number }, {
      page: number,
      page_size?: number,
      phaseID: number,
      filters: FileFilters
    }>({
      query: ({
                page,
                filters,
                phaseID,
                page_size = FILES_PAGE_SIZE
              },) => `phase/${ phaseID }/files/${ encodeQueryParams({
        page,
        page_size,
        ...getQueryParamsForFilters(filters)
      }) }`,
      transformResponse(baseQueryReturnValue: Omit<Paginated<AnnotationFile>, 'pageCount'> & {
        resume?: number
      }, _, arg): Paginated<AnnotationFile> & { resume?: number } {
        return {
          ...baseQueryReturnValue,
          pageCount: Math.ceil(baseQueryReturnValue.count / (arg.page_size ?? FILES_PAGE_SIZE)),
        }
      },
      providesTags: [ 'AnnotationFileRangeFile' ]
    }),

    post: builder.mutation<Array<AnnotationFileRange>, {
      phaseID: ID,
      filesCount: number,
      data: Array<PostAnnotationFileRange>,
      force?: boolean
    }>({
      query: ({ phaseID, filesCount, data, force }) => {
        return {
          url: `phase/${ phaseID }/`,
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
      },
      invalidatesTags: [ 'AnnotationFileRange', 'AnnotationFileRangeFile' ]
    })
  })
})

export const {
  useListFilesWithPaginationQuery,
} = AnnotationFileRangeAPI;