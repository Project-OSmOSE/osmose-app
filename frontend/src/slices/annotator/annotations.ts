import { createSlice } from "@reduxjs/toolkit";
import { COLORS } from "@/consts/colors.const.tsx";
import {
  AnnotationComment,
  AnnotationResult,
  AnnotationResultBounds,
  ConfidenceIndicatorSet,
} from "@/services/api";
import { getResultType } from "@/services/utils/annotator.ts";
import { DEFAULT_PRESENCE_RESULT } from "@/services/api/annotation/result.service.tsx";
import { LabelSet } from '@/service/campaign/label-set';


export type AnnotationsSlice = {
  hasChanged: boolean;

  results: Array<AnnotationResult>;
  focusedResult?: AnnotationResult;

  labelSet?: LabelSet;
  labelColors: { [key: string]: string };
  presenceLabels: Array<string>;
  focusedLabel?: string;

  confidenceSet?: ConfidenceIndicatorSet | null;
  focusedConfidence?: string;

  focusedComment?: AnnotationComment;
  taskComments: Array<AnnotationComment>;
}

function getUpdatedResults(state: AnnotationsSlice, newFocus?: AnnotationResult): Array<AnnotationResult> {
  if (!newFocus) return state.results;
  return [ ...new Set([ ...state.results.map(r => (r.id === newFocus.id) ? newFocus : r) ]) ]
}

function focusResult(state: any, action: { payload: AnnotationResult }) {
  state.focusedResult = action.payload;
  state.results = getUpdatedResults(state, state.focusedResult);
  state.focusedComment = action.payload.comments.length > 0 ? action.payload.comments[0] : undefined;
  state.focusedLabel = action.payload.label;
  state.focusedConfidence = action.payload.confidence_indicator ?? undefined;
}

function focusTask(state: any) {
  state.focusedResult = undefined;
  state.focusedLabel = undefined;
  state.focusedComment = state.taskComments.length > 0 ? state.taskComments[0] : undefined;
  state.focusedConfidence = getDefaultConfidence(state);
}

function getDefaultConfidence(state: AnnotationsSlice): string | undefined {
  return state.confidenceSet?.confidence_indicators.find(i => i.isDefault)?.label;
}

