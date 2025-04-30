import { createSlice } from '@reduxjs/toolkit'
import { AnnotatorState, } from './type';
import { AnnotationResult, AnnotationResultBounds } from '@/service/campaign/result';
import { getDefaultConfidence, getPresenceLabels } from './function.ts';
import { ID } from '@/service/type.ts';
import { AnnotatorAPI } from './api.ts';
import { AnnotationComment } from '@/service/campaign/comment';
import { getNewItemID } from '@/service/function';
import { AcousticFeatures } from '@/service/campaign/result/type.ts';
import { CampaignAPI } from "@/service/campaign";
import { UserAPI } from "@/service/user";
import { ConfidenceSetAPI } from "@/service/campaign/confidence-set";
import { Colormap } from '@/services/utils/color.ts';

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
      spectrogramConfigurationID: 1,
      colormap: undefined,
      colormapInverted: undefined,
      brightness: 50,
      contrast: 50,
    },
    audio: {
      isPaused: true,
      time: 0,
    },
    ui: { hiddenLabels: [] },
    sessionStart: Date.now(),
    didSeeAllFile: false,
    canAddAnnotations: true,
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
        label: state.focusedLabel ?? getPresenceLabels(state.results)!.pop()!,
        acoustic_features: null,
      }
      if (!state.results) state.results = [];
      state.results.push(newResult);
      state.hasChanged = true;
      _focusResult(state, { payload: newResult.id })
    },
    updateFocusResultBounds: (state, { payload }: { payload: AnnotationResultBounds }) => {
      if (!state.focusedResultID) return;
      if (!state.results) state.results = [];
      state.results = state.results.map(r => {
        if (r.id !== state.focusedResultID) return r;
        return {
          ...r,
          ...payload
        }
      });
      state.hasChanged = true;
      _focusResult(state, { payload: state.focusedResultID })
    },
    addPresenceResult: (state, { payload }: { payload: string }) => {
      const existingPresence = state.results?.find(r => r.label === payload && r.type === 'Weak')
      if (existingPresence) {
        _focusResult(state, { payload: existingPresence.id })
        return
      }
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
        type: 'Weak',
        acoustic_features: null,
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
      if (result.type === 'Weak') {
        state.results = state.results!.filter(r => r.label !== result.label);
        return _focusTask(state);
      }
      state.results = state.results!.filter(r => r.id !== result.id);
      const presenceResult = state.results!.find(r => r.label === result.label && r.type === 'Weak');
      if (presenceResult) _focusResult(state, { payload: presenceResult.id });
      else _focusTask(state);
    },
    removePresence: (state, { payload }: { payload: string }) => {
      const presenceResult = state.results!.find(r => r.label === payload && r.type === 'Weak');
      if (presenceResult) {
        state.hasChanged = true;
        state.results = state.results!.filter(r => r.label !== presenceResult.label);
      }
      _focusTask(state);
    },
    focusLabel: (state, { payload }: { payload: string }) => {
      state.focusedLabel = payload;
    },
    updateLabel: (state, { payload }: { payload: string }) => {
      if (!state.focusedResultID) return;
      const results = state.results ?? []
      if (!results?.find(r => r.label === payload && r.type === 'Weak')) {
        results.push({
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
          type: 'Weak',
          acoustic_features: null,
        })
      }
      state.results = results?.map(r => state.focusedResultID === r.id ? { ...r, label: payload } : r)
      _focusResult(state, { payload: state.focusedResultID })
    },
    focusPresence: (state, { payload }: { payload: string }) => {
      const result = state.results?.find(r => r.label === payload && r.type === 'Weak');
      if (result) _focusResult(state, { payload: result.id })
      else _focusTask(state)
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
          annotation_campaign: state.campaignID ?? -1,
          dataset_file: state.file?.id ?? -1,
          id: getNewItemID([ ...(state.results ?? []).flatMap(r => r.comments), ...(state.task_comments ?? []) ]),
          author: state.userID ?? -1
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
      state.results = state.results?.map(r => {
        if (r.id === payload ||
          (result.type !== 'Weak' && r.label === result.label && r.type === 'Weak')) {
          let validations = r.validations;
          if (validations.find(v => v.annotator === state.userID)) {
            validations = validations.map(v => {
              if (v.annotator !== state.userID) return v;
              return {
                ...v,
                is_valid: true
              }
            })
          } else validations.push({
            id: getNewItemID(state.results?.flatMap(r => r.validations) ?? []),
            annotator: state.userID ?? -1,
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
      state.results = state.results?.map(r => {
        if ((result.type !== 'Weak' && r.id === payload) ||
          (result.type === 'Weak' && r.label === result.label)) {
          let validations = r.validations;
          if (validations.find(v => v.annotator === state.userID)) {
            validations = validations.map(v => {
              if (v.annotator !== state.userID) return v;
              return {
                ...v,
                is_valid: false
              }
            })
          } else validations.push({
            id: getNewItemID(state.results?.flatMap(r => r.validations) ?? []),
            annotator: state.userID ?? -1,
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
      state.userPreferences.colormap = undefined;
      state.userPreferences.colormapInverted = undefined;
      state.userPreferences.brightness = 50;
      state.userPreferences.contrast = 50;
    },
    setColormap: (state, { payload }: { payload: Colormap }) => {
      state.userPreferences.colormap = payload;
    },
    setColormapInverted: (state, { payload }: { payload: boolean }) => {
      state.userPreferences.colormapInverted = payload;
    },
    setBrightness: (state, { payload }: { payload: number }) => {
      state.userPreferences.brightness = payload;
    },
    setContrast: (state, { payload }: { payload: number }) => {
      state.userPreferences.contrast = payload;
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
      let max = Math.max(...(state.spectrogram_configurations ?? []).map(s => s.zoom_level));
      max = Math.max(0, max - 1)
      switch (action.payload.direction) {
        case "in":
          state.userPreferences.zoomLevel = Math.min(state.userPreferences.zoomLevel * 2, 2 ** max);
          break;
        case "out":
          state.userPreferences.zoomLevel = Math.max(state.userPreferences.zoomLevel / 2, 1);
          break;
      }
      if (state.userPreferences.zoomLevel === 1) {
        state.didSeeAllFile = true;
      }
    },
    setFileIsSeen: (state) => {
      state.didSeeAllFile = true;
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

    // Acoustic features
    updateCurrentResultAcousticFeatures(state, { payload }: { payload: Partial<AcousticFeatures> | null }) {
      state.results = state.results?.map(r => {
        if (r.id !== state.focusedResultID) return r;
        if (!payload) return { ...r, acoustic_features: null }
        return {
          ...r,
          acoustic_features: {
            start_frequency: null,
            end_frequency: null,
            has_harmonics: null,
            steps_count: null,
            trend: null,
            relative_max_frequency_count: null,
            relative_min_frequency_count: null,
            ...(r.acoustic_features ?? {}),
            ...payload
          } satisfies AcousticFeatures
        }
      })
      state.hasChanged = true;
    },
    disableNewAnnotations: (state) => {
      state.canAddAnnotations = false;
    },
    enableNewAnnotations: (state) => {
      state.canAddAnnotations = true;
    },

    // Hide/show labels
    hideLabel(state, { payload }: { payload: string }) {
      state.ui.hiddenLabels = [ ...state.ui.hiddenLabels, payload ];
    },
    hideLabels(state, { payload }: { payload: string[] }) {
      state.ui.hiddenLabels = [ ...state.ui.hiddenLabels, ...payload ];
    },
    showLabel(state, { payload }: { payload: string }) {
      state.ui.hiddenLabels = state.ui.hiddenLabels.filter(l => l !== payload);
    },
    showAllLabels(state) {
      state.ui.hiddenLabels = []
    },
  },
  extraReducers:
    (builder) => {
      builder.addMatcher(
        AnnotatorAPI.endpoints.retrieve.matchFulfilled,
        (state, { payload }) => {
          // initialize slice
          Object.assign(state, payload);
          state.focusedCommentID = payload.task_comments && payload.task_comments.length > 0 ? payload.task_comments[0].id : undefined;
          state.focusedResultID = undefined;
          state.focusedLabel = undefined;
          state.focusedConfidenceLabel = getDefaultConfidence(state)?.label;
          state.hasChanged = false;
          state.audio = {
            time: 0,
            isPaused: true,
          }
          state.userPreferences = {
            ...state.userPreferences,
            brightness: 50,
            contrast: 50,
          }
          state.sessionStart = Date.now();
          state.didSeeAllFile = state.userPreferences.zoomLevel === 1;
          state.ui.hiddenLabels = []
        },
      )
      builder.addMatcher(
        CampaignAPI.endpoints.retrieve.matchFulfilled,
        (state, { payload }) => {
          // Reset user preferences if new campaign
          if (state.campaignID !== payload.id) {
            state.userPreferences.audioSpeed = 1;
            state.userPreferences.zoomLevel = 1;
            state.userPreferences.brightness = 50;
            state.userPreferences.contrast = 50;
            state.userPreferences.colormap = undefined;
            state.userPreferences.colormapInverted = undefined;
          }
          state.campaignID = payload.id;
        },
      )
      builder.addMatcher(
        ConfidenceSetAPI.endpoints.retrieve.matchFulfilled,
        (state, { payload }) => {
          state.confidenceIndicators = payload.confidence_indicators;
        },
      )
      builder.addMatcher(
        UserAPI.endpoints.getCurrentUser.matchFulfilled,
        (state, { payload }) => {
          state.userID = payload.id;
        },
      )
    },
})

export const {
  focusResult,
  focusPresence,
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
  setColormap,
  setColormapInverted,
  setBrightness,
  setContrast,
  setPointerPosition,
  zoom,
  leavePointerPosition,
  setTime,
  onPause,
  setAudioSpeed,
  setStopTime,
  onPlay,
  updateCurrentResultAcousticFeatures,
  updateFocusResultBounds,
  setFileIsSeen,
} = AnnotatorSlice.actions
