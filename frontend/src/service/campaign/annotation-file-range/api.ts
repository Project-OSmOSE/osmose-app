import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { ID, Paginated } from '@/service/type.ts';
import { AnnotationFile, AnnotationFileRange, WriteAnnotationFileRange } from './type.ts';
import { encodeQueryParams } from '@/service/function.ts';
import { FileFilters } from "@/service/ui/type.ts";

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
    listFilesWithPagination: builder.query<Paginated<AnnotationFile> & { resume?: number }, {
      page: number,
    } & FileFilters>({
      query: ({ campaignID, page, ...filters }, ) => {
        const params: any = { page, page_size: FILES_PAGE_SIZE }
        if (filters.search) params['filename__icontains'] = filters.search;
        if (filters.withUserAnnotations !== undefined) params['with_user_annotations'] = filters.withUserAnnotations;
        if (filters.isSubmitted !== undefined) params['is_submitted'] = filters.isSubmitted;
        if (filters.label !== undefined) params['annotation_results__label__name'] = filters.label;
        if (filters.confidence !== undefined) params['annotation_results__confidence_indicator__label'] = filters.confidence;
        if (filters.detector !== undefined) params['annotation_results__detector_configuration__detector__name'] = filters.detector;
        if (filters.hasAcousticFeatures !== undefined) params['annotation_results__acoustic_features__isnull'] = !filters.hasAcousticFeatures;
        if (filters.minDate !== undefined) params['end__gte'] = filters.minDate;
        if (filters.maxDate !== undefined) params['start__lte'] = filters.maxDate;
        return `campaign/${ campaignID }/files/${ encodeQueryParams(params) }`;
      },
    }),

    post: builder.mutation<Array<AnnotationFileRange>, { campaignID: ID, data: Array<WriteAnnotationFileRange>, force?: boolean }>({
      query: ({ campaignID, data, force }) => ({
        url: `campaign/${ campaignID }/`,
        method: 'POST',
        body: { data, force }
      })
    })
  })
})

export const {
  useListQuery: useListAnnotationFileRangeQuery,
  useListFilesWithPaginationQuery,
  usePostMutation: usePostAnnotationFileRangeMutation,
} = AnnotationFileRangeAPI;