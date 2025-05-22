import { ID } from '@/service/type.ts';
import {
  AcousticFeatures,
  AnnotationCampaign,
  AnnotationCampaignPhase,
  AnnotationComment,
  AnnotationResult,
  AnnotationResultValidations,
  DetectorConfiguration,
  Phase
} from "@/service/types";
import { useParams } from "react-router-dom";
import { useAppSelector } from "@/service/app.ts";
import { useCallback, useEffect, useRef } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { FileFilter } from "@/service/api/annotation-file-range.ts";
import { useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";
import { selectFileFilters } from "@/service/slices/filter.ts";
import { extendDatasetFile } from "@/service/api/dataset.ts";
import { API } from "@/service/api/index.ts";
import { AnnotatorData, AnnotatorState } from "@/service/annotator";

type WriteAnnotationResult =
  Omit<AnnotationResult, "id" | "comments" | "validations" | "annotation_campaign_phase" | "dataset_file" | "annotator" | "confidence_indicator" | "detector_configuration" | 'type' | 'updated_to'>
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

function transformBaseResult(result: AnnotationResult, phase: Phase): Omit<WriteAnnotationResult, 'is_update_of'> {
  const validations = result.validations.map(v => ({
    is_valid: v.is_valid,
    id: v.id > -1 ? v.id : undefined,
  }))
  if (phase === 'Verification' && validations.length === 0) {
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

export const AnnotatorAPI = API.injectEndpoints({
  endpoints: builder => ({
    retrieveAnnotator: builder.query<AnnotatorData, { campaignID: ID, phaseID: ID, fileID: ID } & FileFilter>({
      query: ({
                campaignID,
                phaseID,
                fileID,
                ...params
              }) => ({
        url: `annotator/campaign/${ campaignID }/phase/${ phaseID }/file/${ fileID }/`,
        params
      }),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      providesTags: (result, error, arg) => [ {
        type: 'Annotator',
        id: `${ arg.campaignID }-${ arg.phaseID }-${ arg.fileID }`
      } ],
      transformResponse(data: AnnotatorData): AnnotatorData {
        console.log(data, extendDatasetFile(data.file))
        return {
          ...data,
          file: extendDatasetFile(data.file)
        }
      }
    }),
    postAnnotator: builder.mutation<void, {
      campaign: AnnotationCampaign,
      phase: AnnotationCampaignPhase,
      fileID: ID,
      results: AnnotationResult[],
      task_comments: AnnotationComment[],
      sessionStart: Date,
    }>({
      query: ({ campaign, phase, fileID, results, task_comments, sessionStart }) => {

        // Results
        const post_results: WriteAnnotationResult[] = []
        const updates: AnnotationResult[] = []
        for (const r of results) {
          post_results.push({
            ...transformBaseResult(r, phase.phase),
            is_update_of: null,
          })
          updates.push(...r.updated_to)
        }
        for (const update of updates) {
          post_results.push({
            ...transformBaseResult(update, phase.phase),
            is_update_of: results.find(r => r.updated_to.some(u => u.id === update.id))?.id ?? null,
            validations: []
          })
        }

        // Task comments
        const post_task_comments: WriteAnnotationComment[] = transformCommentsForWriting(task_comments)

        return {
          url: `annotator/campaign/${ campaign.id }/phase/${ phase.id }/file/${ fileID }/`,
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
        id: `${ arg.campaign.id }-${ arg.phase.id }-${ arg.fileID }`
      } ]
    })
  })
})

export const useRetrieveAnnotator = () => {
  const { campaign } = useRetrieveCurrentCampaign()
  const { phase } = useRetrieveCurrentPhase()
  const { fileID } = useParams<{ fileID: string }>();
  const filters = useAppSelector(selectFileFilters)

  return AnnotatorAPI.endpoints.retrieveAnnotator.useQuery(
    (campaign && phase && fileID) ?
      { campaignID: campaign.id, phaseID: phase.id, fileID, ...filters }
      : skipToken);
}

export const usePostAnnotator = () => {
  const { campaign } = useRetrieveCurrentCampaign()
  const { phase } = useRetrieveCurrentPhase()
  const [ _post ] = AnnotatorAPI.endpoints.postAnnotator.useMutation()
  const annotator = useAppSelector(state => state.annotator);
  const _annotator = useRef<AnnotatorState>(annotator)
  const _campaign = useRef<AnnotationCampaign | undefined>(campaign)
  const _phase = useRef<AnnotationCampaignPhase | undefined>(phase)
  useEffect(() => {
    _annotator.current = annotator;
  }, [ annotator ]);
  useEffect(() => {
    _campaign.current = campaign;
  }, [ campaign ]);
  useEffect(() => {
    _phase.current = phase;
  }, [ phase ]);

  return useCallback(() => {
    if (!_campaign.current || !_phase.current || !_annotator.current.file) return;
    return _post({
      campaign: _campaign.current,
      phase: _phase.current,
      fileID: _annotator.current.file.id,
      results: _annotator.current.results ?? [],
      task_comments: _annotator.current.task_comments ?? [],
      sessionStart: new Date(_annotator.current.sessionStart),
    }).unwrap()
  }, [ _post, _campaign.current, _phase.current, _annotator.current ])
}