// TODO: Test hasChanged -> true
export const annotationsSlice = createSlice({
  name: 'Annotations',
  initialState: {
    hasChanged: false,
    results: [],
    taskComments: [],
    presenceLabels: [],
    labelColors: {},
  } as AnnotationsSlice,
  reducers: {
    init: (state, action: {
      payload: {
        results: Array<AnnotationResult>;
        label_set: LabelSet;
        confidence_set: ConfidenceIndicatorSet | null;
        task_comments: Array<AnnotationComment>;
      }
    }) => {
      state.results = action.payload.results;
      state.focusedResult = undefined;
      state.hasChanged = false;
      state.taskComments = action.payload.task_comments;
      state.focusedComment = action.payload.task_comments.length > 0 ? action.payload.task_comments[0] : undefined;

      state.labelSet = action.payload.label_set;
      const labelColors = {};
      for (const label of action.payload.label_set.labels) {
        Object.assign(labelColors, { [label]: COLORS[action.payload.label_set.labels.indexOf(label) % COLORS.length] })
      }
      state.labelColors = labelColors;
      state.presenceLabels = [ ...new Set(action.payload.results.map(a => a.label)) ];
      state.focusedLabel = undefined;

      state.confidenceSet = action.payload.confidence_set;
      state.focusedConfidence = getDefaultConfidence(state)
      if (!state.focusedConfidence) state.focusedConfidence = action.payload.confidence_set?.confidence_indicators.find(i => i.label)?.label;
    },

    focusResult,
    addResult: (state, action: { payload: AnnotationResultBounds }) => {
      state.focusedResult = {
        ...action.payload,
        id: Math.min(0, ...state.results.map(r => r.id)) - 1,
        annotator: -1,
        annotation_campaign: -1,
        dataset_file: -1,
        detector_configuration: null,
        comments: [],
        validations: [],
        confidence_indicator: state.focusedConfidence ?? null,
        label: state.focusedLabel ?? state.presenceLabels[0]
      }
      state.results = [ ...state.results, state.focusedResult ];
      state.focusedComment = undefined;
    },
    removeResult: (state, action: { payload: AnnotationResult }) => {
      const results = state.results;
      const presenceResult = results.find(r => r.label === action.payload.label && getResultType(r) === 'presence');
      switch (getResultType(action.payload)) {
        case 'box':
        case 'point':
          state.results = results.filter(r => r.id !== action.payload.id);
          if (!presenceResult) return;
          focusResult(state, { payload: presenceResult })
          break;
        case 'presence':
          state.results = results.filter(r => r.label !== action.payload.label);
          state.focusedResult = undefined;
          state.focusedComment = state.taskComments.length > 0 ? state.taskComments[0] : undefined;
          state.presenceLabels = state.presenceLabels.filter(l => l !== action.payload.label);
          state.focusedLabel = undefined;
          break;
      }
    },

    focusTask,
    updateFocusComment: (state, action: { payload: string }) => {
      const focusedResult = state.focusedResult;
      const focusedComment: AnnotationComment = state.focusedComment ?? {
        comment: action.payload,
        annotation_result: focusedResult?.id ?? null,
        annotation_campaign: -1,
        dataset_file: -1,
        id: -1,
        author: -1
      };
      focusedComment.comment = action.payload;
      if (focusedResult) focusedResult.comments = [ focusedComment ];
      state.focusedComment = focusedComment;
      state.focusedResult = focusedResult;
      state.results = getUpdatedResults(state, focusedResult);
      state.taskComments = focusedComment.annotation_result ? state.taskComments : [ focusedComment ];
    },
    removeFocusComment: (state) => {
      const focusedComment = state.focusedComment;
      if (!focusedComment) return;

      if (focusedComment.annotation_result === null) {
        state.focusedResult = undefined;
        state.taskComments = []
        state.focusedComment = undefined;
      } else {
        state.focusedResult = {
          ...state.focusedResult!,
          comments: []
        }
        state.results = getUpdatedResults(state, state.focusedResult);
        state.focusedComment = undefined;
      }
    },

    addPresence: (state, action: { payload: string }) => {
      state.focusedResult = {
        ...DEFAULT_PRESENCE_RESULT,
        id: Math.min(0, ...state.results.map(r => r.id)) - 1,
        label: action.payload,
        confidence_indicator: state.focusedConfidence ?? null,
      }
      state.focusedLabel = action.payload;
      state.presenceLabels = [ ...new Set([ ...state.presenceLabels, action.payload ]) ];
      state.results = [ ...state.results, state.focusedResult ];
      state.focusedComment = undefined;
    },
    focusLabel: (state, action: { payload: string }) => {
      state.focusedLabel = action.payload;
      const result = state.focusedResult;
      if (!result) return;
      const type = getResultType(result);
      if (type === 'presence') {
        focusTask(state);
        state.focusedLabel = action.payload;
      } else {
        state.focusedResult = { ...result, label: action.payload };
        state.results = getUpdatedResults(state, state.focusedResult)
      }
    },
    removePresence: (state, action: { payload: string }) => {
      state.results = state.results.filter(r => r.label !== action.payload);
      state.focusedResult = undefined;
      state.focusedComment = state.taskComments.length > 0 ? state.taskComments[0] : undefined;
      state.presenceLabels = state.presenceLabels.filter(l => l !== action.payload);
      state.focusedLabel = undefined;
    },

    validateResult: (state, action: { payload: AnnotationResult }) => {
      const focusedResult = state.results.find(r => r.id === action.payload.id);
      if (!focusedResult) return;
      let validation = focusedResult?.validations.pop();
      if (validation) {
        validation.is_valid = true
      } else {
        validation = {
          is_valid: true,
          result: focusedResult.id,
          annotator: -1,
          id: Math.min(0, ...state.results.flatMap(r => r.validations.map(v => v.id))) - 1
        }
      }
      state.focusedResult = {
        ...focusedResult,
        validations: [ validation ]
      }
      focusResult(state, { payload: state.focusedResult });
      if (getResultType(state.focusedResult) === 'presence') return;
      state.results = state.results.map(r => {
        if (r.id === focusedResult.id) return state.focusedResult!;
        const type = getResultType(r);
        if (type !== 'presence') return r;
        if (r.label !== focusedResult.label) return r;
        const v = r.validations.pop()
        return {
          ...r,
          validations: [ {
            is_valid: true,
            result: r.id,
            annotator: v?.annotator ?? -1,
            id: v?.id ?? Math.min(0, ...state.results.flatMap(r => r.validations.map(v => v.id))) - 1
          } ]
        }
      })
    },
    invalidateResult: (state, action: { payload: AnnotationResult }) => {
      const focusedResult = state.results.find(r => r.id === action.payload.id);
      if (!focusedResult) return;
      let validation = focusedResult?.validations.pop();
      if (validation) {
        validation.is_valid = false
      } else {
        validation = {
          is_valid: false,
          result: focusedResult.id,
          annotator: -1,
          id: Math.min(0, ...state.results.flatMap(r => r.validations.map(v => v.id))) - 1
        }
      }
      state.focusedResult = {
        ...focusedResult,
        validations: [ validation ]
      }
      focusResult(state, { payload: state.focusedResult });
      if (getResultType(state.focusedResult) !== 'presence') {
        state.results = getUpdatedResults(state, state.focusedResult);
        return;
      }
      state.results = state.results.map(r => {
        if (r.id === focusedResult.id) return state.focusedResult!;
        const type = getResultType(r);
        if (type === 'presence') return r;
        if (r.label !== focusedResult.label) return r;
        return {
          ...r,
          validations: [ {
            is_valid: false,
            result: r.id,
            annotator: -1,
            id: r.validations.pop()?.id ?? Math.min(0, ...state.results.flatMap(r => r.validations.map(v => v.id))) - 1
          } ]
        }
      })
    },

    selectConfidence: (state, action: { payload: string }) => {
      const focusedResult = state.focusedResult
      if (focusedResult) focusedResult.confidence_indicator = action.payload;
      state.results = getUpdatedResults(state, focusedResult);
      state.focusedResult = focusedResult;
      state.focusedConfidence = action.payload;
    },
  }
})

export const AnnotationActions = annotationsSlice.actions;

export default annotationsSlice.reducer;
