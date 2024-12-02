import { useAnnotatorAPI } from "@/services/api/annotation/annotator.service.tsx";
import { useAppSelector } from "@/slices/app.ts";
import { useEffect, useRef } from "react";
import {
  AnnotationComment,
  useAnnotationCommentAPI
} from "@/services/api";
import { AnnotationCampaign } from '@/service/campaign';
import { DatasetFile } from '@/service/dataset';
import { AnnotationResult } from '@/service/campaign/result';

export const useAnnotatorSubmitService = () => {

  // Interface data
  const {
    sessionStart: _sessionStart,
    campaign: _campaign,
    file: _file,
  } = useAppSelector(state => state.annotator.global);
  const {
    results: _results,
    taskComments: _taskComments
  } = useAppSelector(state => state.annotator.annotations);

  const sessionStart = useRef<number>(_sessionStart);
  useEffect(() => {
    sessionStart.current = _sessionStart
  }, [ _sessionStart ]);

  const campaign = useRef<AnnotationCampaign | undefined>(_campaign);
  useEffect(() => {
    campaign.current = _campaign
  }, [ _campaign ]);

  const file = useRef<DatasetFile | undefined>(_file);
  useEffect(() => {
    file.current = _file
  }, [ _file ]);

  const results = useRef<Array<AnnotationResult>>(_results);
  useEffect(() => {
    results.current = _results
  }, [ _results ]);

  const taskComments = useRef<Array<AnnotationComment>>(_taskComments);
  useEffect(() => {
    taskComments.current = _taskComments
  }, [ _taskComments ]);

  // Services
  const API = useAnnotatorAPI();
  const commentService = useAnnotationCommentAPI();

  function submit() {
    if (!campaign.current || !file.current) return;
    return API.post(campaign.current, file.current.id, {
      results: results.current.map(r => ({
        ...r,
        id: r.id > -1 ? r.id : null,
        comments: r.comments.map(commentService.mapForWriting),
        validations: r.validations.map(v => ({
          ...v,
          id: v.id > -1 ? v.id : null,
          annotator: undefined,
          result: undefined,
        })),
        annotation_campaign: undefined,
        dataset_file: undefined,
        annotator: undefined,
      })),
      task_comments: taskComments.current.map(commentService.mapForWriting),
      session: {
        start: new Date(sessionStart.current),
        end: new Date()
      }
    });
  }

  return { submit }
}