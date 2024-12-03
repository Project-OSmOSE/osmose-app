import { createSlice } from '@reduxjs/toolkit'
import { AnnotatorState, } from './type';
import { COLORS } from '@/consts/colors.const.tsx';
import { AnnotationResult, AnnotationResultBounds } from '@/service/campaign/result';
import { getDefaultConfidence, getPresenceLabels, getResultType } from './function.ts';
import { ID } from '@/service/type.ts';
import { AnnotatorAPI } from './api.ts';
import { AnnotationComment } from '@/service/campaign/comment';
import { getNewItemID } from '@/service/function';

function _focusTask(state: AnnotatorState) {
  state.focusedResultID = undefined;
  state.focusedLabel = undefined;
  state.focusedConfidenceLabel = getDefaultConfidence(state)?.label;
  state.focusedCommentID = state.task_comments?.find(c => c)?.id;
}

function _focusResult(state: AnnotatorState, { payload }: { payload: ID }) {
  const result = state.results?.find(r => r.id === payload);
  if (!result) return _focusTask(state);
  state.focusedResultID = result.id;
  state.focusedLabel = result.label;
  state.focusedConfidenceLabel = result.confidence_indicator ?? undefined;
  state.focusedCommentID = result.comments.find(c => c)?.id;
}

export const AnnotatorSlice = createSlice({
  name: 'annotator',
  initialState: {
    hasChanged: false,
    userPreferences: {
      audioSpeed: 1,
      zoomLevel: 1,
      spectrogramConfigurationID: 1
    },
    audio: {
      isPaused: true,
      time: 0,
    },
    ui: {
      areShortcutsEnabled: true
    },
    labelColors: {},
    sessionStart: Date.now()
  } satisfies AnnotatorState as AnnotatorState,
  reducers: {
    focusResult: _focusResult,
    focusTask: _focusTask,
    addResult: (state, { payload }: { payload: AnnotationResultBounds }) => {
      const newResult: AnnotationResult = {
        ...payload,
        id: getNewItemID(state.results),
        annotator: -1,
        annotation_campaign: -1,
        dataset_file: -1,
        detector_configuration: null,
        comments: [],
        validations: [],
        confidence_indicator: state.focusedConfidenceLabel ?? null,
        label: state.focusedLabel ?? getPresenceLabels(state.results)!.pop()!
      }
      if (!state.results) state.results = [];
      state.results.push(newResult);
      state.hasChanged = true;
      _focusResult(state, { payload: newResult.id })
    },
    addPresenceResult: (state, { payload }: { payload: string }) => {
      const newResult: AnnotationResult = {
        id: getNewItemID(state.results),
        annotator: -1,
        annotation_campaign: -1,
        dataset_file: -1,
        detector_configuration: null,
        comments: [],
        validations: [],
        confidence_indicator: state.focusedConfidenceLabel ?? null,
        label: payload,
        end_frequency: null,
        end_time: null,
        start_time: null,
        start_frequency: null,
      }
      if (!state.results) state.results = [];
      state.results.push(newResult);
      state.hasChanged = true;
      _focusResult(state, { payload: newResult.id })
    },
    removeResult: (state, { payload }: { payload: number }) => {
      const result = state.results?.find(r => r.id === payload);
      if (!result) return _focusTask(state);
      state.hasChanged = true;
      if (getResultType(result) === 'presence') {
        state.results = state.results!.filter(r => r.label !== result.label);
        return _focusTask(state);
      }
      state.results = state.results!.filter(r => r.id !== result.id);
      const presenceResult = state.results!.find(r => r.label === result.label && getResultType(r) === 'presence');
      if (presenceResult) _focusResult(state, { payload: presenceResult.id });
      else _focusTask(state);
    },
    removePresence: (state, { payload }: { payload: string }) => {
      const presenceResult = state.results!.find(r => r.label === payload && getResultType(r) === 'presence');
      if (!presenceResult) return _focusTask(state);
      state.hasChanged = true;
      state.results = state.results!.filter(r => r.label !== presenceResult.label);
      return _focusTask(state);
    },
    focusLabel: (state, { payload }: { payload: string }) => {
      state.focusedLabel = payload;
      const result = state.results?.find(r => r.id === state.focusedResultID);
      if (!result) return;
      const type = getResultType(result);
      if (type === 'presence') {
        _focusTask(state);
      } else {
        state.results = state.results?.map(r => {
          if (r.id !== state.focusedResultID) return r;
          return {
            ...r,
            label: payload
          }
        })
        state.hasChanged = true;
      }
    },
    focusConfidence: (state, { payload }: { payload: string }) => {
      state.focusedConfidenceLabel = payload;
      state.hasChanged = true;
      state.results = state.results?.map(r => {
        if (r.id !== state.focusedResultID) return r;
        return { ...r, confidence_indicator: payload }
      });
    },
    updateFocusComment: (state, { payload }: { payload: string }) => {
      state.hasChanged = true;
      if (!state.focusedCommentID) {
        const newComment: AnnotationComment = {
          comment: payload,
          annotation_result: state.focusedResultID ?? null,
          annotation_campaign: state.campaign?.id ?? -1,
          dataset_file: state.file?.id ?? -1,
          id: getNewItemID([ ...(state.results ?? []).flatMap(r => r.comments), ...(state.task_comments ?? []) ]),
          author: state.user?.id ?? -1
        };
        if (newComment.annotation_result) {
          state.results = state.results?.map(r => {
            if (r.id !== newComment.annotation_result) return r;
            return {
              ...r,
              comments: [ ...r.comments, newComment ]
            }
          });
        } else {
          state.task_comments = [ ...(state.task_comments ?? []), newComment ]
        }
        state.focusedCommentID = newComment.id;
        return;
      }
      state.task_comments = state.task_comments?.map(c => {
        if (c.id !== state.focusedCommentID) return c;
        return {
          ...c,
          comment: payload
        };
      })
      state.results = state.results?.map(r => ({
        ...r,
        comments: r.comments?.map(c => {
          if (c.id !== state.focusedCommentID) return c;
          return {
            ...c,
            comment: payload
          };
        })
      }));
    },
    removeFocusComment: (state) => {
      if (!state.focusedCommentID) return;
      state.task_comments = state.task_comments?.filter(c => c.id !== state.focusedCommentID)
      state.results = state.results?.map(r => ({
        ...r,
        comments: r.comments?.filter(c => c.id !== state.focusedCommentID)
      }));
      state.focusedCommentID = undefined;
      state.hasChanged = true;
    },
    validateResult: (state, { payload }: { payload: number }) => {
      const result = state.results?.find(r => r.id === payload);
      if (!result) return;
      const type = getResultType(result);
      state.results = state.results?.map(r => {
        if (r.id === payload ||
          (type !== 'presence' && r.label === result.label && getResultType(r) === 'presence')) {
          let validations = r.validations;
          if (validations.find(v => v.annotator === state.user?.id)) {
            validations = validations.map(v => {
              if (v.annotator !== state.user?.id) return v;
              return {
                ...v,
                is_valid: true
              }
            })
          } else validations.push({
            id: getNewItemID(state.results?.flatMap(r => r.validations) ?? []),
            annotator: state.user?.id ?? -1,
            is_valid: true,
            result: r.id
          })
          return { ...r, validations }
        }
        return r;
      })
      _focusResult(state, { payload })
    },
    invalidateResult: (state, { payload }: { payload: number }) => {
      const result = state.results?.find(r => r.id === payload);
      if (!result) return;
      const type = getResultType(result);
      state.results = state.results?.map(r => {
        if ((type !== 'presence' && r.id === payload) ||
          (type === 'presence' && r.label === result.label)) {
          let validations = r.validations;
          if (validations.find(v => v.annotator === state.user?.id)) {
            validations = validations.map(v => {
              if (v.annotator !== state.user?.id) return v;
              return {
                ...v,
                is_valid: false
              }
            })
          } else validations.push({
            id: getNewItemID(state.results?.flatMap(r => r.validations) ?? []),
            annotator: state.user?.id ?? -1,
            is_valid: false,
            result: r.id
          })
          return { ...r, validations }
        }
        return r;
      })
      _focusResult(state, { payload })
    },
    selectSpectrogramConfiguration: (state, { payload }: { payload: number }) => {
      state.userPreferences.spectrogramConfigurationID = payload;
      state.userPreferences.zoomLevel = 1;
    },
    enableShortcuts: (state) => {
      state.ui.areShortcutsEnabled = true;
    },
    disableShortcuts: (state) => {
      state.ui.areShortcutsEnabled = false;
    },
    setPointerPosition: (state, { payload }: { payload: { time: number, frequency: number } }) => {
      state.ui.pointerPosition = payload;
    },
    leavePointerPosition: (state) => {
      state.ui.pointerPosition = undefined;
    },
    zoom: (state, action: {
      payload: { direction: 'in' | 'out', origin?: { x: number; y: number } }
    }) => {
      state.ui.zoomOrigin = action.payload.origin;
      const max = Math.max(...(state.spectrogram_configurations ?? []).map(s => s.zoom_level))
      switch (action.payload.direction) {
        case "in":
          state.userPreferences.zoomLevel = Math.min(state.userPreferences.zoomLevel * 2, max);
          break;
        case "out":
          state.userPreferences.zoomLevel = Math.max(state.userPreferences.zoomLevel / 2, 1);
          break;
      }
    },
    onPlay: (state) => {
      state.audio.isPaused = false;
    },
    onPause: (state) => {
      state.audio.isPaused = true;
    },
    setTime: (state, action: { payload: number }) => {
      state.audio.time = action.payload ?? 0;
    },
    setStopTime: (state, action: { payload: number | undefined }) => {
      state.audio.stopTime = action.payload;
    },
    setAudioSpeed: (state, action: { payload: number }) => {
      state.userPreferences.audioSpeed = action.payload;
    },
  },
  extraReducers:
    (builder) => {
      builder.addMatcher(
        AnnotatorAPI.endpoints.retrieve.matchFulfilled,
        (state, { payload }) => {
          // Reset user preferences if new campaign
          if (state.campaign?.id !== payload.campaign.id) {
            state.userPreferences.audioSpeed = 1;
            state.userPreferences.zoomLevel = 1;
            const simpleSpectrogramID = payload.spectrogram_configurations.find(s => !s.multi_linear_frequency_scale && !s.linear_frequency_scale)?.id;
            state.userPreferences.spectrogramConfigurationID = simpleSpectrogramID ?? Math.min(-1, ...payload.spectrogram_configurations.map(s => s.id));
          }
          // initialize slice
          Object.assign(state, payload);
          state.focusedCommentID = payload.task_comments && payload.task_comments.length > 0 ? payload.task_comments[0].id : undefined;
          state.focusedResultID = undefined;
          state.focusedLabel = undefined;
          state.focusedConfidenceLabel = getDefaultConfidence(state)?.label;
          state.hasChanged = false;
          const labelColors = {};
          for (const label of payload.label_set.labels) {
            Object.assign(labelColors, { [label]: COLORS[payload.label_set.labels.indexOf(label) % COLORS.length] })
          }
          state.labelColors = labelColors;
          state.audio = {
            time: 0,
            isPaused: true,
          }
          state.sessionStart = Date.now()
        },
      )
    },
})

export const {
  focusResult,
  focusTask,
  updateFocusComment,
  focusConfidence,
  focusLabel,
  invalidateResult,
  validateResult,
  addPresenceResult,
  removePresence,
  removeFocusComment,
  removeResult,
  addResult,
  selectSpectrogramConfiguration,
  setPointerPosition,
  zoom,
  enableShortcuts,
  disableShortcuts,
  leavePointerPosition,
  setTime,
  onPause,
  setAudioSpeed,
  setStopTime,
  onPlay,

} = AnnotatorSlice.actions
