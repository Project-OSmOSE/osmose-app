import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth';
import { AnnotatorData, RetrieveParams } from './type.ts';
import { ID } from '@/service/type.ts';
import { AnnotationCampaignUsage, OldAnnotationCampaign } from '@/service/campaign';
import { encodeQueryParams } from "@/service/function.ts";
import { getQueryParamsForFilters } from "@/service/campaign/annotation-file-range/function.ts";
import { AcousticFeatures, AnnotationResult, AnnotationResultValidations } from "@/service/campaign/result";
import { DetectorConfiguration } from "@/service/campaign/detector";
import { AnnotationComment } from "@/service/campaign/comment";

type WriteAnnotationResult =
  Omit<AnnotationResult, "id" | "comments" | "validations" | "annotation_campaign" | "dataset_file" | "annotator" | "confidence_indicator" | "detector_configuration" | 'type' | 'updated_to'>
  & {
  id?: number;
  confidence_indicator: string | undefined;
  detector_configuration: DetectorConfiguration & { detector: string } | undefined;
  comments: Array<WriteAnnotationComment>;
  validations: Array<Omit<AnnotationResultValidations, "id" | "annotator" | "result"> & { id?: number }>;
  acoustic_features: AcousticFeatures | null;
  is_update_of: number | null; // id of updated result
};

type WriteAnnotationComment =
  Omit<AnnotationComment, "id" | "annotation_result" | "annotation_campaign" | "author" | "dataset_file">
  & { id?: number; }

function transformCommentsForWriting(comments: AnnotationComment[]): WriteAnnotationComment[] {
  return comments.filter(c => c.comment.trim().length > 0).map(c => ({
    id: c.id > -1 ? c.id : undefined,
    comment: c.comment.trim()
  }))
}

function transformBaseResult(result: AnnotationResult, usage: AnnotationCampaignUsage): Omit<WriteAnnotationResult, 'is_update_of'> {
  const validations = result.validations.map(v => ({
    is_valid: v.is_valid,
    id: v.id > -1 ? v.id : undefined,
  }))
  if (usage === 'Check' && validations.length === 0) {
    validations.push({ id: undefined, is_valid: true })
  }
  return {
    id: result.id > -1 ? result.id : undefined,
    comments: transformCommentsForWriting(result.comments),
    validations,
    confidence_indicator: result.confidence_indicator ?? undefined,
    detector_configuration: result.detector_configuration ?? undefined,
    label: result.label,
    start_time: result.start_time,
    end_time: result.end_time,
    start_frequency: result.start_frequency,
    end_frequency: result.end_frequency,
    acoustic_features: result.acoustic_features,
  }
}

export const AnnotatorAPI = createApi({
  reducerPath: 'annotatorApi',
  baseQuery: getAuthenticatedBaseQuery('/api/annotator/'),
  tagTypes: [ 'Annotator' ],
  endpoints: (builder) => ({
    retrieve: builder.query<AnnotatorData, RetrieveParams>({
      query: ({
                campaignID,
                phaseID,
                fileID,
                filters
              }) => `campaign/${ campaignID }/phase/${ phaseID }/file/${ fileID }/${ encodeQueryParams(getQueryParamsForFilters(filters)) }`,
      transformResponse(baseQueryReturnValue: AnnotatorData,): AnnotatorData {
        return {
          ...baseQueryReturnValue,
          spectrogram_configurations: baseQueryReturnValue.spectrogram_configurations.map(s => ({
            ...s, zoom_level: s.zoom_level + 1
          }))
        }
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      providesTags: (result, error, arg) => [ {
        type: 'Annotator',
        id: `${ arg.campaignID }-${ arg.phaseID }-${ arg.fileID }`
      } ]
    }),
    post: builder.mutation<void, {
      campaign: OldAnnotationCampaign,
      phaseID: ID,
      fileID: ID,
      results: AnnotationResult[],
      task_comments: AnnotationComment[],
      sessionStart: Date,
    }>({
      query: ({ campaign, fileID, results, task_comments, sessionStart }) => {

        // Results
        const post_results: WriteAnnotationResult[] = []
        const updates: AnnotationResult[] = []
        for (const r of results) {
          post_results.push({
            ...transformBaseResult(r, campaign.usage),
            is_update_of: null,
          })
          updates.push(...r.updated_to)
        }
        for (const update of updates) {
          post_results.push({
            ...transformBaseResult(update, campaign.usage),
            is_update_of: results.find(r => r.updated_to.some(u => u.id === update.id))?.id ?? null,
            validations: []
          })
        }

        // Task comments
        const post_task_comments: WriteAnnotationComment[] = transformCommentsForWriting(task_comments)

        return {
          url: `campaign/${ campaign.id }/file/${ fileID }/`,
          method: 'POST',
          body: {
            results: post_results,
            task_comments: post_task_comments,
            session: {
              start: sessionStart.toISOString(),
              end: (new Date()).toISOString(),
            }
          }
        }
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      invalidatesTags: (result, error, arg) => [ {
        type: 'Annotator',
        id: `${ arg.campaign.id }-${ arg.phaseID }-${ arg.fileID }`
      } ]
    })
  })
})

export const {
  useRetrieveQuery: useRetrieveAnnotatorQuery,
  usePostMutation: usePostAnnotatorMutation,
} = AnnotatorAPI;