import { useAppSelector } from '@/service/app';
import { useEffect, useRef } from "react";
import { mapCommentForWriting } from '@/service/campaign/comment';
import { AnnotatorState, usePostAnnotatorMutation } from '@/service/annotator';

export const useAnnotatorSubmitService = () => {

  // Interface data
  const [ post ] = usePostAnnotatorMutation()
  const annotator = useAppSelector(state => state.annotator);
  const _annotator = useRef<AnnotatorState>(annotator)
  useEffect(() => {
    _annotator.current = annotator;
  }, [ annotator ]);

  function submit() {
    if (!_annotator.current.campaign || !_annotator.current.file) return;
    return post({
      campaign: _annotator.current.campaign,
      fileID: _annotator.current.file.id,
      data: {
        results: (_annotator.current.results ?? []).map(r => ({
          ...r,
          id: r.id > -1 ? r.id : undefined,
          comments: r.comments.map(mapCommentForWriting),
          validations: r.validations.map(v => ({
            ...v,
            id: v.id > -1 ? v.id : null,
            annotator: undefined,
            result: undefined,
          })),
          confidence_indicator: r.confidence_indicator ?? undefined,
          detector_configuration: r.detector_configuration ?? undefined,
        })),
        task_comments: (_annotator.current.task_comments ?? []).map(mapCommentForWriting),
        session: {
          start: new Date(_annotator.current.sessionStart),
          end: new Date()
        }
      }
    }).unwrap()
  }

  return { submit }
}