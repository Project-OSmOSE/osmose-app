import { createSlice } from "@reduxjs/toolkit";
import { Annotation, AnnotationComment, AnnotationMode, AnnotationType, DEFAULT_COMMENT } from "@/types/annotations.ts";
import { Boundaries, Retrieve } from "@/services/api/annotation-task-api.service.tsx";
import { COLORS } from "@/consts/colors.const.tsx";


export type AnnotationsSlice = {
  currentMode: AnnotationMode,
  wholeFileBoundaries: Boundaries & { duration: number },
  hasChanged: boolean;

  results: Array<Annotation>;
  focusedResult?: Annotation;

  allLabels: Array<string>;
  labelColors: { [key: string]: string };
  presenceLabels: Array<string>;
  focusedLabel?: string;

  allConfidences: Array<string>;
  confidenceDescription?: string;
  focusedConfidence?: string;

  focusedComment?: AnnotationComment;
  taskComment: AnnotationComment;
}

function isBoxResult(a: any): boolean {
  return (typeof a.startTime === 'number') &&
    (typeof a.endTime === 'number') &&
    (typeof a.startFrequency === 'number') &&
    (typeof a.endFrequency === 'number');
}

function getNewId(state: AnnotationsSlice): number {
  const currentNewIds: Array<number> = state.results.map(a => a.newId)
    .filter(r => typeof r === 'number') as Array<number>;
  return Math.max(...currentNewIds, 0) + 1
}

function getUpdatedResults(state: AnnotationsSlice, newFocus?: Annotation): Array<Annotation> {
  if (!newFocus) return state.results;
  return [...new Set([...state.results.map(r => (r.id === newFocus.id && r.newId === newFocus.newId) ? newFocus : r)])]
}

function createLabelResult(state: AnnotationsSlice, label: string): Annotation {
  const currentNewIds: Array<number> = state.results.map(a => a.newId)
    .filter(r => typeof r === 'number') as Array<number>;
  return state.results.find(r => r.type === AnnotationType.tag && r.label === label) ?? {
    newId: Math.max(...currentNewIds, 0) + 1,
    label: label,
    result_comments: [],
    startTime: -1,
    endTime: -1,
    startFrequency: -1,
    endFrequency: -1,
    type: AnnotationType.tag,
    confidenceIndicator: state.focusedConfidence,
    validation: null
  }
}


