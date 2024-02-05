import { Context, createContext, Dispatch } from "react";
import { ToastMessage } from "../../view/global-components";
import { AnnotationComment } from "../../interface/annotation-comment.interface.tsx";
import { Retrieve } from "../api/annotation-task-api.service.tsx";

export const DEFAULT_COMMENT: AnnotationComment = {
  comment: '',
  annotation_task: -1,
  annotation_result: null
}

export const AnnotatorCtxInit: AnnotatorCtx = {
  areShortcutsEnabled: true,
}

export interface AnnotatorCtx {
  taskId?: number;
  campaignId?: number;
  audioURL?: string;
  instructionsURL?: string;
  prevAndNextAnnotation?: {
    prev: number;
    next: number;
  };
  audioRate?: number;
  toast?: ToastMessage;
  areShortcutsEnabled: boolean;
}

export type AnnotatorCtxAction =
  { type: 'init', task: Retrieve } |

  { type: 'setDangerToast', message: string } |
  { type: 'setSuccessToast', message: string } |
  { type: 'setPrimaryToast', message: string } |
  { type: 'removeToast', message: string } |

  { type: 'enableShortcuts' } |
  { type: 'disableShortcuts' }


export const AnnotatorContext: Context<AnnotatorCtx> = createContext<AnnotatorCtx>(AnnotatorCtxInit);
export const AnnotatorDispatchContext: Context<Dispatch<AnnotatorCtxAction> | undefined> = createContext<Dispatch<AnnotatorCtxAction> | undefined>(undefined);
