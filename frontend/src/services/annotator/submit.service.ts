import { useAppSelector } from '@/service/app';
import { useEffect, useRef } from "react";
import { AnnotatorState, usePostAnnotatorMutation } from '@/service/annotator';
import { useAnnotator } from "@/service/annotator/hook.ts";
import { AnnotationCampaign } from "@/service/campaign";

export const useAnnotatorSubmitService = () => {
  const {
    campaign,
  } = useAnnotator();

  // Interface data
  const [ post ] = usePostAnnotatorMutation()
  const annotator = useAppSelector(state => state.annotator);
  const _annotator = useRef<AnnotatorState>(annotator)
  const _campaign = useRef<AnnotationCampaign | undefined>(campaign)
  useEffect(() => {
    _annotator.current = annotator;
  }, [ annotator ]);
  useEffect(() => {
    _campaign.current = campaign;
  }, [ campaign ]);

  function submit() {
    if (!_campaign.current || !_annotator.current.file) return;
    return post({
      campaign: _campaign.current,
      fileID: _annotator.current.file.id,
      results: _annotator.current.results ?? [],
      task_comments: _annotator.current.task_comments ?? [],
      sessionStart: new Date(_annotator.current.sessionStart),
    }).unwrap()
  }

  return { submit }
}