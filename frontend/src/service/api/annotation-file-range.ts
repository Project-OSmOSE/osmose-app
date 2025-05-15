import { API } from "@/service/api/index.ts";
import { useMemo } from "react";
import { ID, Paginated } from "@/service/type.ts";
import { encodeQueryParams } from "@/service/function.ts";
import { AnnotationFile, AnnotationFileRange } from "@/service/types";
import { FileFilters } from "@/service/ui/type.ts";
import { extendDatasetFile } from "@/service/api/dataset.ts";
import { useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";

export const FILES_PAGE_SIZE = 20;

export type PaginatedAnnotationFiles = Paginated<AnnotationFile> & { resume?: number }

export type PostAnnotationFileRange = Pick<AnnotationFileRange, 'id' | 'annotator'> &
  Partial<Pick<AnnotationFileRange, 'first_file_index' | 'last_file_index'>>

export function extendFileRange(range: AnnotationFileRange): AnnotationFileRange {
  return {
    ...range,
    first_file_index: range.first_file_index + 1,
    last_file_index: range.last_file_index + 1
  }
}

export function extendAnnotationFile(file: AnnotationFile): AnnotationFile {
  return {
    ...file,
    ...extendDatasetFile(file)
  }
}

export function getQueryParamsForFilters(filters: Partial<FileFilters>): any {
  const params: any = { }
  if (filters.search) params['filename__icontains'] = filters.search;
  if (filters.withUserAnnotations !== undefined) params['with_user_annotations'] = filters.withUserAnnotations;
  if (filters.isSubmitted !== undefined) params['is_submitted'] = filters.isSubmitted;
  if (filters.label !== undefined) params['annotation_results__label__name'] = filters.label;
  if (filters.confidence !== undefined) params['annotation_results__confidence_indicator__label'] = filters.confidence;
  if (filters.detector !== undefined) params['annotation_results__detector_configuration__detector__name'] = filters.detector;
  if (filters.hasAcousticFeatures !== undefined) params['annotation_results__acoustic_features__isnull'] = !filters.hasAcousticFeatures;
  if (filters.minDate !== undefined) params['end__gte'] = filters.minDate;
  if (filters.maxDate !== undefined) params['start__lte'] = filters.maxDate;
  return params;
}

export const AnnotationFileRangeAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    listFileRange: builder.query<Array<AnnotationFileRange>, {
      phaseID?: ID,
      forCurrentUser?: boolean,
    }>({
      query: ({ phaseID, forCurrentUser }) => {
        const params: any = {}
        if (phaseID) params.annotation_campaign_phase = phaseID;
        if (forCurrentUser) params.for_current_user = true;
        return `annotation-file-range/${ encodeQueryParams(params) }`;
      },
      transformResponse: (ranges: Array<AnnotationFileRange>): Array<AnnotationFileRange> => {
        return ranges.map(extendFileRange);
      },
      providesTags: [ 'FileRange' ]
    }),
    listFilesWithPagination: builder.query<PaginatedAnnotationFiles, {
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
              },) => `annotation-file-range/phase/${ phaseID }/files/${ encodeQueryParams({
        page,
        page_size,
        ...getQueryParamsForFilters(filters)
      }) }`,
      transformResponse(paginatedFiles: Omit<PaginatedAnnotationFiles, 'pageCount'>, _, arg): PaginatedAnnotationFiles {
        return {
          ...paginatedFiles,
          pageCount: Math.ceil(paginatedFiles.count / (arg.page_size ?? FILES_PAGE_SIZE)),
          results: [...paginatedFiles.results].map(extendAnnotationFile)
        }
      },
      providesTags: [ 'FileRangeFiles' ]
    }),

    postFileRange: builder.mutation<Array<AnnotationFileRange>, {
      phaseID: ID,
      filesCount: number,
      data: Array<PostAnnotationFileRange>,
      force?: boolean
    }>({
      query: ({ phaseID, filesCount, data, force }) => {
        return {
          url: `annotation-file-range/phase/${ phaseID }/`,
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
      transformResponse: (ranges: Array<AnnotationFileRange>): Array<AnnotationFileRange> => {
        return ranges.map(extendFileRange);
      },
      invalidatesTags: [ 'FileRange', 'FileRangeFiles' ]
    })
  })
})

export const useListFileRangesForCurrentPhase = () => {
  const { phase } = useRetrieveCurrentPhase()
  const {
    data,
    ...info
  } = AnnotationFileRangeAPI.endpoints.listFileRange.useQuery({ phaseID: phase!.id }, { skip: !phase })
  return useMemo(() => ({ fileRanges: data, ...info, }), [ data, info ])
}
