import { useAppSelector } from '@/service/app';
import { useEffect, useRef } from "react";
import { mapCommentForWriting } from '@/service/campaign/comment';
import { AnnotatorState, usePostAnnotatorMutation, WriteAnnotatorData } from '@/service/annotator';

export const useAnnotatorSubmitService = () => {

  // Interface data
  const [ post ] = usePostAnnotatorMutation()
  const annotator = useAppSelector(state => state.annotator);
  const _annotator = useRef<AnnotatorState>(annotator)
  useEffect(() => {
    _annotator.current = annotator;
  }, [ annotator ]);

  function submit() {
    console.log('submit')
    if (!_annotator.current.campaign || !_annotator.current.file) return;
    return post({
      campaign: _annotator.current.campaign,
      fileID: _annotator.current.file.id,
      data: {
        results: (_annotator.current.results ?? []).map(r => {
          console.debug('map results', r.validations)
          return {
            ...r,
            id: r.id > -1 ? r.id : null,
            comments: r.comments.map(mapCommentForWriting),
            validations: r.validations.map(v => {
              console.debug('map validations', v)
              return {
                id: v.id > -1 ? v.id : undefined,
                annotator: undefined,
                result: undefined,
                is_valid: v.is_valid,
              }
            }),
            annotation_campaign: undefined,
            dataset_file: undefined,
            annotator: undefined,
          }
        }),
        task_comments: (_annotator.current.task_comments ?? []).map(mapCommentForWriting),
        session: {
          start: new Date(_annotator.current.sessionStart),
          end: new Date()
        }
      } satisfies WriteAnnotatorData
    }).unwrap()
  }

  return { submit }
}