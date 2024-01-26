import { Context, createContext, Dispatch, useContext } from "react";
import { ToastMessage } from "../../view/global-components";
import { AnnotationComment } from "../../interface/annotation-comment.interface.tsx";
import { Annotation } from "../../interface/annotation.interface.tsx";
import { AnnotationTask } from "../../interface/annotation-task.interface.tsx";

export const DEFAULT_COMMENT: AnnotationComment = {
  comment: '',
  annotation_task: 0,
  annotation_result: 0
}

export const AnnotatorCtxInit: AnnotatorCtx = {
  isLoading: true,
  areShortcutsEnabled: true,
  annotations: { array: [] },
  comments: { taskComment: DEFAULT_COMMENT },
  tags: { array: [] },
  confidences: { array: [] },
  tagColors: new Map<string, string>()
}

export interface AnnotatorCtx {
  task?: AnnotationTask;
  annotations: {
    array: Array<Annotation>;
    focus?: Annotation;
  };
  tags: {
    array: Array<string>;
    focus?: string;
  };
  confidences: {
    array: Array<string>;
    focus?: string;
  };
  comments: {
    taskComment: AnnotationComment;
    focus?: AnnotationComment;
  };
  tagColors: Map<string, string>;
  isLoading: boolean;
  areShortcutsEnabled: boolean;
  start?: number;
  error?: string;
  toast?: ToastMessage;
}

export type AnnotatorArrayCtxAction<T> =
  { type: 'updateList', array: Array<T> } |
  { type: 'add', item: T } |
  { type: 'remove', item: T } |
  { type: 'update', item: T } |
  { type: 'focus', item: T } |
  { type: 'blur' };

export type AnnotatorArrayAnnotationsCtxAction =
  AnnotatorArrayCtxAction<Annotation> |
  { type: 'changeItemID', currentID?: number, newID: number };

export type AnnotatorCtxAction = Array<
  { type: 'setTask', task?: AnnotationTask } |
  { type: 'setAnnotations', annotations?: Array<Annotation> } |
  { type: 'setTaskComment', comment: AnnotationComment } |
  { type: 'setLoading', state: boolean } |
  { type: 'setTagColors', map: Map<string, string> } |
  { type: 'setStart', start?: Date } |
  { type: 'setError', error?: string } |
  { type: 'setToast', toast?: ToastMessage } |
  { type: 'enableShortcut', state: boolean } |
  ({ scope: 'annotations' } & AnnotatorArrayAnnotationsCtxAction) |
  ({ scope: 'comments' } & AnnotatorArrayCtxAction<AnnotationComment>) |
  ({ scope: 'tags' } & AnnotatorArrayCtxAction<string>) |
  ({ scope: 'confidences' } & AnnotatorArrayCtxAction<string>) | Record<string, never>
>;

export type AnnotatorCtxActionsScope = 'annotations' | 'comments' | 'tags' | 'confidences';


export const AnnotatorContext: Context<AnnotatorCtx> = createContext<AnnotatorCtx>(AnnotatorCtxInit);
export const AnnotatorDispatchContext: Context<Dispatch<AnnotatorCtxAction> | undefined> = createContext<Dispatch<AnnotatorCtxAction> | undefined>(undefined);

export const useAnnotatorContext = () => useContext(AnnotatorContext);
export const useAnnotatorDispatch = () => useContext(AnnotatorDispatchContext);
