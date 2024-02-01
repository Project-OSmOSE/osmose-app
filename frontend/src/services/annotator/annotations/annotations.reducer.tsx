import { FC, ReactNode, Reducer, useReducer } from "react";
import {
  AnnotationsContext,
  AnnotationsContextDispatch,
  AnnotationsCtx,
  AnnotationsCtxAction,
  AnnotationsCtxInitialValue
} from "./annotations.context.tsx";
import { Annotation } from "../../../interface/annotation.interface.tsx";
import { AnnotationType } from "../../../enum/annotation.enum.tsx";
import { COLORS } from "../../../consts/colors.const.tsx";

const annotationsReducer: Reducer<AnnotationsCtx, AnnotationsCtxAction> = (currentContext: AnnotationsCtx, action: AnnotationsCtxAction): AnnotationsCtx => {
  let focusedResult = currentContext.focusedResult;
  let focusedComment = currentContext.focusedComment;
  let taskComment = currentContext.taskComment;
  let results = currentContext.results;

  const getUpdatedResults = (newFocus?: Annotation): Array<Annotation> => {
    if (!newFocus) return currentContext.results;
    return [...new Set([...currentContext.results.map(r => (r.id === newFocus.id && r.newId === newFocus.newId) ? newFocus : r)])]
  }

  const createTagResult = (tag: string): Annotation => {
    const currentNewIds: Array<number> = currentContext.results.map(a => a.newId)
      .filter(r => typeof r === 'number') as Array<number>;
    return currentContext.results.find(r => r.type === AnnotationType.tag && r.annotation === tag) ?? {
      newId: Math.max(...currentNewIds, 0) + 1,
      annotation: tag,
      result_comments: [],
      startTime: -1,
      endTime: -1,
      startFrequency: -1,
      endFrequency: -1,
      type: AnnotationType.tag,
      confidenceIndicator: currentContext.focusedConfidence
    }
  }

  const getNewId = (): number => {
    const currentNewIds: Array<number> = currentContext.results.map(a => a.newId)
      .filter(r => typeof r === 'number') as Array<number>;
    return Math.max(...currentNewIds, 0) + 1
  }

  const isBoxResult = (a: any): boolean => {
    return (typeof a.startTime === 'number') &&
      (typeof a.endTime === 'number') &&
      (typeof a.startFrequency === 'number') &&
      (typeof a.endFrequency === 'number');
  }

  if (action.type !== 'init') currentContext.hasChanged = true;
  switch (action.type) {
    case 'init':
      taskComment = action.task.taskComment.length > 0 ? action.task.taskComment[0] : {
        comment: '',
        annotation_task: action.task.id,
        annotation_result: null
      }
      return {
        ...currentContext,
        hasChanged: false,
        currentMode: action.task.annotationScope,
        results: action.task.prevAnnotations.map(a => {
          const isBox = isBoxResult(a);
          return {
            type: isBox ? AnnotationType.box : AnnotationType.tag,
            id: a.id,
            annotation: a.annotation,
            confidenceIndicator: a.confidenceIndicator,
            startTime: isBox ? a.startTime ?? 0 : -1,
            endTime: isBox ? a.endTime ?? 0 : -1,
            startFrequency: isBox ? a.startFrequency ?? 0 : -1,
            endFrequency: isBox ? a.endFrequency ?? 0 : -1,
            result_comments: a.result_comments
          }
        }),
        focusedResult: undefined,
        focusedComment: taskComment,
        taskComment,
        allTags: action.task.annotationTags,
        presenceTags: action.task.prevAnnotations.map(a => a.annotation),
        tagColors: new Map(action.task.annotationTags.map((t, i) => [t, COLORS[i % COLORS.length]])),
        focusedTag: undefined,
        allConfidences: action.task.confidenceIndicatorSet?.confidenceIndicators.map(c => c.label) ?? [],
        confidenceDescription: action.task.confidenceIndicatorSet?.desc,
        focusedConfidence: action.task.confidenceIndicatorSet?.confidenceIndicators.find(c => c.isDefault)?.label
          ?? action.task.confidenceIndicatorSet?.confidenceIndicators.find(c => c.label)?.label,
        wholeFileBoundaries: action.task.boundaries
      }

    case 'focusResult':
      return {
        ...currentContext,
        focusedResult: action.result,
        focusedComment: action.result.result_comments.length > 0 ? action.result.result_comments[0] : undefined,
        focusedTag: action.result.annotation,
        focusedConfidence: action.result.confidenceIndicator
      }
    case 'addResult':
      focusedResult = action.result
      focusedResult.newId = getNewId();
      return {
        ...currentContext,
        results: [...currentContext.results, focusedResult],
        focusedResult,
        focusedComment: focusedResult.result_comments.length > 0 ? focusedResult.result_comments[0] : undefined,
        presenceTags: [...new Set([...currentContext.presenceTags, focusedResult.annotation])].filter(t => !!t),
        focusedTag: focusedResult.annotation
      }
    case 'removeResult':
      results = currentContext.results.filter(r => !(r.id === action.result.id && r.newId === action.result.newId));
      if (action.result.type === AnnotationType.box) {
        focusedResult = currentContext.results.find(r => r.annotation === action.result.annotation && r.type === AnnotationType.tag)
      }
      return {
        ...currentContext,
        results,
        focusedResult,
        focusedComment: focusedResult?.result_comments && focusedResult.result_comments.length > 0 ? focusedResult?.result_comments[0] : undefined,
        presenceTags: action.result.type === AnnotationType.box ? currentContext.presenceTags : currentContext.presenceTags.filter(t => t !== action.result.annotation),
        focusedTag: focusedResult?.annotation,
        focusedConfidence: focusedResult?.confidenceIndicator
      }

    case 'focusTask':
      return {
        ...currentContext,
        focusedResult: undefined,
        focusedComment: taskComment
      }

    case 'updateFocusComment':
      if (!focusedComment) {
        // Create comment for focused annotation if needed
        focusedComment = {
          comment: action.comment,
          annotation_task: taskComment.annotation_task,
          annotation_result: currentContext.focusedResult?.id ?? null
        }
      }
      focusedComment.comment = action.comment;
      if (focusedResult) focusedResult.result_comments = [focusedComment];
      return {
        ...currentContext,
        results: getUpdatedResults(focusedResult),
        focusedResult,
        focusedComment,
        taskComment: focusedComment.annotation_result ? taskComment : focusedComment,
      }
    case 'removeFocusComment':
      if (!focusedComment) return currentContext;
      if (!focusedComment.annotation_result) {
        taskComment = { ...taskComment, comment: '' };
        focusedComment = taskComment;
      } else focusedComment = undefined;
      if (focusedResult) focusedResult.result_comments = []
      return {
        ...currentContext,
        results: getUpdatedResults(focusedResult),
        focusedResult,
        focusedComment, taskComment
      }

    case 'addPresence':
      focusedResult = createTagResult(action.tag);
      results.push(focusedResult);
      return {
        ...currentContext,
        results: [...new Set([...results])],
        focusedResult,
        presenceTags: [...new Set([...currentContext.presenceTags, action.tag])],
        focusedTag: action.tag
      };
    case 'focusTag':
      if (focusedResult && focusedResult.type === AnnotationType.box) focusedResult.annotation = action.tag
      else focusedResult = undefined
      return {
        ...currentContext,
        results: getUpdatedResults(focusedResult),
        focusedResult,
        focusedTag: action.tag
      };
    case 'removePresence':
      return {
        ...currentContext,
        results: currentContext.results.filter(r => r.annotation !== action.tag),
        focusedResult: undefined,
        focusedComment: taskComment,
        presenceTags: currentContext.presenceTags.filter(t => t !== action.tag),
        focusedTag: undefined
      };

    case 'selectConfidence':
      if (focusedResult) focusedResult.confidenceIndicator = action.confidence;
      return {
        ...currentContext,
        results: getUpdatedResults(focusedResult),
        focusedResult,
        focusedConfidence: action.confidence
      }

    default:
      return currentContext
  }
}

export const ProvideAnnotations: FC<{ children?: ReactNode }> = ({ children }) => {
  const [task, dispatch] = useReducer(annotationsReducer, AnnotationsCtxInitialValue);

  return (
    <AnnotationsContext.Provider value={ task }>
      <AnnotationsContextDispatch.Provider value={ dispatch }>
        { children }
      </AnnotationsContextDispatch.Provider>
    </AnnotationsContext.Provider>
  )
}