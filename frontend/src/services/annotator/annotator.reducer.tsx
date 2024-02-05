import { Reducer } from "react";
import { AnnotatorCtx, AnnotatorCtxAction } from "./annotator.context.tsx";

export const annotatorReducer: Reducer<AnnotatorCtx, AnnotatorCtxAction> = (currentContext: AnnotatorCtx, action: AnnotatorCtxAction): AnnotatorCtx => {
  let context = {...currentContext};
  switch (action.type) {
    case 'init':
      return {
        ...context,
        taskId: action.task.id,
        audioURL: action.task.audioUrl,
        instructionsURL: action.task.instructions_url,
        campaignId: action.task.campaignId,
        prevAndNextAnnotation: action.task.prevAndNextAnnotation,
        audioRate: action.task.audioRate
      }

    case 'setDangerToast':
      context = {...context, toast: {level: 'danger', messages: [ action.message ]}}
      break;
    case 'setPrimaryToast':
      context = {...context, toast: {level: 'primary', messages: [ action.message ]}}
      break;
    case 'setSuccessToast':
      context = {...context, toast: {level: 'success', messages: [ action.message ]}}
      break;
    case 'removeToast':
      context = {...context, toast: undefined}
      break;

    case 'enableShortcuts':
      context = {...context, areShortcutsEnabled: true}
      break;
    case 'disableShortcuts':
      context = {...context, areShortcutsEnabled: false}
      break;
  }
  return context;
}