export const annotationsSlice = createSlice({
  name: 'Annotations',
  initialState: {
    currentMode: AnnotationMode.wholeFile,
    hasChanged: false,
    wholeFileBoundaries: {
      startTime: '',
      startFrequency: 0,
      endTime: '',
      endFrequency: 0,
      duration: 0
    },
    results: [],
    taskComment: DEFAULT_COMMENT,
    allLabels: [],
    presenceLabels: [],
    allConfidences: [],
    labelColors: {},
  } as AnnotationsSlice,
  reducers: {
    initAnnotations: (state, action: { payload: Retrieve }) => {
      const taskComment = action.payload.taskComment.length > 0 ? action.payload.taskComment[0] : {
        comment: '',
        annotation_task: action.payload.id,
        annotation_result: null
      }
      const labelColors = {};
      for (const label of action.payload.labels) {
        Object.assign(labelColors, {[label]: COLORS[action.payload.labels.indexOf(label) % COLORS.length]})
      }
      Object.assign(state, {
        hasChanged: false,
        currentMode: action.payload.annotationScope,
        results: action.payload.prevAnnotations.map(a => {
          const isBox = isBoxResult(a);
          return {
            ...a,
            type: isBox ? AnnotationType.box : AnnotationType.tag,
            startTime: isBox ? a.startTime ?? 0 : -1,
            endTime: isBox ? a.endTime ?? 0 : -1,
            startFrequency: isBox ? a.startFrequency ?? 0 : -1,
            endFrequency: isBox ? a.endFrequency ?? 0 : -1,
            validation: action.payload.mode === 'Create' ? null : (a.validation === null ? true : !!a.validation)
          }
        }),
        focusedResult: undefined,
        focusedComment: taskComment,
        taskComment,
        allLabels: action.payload.labels,
        presenceLabels: action.payload.prevAnnotations.map(a => a.label),
        labelColors,
        focusedLabel: undefined,
        allConfidences: action.payload.confidenceIndicatorSet?.confidence_indicators.map(c => c.label) ?? [],
        confidenceDescription: action.payload.confidenceIndicatorSet?.desc,
        focusedConfidence: action.payload.confidenceIndicatorSet?.confidence_indicators.find(c => c.isDefault)?.label
          ?? action.payload.confidenceIndicatorSet?.confidence_indicators.find(c => c.label)?.label,
        wholeFileBoundaries: action.payload.boundaries
      });
    },

    focusResult: (state, action: { payload: Annotation }) => {
      Object.assign(state, {
        focusedResult: action.payload,
        focusedComment: action.payload.result_comments.length > 0 ? action.payload.result_comments[0] : undefined,
        focusedLabel: action.payload.label,
        focusedConfidence: action.payload.confidenceIndicator
      });
    },
    addResult: (state, action: { payload: Annotation }) => {
      const focusedResult = action.payload
      focusedResult.newId = getNewId(state);
      Object.assign(state, {
        results: [...state.results, focusedResult],
        focusedResult,
        focusedComment: focusedResult.result_comments.length > 0 ? focusedResult.result_comments[0] : undefined,
        presenceLabels: [...new Set([...state.presenceLabels, focusedResult.label])].filter(t => !!t),
        focusedLabel: focusedResult.label
      });
    },
    removeResult: (state, action: { payload: Annotation }) => {
      const results = state.results.filter(r => !(r.id === action.payload.id && r.newId === action.payload.newId));
      let focusedResult = state.focusedResult;
      if (action.payload.type === AnnotationType.box) {
        focusedResult = state.results.find(r => r.label === action.payload.label && r.type === AnnotationType.tag)
      }
      Object.assign(state, {
        results,
        focusedResult,
        focusedComment: focusedResult?.result_comments && focusedResult.result_comments.length > 0 ? focusedResult?.result_comments[0] : undefined,
        presenceLabels: action.payload.type === AnnotationType.box ? state.presenceLabels : state.presenceLabels.filter(t => t !== action.payload.label),
        focusedLabel: focusedResult?.label,
        focusedConfidence: focusedResult?.confidenceIndicator
      });
    },

    focusTask: (state) => {
      Object.assign(state, {
        focusedResult: undefined,
        focusedComment: state.taskComment
      });
    },
    updateFocusComment: (state, action: { payload: string }) => {
      const focusedComment = state.focusedComment ?? {
        comment: action.payload,
        annotation_task: state.taskComment.annotation_task,
        annotation_result: state.focusedResult?.id ?? null
      };
      focusedComment.comment = action.payload;
      const focusedResult = state.focusedResult;
      if (focusedResult) focusedResult.result_comments = [focusedComment];
      Object.assign(state, {
        results: getUpdatedResults(state, focusedResult),
        focusedResult,
        focusedComment,
        taskComment: focusedComment.annotation_result ? state.taskComment : focusedComment,
      });
    },
    removeFocusComment: (state) => {
      let focusedComment = state.focusedComment;
      if (!focusedComment) return;
      let taskComment = state.taskComment;
      if (!focusedComment.annotation_result) {
        taskComment = { ...taskComment, comment: '' };
        focusedComment = taskComment;
      } else focusedComment = undefined;
      const focusedResult = state.focusedResult;
      if (focusedResult) focusedResult.result_comments = []
      Object.assign(state, {
        results: getUpdatedResults(state, focusedResult),
        focusedResult,
        focusedComment,
        taskComment
      });
    },

    addPresence: (state, action: { payload: string }) => {
      const focusedResult = createLabelResult(state, action.payload);
      const results = state.results;
      results.push(focusedResult);
      Object.assign(state, {
        results: [...new Set([...results])],
        focusedResult,
        focusedComment: focusedResult.result_comments.length > 0 ? focusedResult.result_comments[0] : undefined,
        presenceLabels: [...new Set([...state.presenceLabels, action.payload])],
        focusedLabel: action.payload
      });
    },
    focusLabel: (state, action: { payload: string }) => {
      let focusedResult = state.focusedResult;
      if (focusedResult && focusedResult.type === AnnotationType.box) focusedResult.label = action.payload
      else focusedResult = undefined
      Object.assign(state, {
        results: getUpdatedResults(state, focusedResult),
        focusedResult,
        focusedLabel: action.payload
      });
    },
    removePresence: (state, action: { payload: string }) => {
      Object.assign(state, {
        results: state.results.filter(r => r.label !== action.payload),
        focusedResult: undefined,
        focusedComment: state.taskComment,
        presenceLabels: state.presenceLabels.filter(t => t !== action.payload),
        focusedLabel: undefined
      });
    },

    validateResult: (state, action: { payload: Annotation }) => {
      const focusedResult = state.results.find(r => r.id === action.payload.id && r.newId === action.payload.newId);
      focusedResult!.validation = true;
      let results = getUpdatedResults(state, focusedResult);
      if (focusedResult?.type === AnnotationType.box) {
        results = results.map(r => {
          if (r.type === AnnotationType.box) return r;
          if (r.label !== focusedResult?.label) return r;
          return {
            ...r,
            validation: true
          }
        })
      }
      Object.assign(state, {results, focusedResult});
    },
    invalidateResult: (state, action: { payload: Annotation }) => {
      const focusedResult = state.results.find(r => r.id === action.payload.id && r.newId === action.payload.newId);
      focusedResult!.validation = false;
      let results = getUpdatedResults(state, focusedResult);
      if (focusedResult?.type === AnnotationType.tag) {
        results = results.map(r => {
          if (r.type === AnnotationType.tag) return r;
          if (r.label !== focusedResult?.label) return r;
          return {
            ...r,
            validation: false
          }
        })
      }
      Object.assign(state, {results, focusedResult});
    },

    selectConfidence: (state, action: {payload: string}) => {
      const focusedResult = state.focusedResult
      if (focusedResult) focusedResult.confidenceIndicator = action.payload;
      Object.assign(state, {
        results: getUpdatedResults(state, focusedResult),
        focusedResult,
        focusedConfidence: action.payload
      });
    },
  }
})

export const {
  initAnnotations,
  focusResult,
  addResult,
  removeResult,
  focusTask,
  updateFocusComment,
  removeFocusComment,
  addPresence,
  focusLabel,
  removePresence,
  validateResult,
  invalidateResult,
  selectConfidence,
} = annotationsSlice.actions;

export default annotationsSlice.reducer;
