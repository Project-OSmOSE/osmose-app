import { createContext, Dispatch } from "react";
import { Annotation } from "../../../interface/annotation.interface.tsx";
import { AnnotationComment } from "../../../interface/annotation-comment.interface.tsx";
import { DEFAULT_COMMENT } from "../annotator.context.tsx";
import { AnnotationMode } from "../../../enum/annotation.enum.tsx";
import { Boundaries, Retrieve } from "../../api/annotation-task-api.service.tsx";

export interface AnnotationsCtx {
  currentMode: AnnotationMode,
  wholeFileBoundaries: Boundaries & { duration: number },
  hasChanged: boolean;

  results: Array<Annotation>;
  focusedResult?: Annotation;

  allTags: Array<string>;
  tagColors: Map<string, string>;
  presenceTags: Array<string>;
  focusedTag?: string;

  allConfidences: Array<string>;
  confidenceDescription?: string;
  focusedConfidence?: string;

  focusedComment?: AnnotationComment;
  taskComment: AnnotationComment;
}

export const AnnotationsCtxInitialValue: AnnotationsCtx = {
  currentMode: AnnotationMode.wholeFile,
  hasChanged: false,
  wholeFileBoundaries: {
    startTime: new Date(),
    startFrequency: 0,
    endTime: new Date(),
    endFrequency: 0,
    duration: 0
  },
  results: [],
  taskComment: DEFAULT_COMMENT,
  allTags: [],
  presenceTags: [],
  allConfidences: [],
  tagColors: new Map<string, string>(),
}

export type AnnotationsCtxAction =
  { type: 'init', task: Retrieve } |
  { type: 'focusResult', result: Annotation } |
  { type: 'addResult', result: Annotation } |
  { type: 'removeResult', result: Annotation } |
  { type: 'focusTask' } |
  { type: 'updateFocusComment', comment: string } |
  { type: 'removeFocusComment' } |
  { type: 'addPresence', tag: string } |
  { type: 'focusTag', tag: string } |
  { type: 'removePresence', tag: string } |
  { type: 'selectConfidence', confidence: string };

export const AnnotationsContext = createContext<AnnotationsCtx>(AnnotationsCtxInitialValue);
export const AnnotationsContextDispatch = createContext<Dispatch<AnnotationsCtxAction> | undefined>(undefined);
