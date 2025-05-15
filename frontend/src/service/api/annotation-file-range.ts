import { API } from "@/service/api/index.ts";
import { useMemo } from "react";
import { ID, Paginated, PaginationParams } from "@/service/type.ts";
import { AnnotationFile, AnnotationFileRange } from "@/service/types";
import { extendDatasetFile } from "@/service/api/dataset.ts";
import { useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";

export type FileFilter = {
  filename__icontains?: string;
  is_submitted?: boolean;
  with_user_annotations?: boolean;
  annotation_results__label__name?: string;
  annotation_results__confidence_indicator__label?: string;
  annotation_results__detector_configuration__detector__name?: string;
  annotation_results__acoustic_features__isnull?: boolean;
  end__gte?: string;
  start__lte?: string;
}

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
        return { url: `annotation-file-range/`, params };
      },
      transformResponse: (ranges: Array<AnnotationFileRange>): Array<AnnotationFileRange> => {
        return ranges.map(extendFileRange);
      },
      providesTags: [ 'FileRange' ]
    }),
    listFilesWithPagination: builder.query<PaginatedAnnotationFiles, PaginationParams & FileFilter & {
      phaseID: number,
    }>({
      query: ({ phaseID, ...params }) => ({
        url: `annotation-file-range/phase/${ phaseID }/files/`,
        params: {
          page_size: FILES_PAGE_SIZE,
          ...params
        }
      }),
      transformResponse(paginatedFiles: Omit<PaginatedAnnotationFiles, 'pageCount'>, _, arg): PaginatedAnnotationFiles {
        return {
          ...paginatedFiles,
          pageCount: Math.ceil(paginatedFiles.count / (arg.page_size ?? FILES_PAGE_SIZE)),
          results: [ ...paginatedFiles.results ].map(extendAnnotationFile)
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
