import { createSlice } from '@reduxjs/toolkit'
import { ID } from '@/service/type.ts';
import { getNewItemID } from '@/service/function';
import { Colormap } from '@/service/ui/color.ts';
import { formatTime } from "@/service/dataset/spectrogram-configuration/scale";
import { UserAPI } from "@/service/api/user.ts";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useListSpectrogramForCurrentCampaign } from "@/service/api/spectrogram-configuration.ts";
import { useGetConfidenceSetForCurrentCampaign } from "@/service/api/confidence-set.ts";
import { useRetrieveAnnotator } from "@/service/api/annotator.ts";
import {
  AcousticFeatures,
  AnnotationCampaign,
  AnnotationCampaignPhase,
  AnnotationComment,
  AnnotationResult,
  AnnotationResultBounds,
  AnnotatorData,
  ConfidenceIndicator,
  ConfidenceIndicatorSet,
  Phase,
  SpectrogramConfiguration,
  User
} from "@/service/types";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { useEffect, useRef } from "react";
import { useAlert } from "@/service/ui";
import { useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";

export type AnnotatorState = Partial<AnnotatorData> & {
  spectrogram_configurations: SpectrogramConfiguration[];
  focusedResultID?: number,
  focusedCommentID?: number,
  focusedLabel?: string,
  focusedConfidenceLabel?: string,
  hasChanged: boolean,
  userPreferences: {
    audioSpeed: number;
    spectrogramConfigurationID: number;
    zoomLevel: number;
    colormap?: Colormap;
    colormapInverted?: boolean;
    brightness: number;
    contrast: number;
  },
  ui: {
    pointerPosition?: { time: number, frequency: number },
    zoomOrigin?: { x: number, y: number },
    hiddenLabels: string[]
  },
  didSeeAllFile: boolean,
  audio: {
    time: number;
    isPaused: boolean;
    stopTime?: number;
  },
  sessionStart: number;
  confidenceIndicators?: ConfidenceIndicator[];
  canAddAnnotations?: boolean;

  phaseID?: number;
}

export function getDefaultConfidence(state: AnnotatorState) {
  if (!state.confidenceIndicators) return undefined;
  const defaultIndicator = state.confidenceIndicators.find(c => c.is_default);
  return defaultIndicator ?? state.confidenceIndicators.find(c => c)
}

export function getPresenceLabels(results?: Array<AnnotationResult>) {
  if (!results) return [];
  return [ ...new Set(results.map(s => s.label)) ]
}

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

function getUpdatedTo(state: AnnotatorState, result: AnnotationResult, label?: string, newBounds?: AnnotationResultBounds): AnnotationResult[] {
  let updated_to: AnnotationResult = {
    ...result,
    annotation_campaign_phase: state.phaseID!,
    label: label ?? result.label,
    ...newBounds,
    detector_configuration: null,
    annotator: state.userID!,
    id: -1,
    validations: []
  };
  if (result.updated_to.length > 0) {
    updated_to = { ...result.updated_to[0], label: label ?? result.updated_to[0].label, ...newBounds }
  }

  let is_same = true;
  switch (result.type) {
    // @ts-expect-error: Content is also ok for Box
    // eslint-disable-next-line no-fallthrough
    case "Box":
      is_same = is_same && formatTime(result.end_time, true) === formatTime(updated_to.end_time!, true)
      is_same = result.end_frequency.toFixed(2) === updated_to.end_frequency!.toFixed(2)
    // @ts-expect-error: Content is also ok for Box and Point
    // eslint-disable-next-line no-fallthrough
    case "Point":
      is_same = is_same && formatTime(result.start_time, true) === formatTime(updated_to.start_time!, true)
      is_same = result.start_frequency.toFixed(2) === updated_to.start_frequency!.toFixed(2)
    // eslint-disable-next-line no-fallthrough
    case "Weak":
      is_same = is_same && result.label === updated_to.label;
  }

  if (is_same) return []
  return [ updated_to ];
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
    spectrogram_configurations: []
  } satisfies AnnotatorState as AnnotatorState,
  reducers: {
    focusResult: _focusResult,
    focusTask: _focusTask,
    addResult: (state, { payload: {phaseID, ...annotation} }: { payload: AnnotationResultBounds & {phaseID: number} }) => {
      const newResult: AnnotationResult = {
        ...annotation,
        id: getNewItemID(state.results),
        annotator: state.userID!,
        annotation_campaign_phase: phaseID,
        dataset_file: -1,
        detector_configuration: null,
        comments: [],
        validations: [],
        confidence_indicator: state.focusedConfidenceLabel ?? null,
        label: state.focusedLabel ?? getPresenceLabels(state.results)!.pop()!,
        acoustic_features: null,
        updated_to: []
      }
      if (!state.results) state.results = [];
      state.results.push(newResult);
      state.hasChanged = true;
      _focusResult(state, { payload: newResult.id })
    },
    updateFocusResultBounds: (state, { payload: { newBounds, phase } }: {
      payload: { newBounds: AnnotationResultBounds, phase: Phase }
    }) => {
      let currentResult: AnnotationResult | undefined = state.results?.find(r => r.id === state.focusedResultID)
      if (!currentResult) return;
      // Update current result
      switch (phase) {
        case 'Annotation':
          currentResult = { ...currentResult, ...newBounds }
          break;
        case 'Verification':
          currentResult.updated_to = getUpdatedTo(state, currentResult, undefined, newBounds)
          if (currentResult.validations.length > 0) {
            currentResult.validations = currentResult.validations.map(v => ({ ...v, is_valid: false }))
          } else {
            currentResult.validations = [ {
              id: -1,
              is_valid: false,
              annotator: state.userID!,
              result: currentResult.id
            } ]
          }
          break;
      }
      if (currentResult.updated_to.length === 0)
        currentResult.validations = currentResult.validations.map(v => ({ ...v, is_valid: true }))
      state.hasChanged = true;
      state.results = state.results?.map(r => state.focusedResultID === r.id ? currentResult : r)
      _focusResult(state, { payload: currentResult.id })
    },
    addPresenceResult: (state, { payload: {label, phaseID} }: { payload: { label: string, phaseID: number } }) => {
      const existingPresence = state.results?.find(r => r.label === label && r.type === 'Weak')
      if (existingPresence) {
        _focusResult(state, { payload: existingPresence.id })
        return
      }
      const newResult: AnnotationResult = {
        id: getNewItemID(state.results),
        annotator: state.userID!,
        annotation_campaign_phase: phaseID,
        dataset_file: -1,
        detector_configuration: null,
        comments: [],
        validations: [],
        confidence_indicator: state.focusedConfidenceLabel ?? null,
        label,
        end_frequency: null,
        end_time: null,
        start_time: null,
        start_frequency: null,
        type: 'Weak',
        acoustic_features: null,
        updated_to: []
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
    updateLabel: (state, { payload: { label, phase } }: {
      payload: { label: string, phase: Phase }
    }) => {
      const currentResult: AnnotationResult | undefined = state.results?.find(r => r.id === state.focusedResultID)
      if (!currentResult) return;
      const results = state.results ?? [];
      // Update current result
      switch (phase) {
        case 'Annotation':
          currentResult.label = label;
          // Add presence label if it doesn't exist
          if (!results?.find(r => r.label === label && r.type === 'Weak')) {
            results.push({
              id: getNewItemID(state.results),
              annotator: state.userID!,
              annotation_campaign_phase: state.phaseID!,
              dataset_file: -1,
              detector_configuration: null,
              comments: [],
              validations: [],
              confidence_indicator: state.focusedConfidenceLabel ?? null,
              label,
              end_frequency: null,
              end_time: null,
              start_time: null,
              start_frequency: null,
              type: 'Weak',
              acoustic_features: null,
              updated_to: []
            })
          }
          break;
        case 'Verification':
          currentResult.updated_to = getUpdatedTo(state, currentResult,  label)
          if (currentResult.validations.length > 0) {
            currentResult.validations = currentResult.validations.map(v => ({ ...v, is_valid: false }))
          } else {
            currentResult.validations = [ {
              id: -1,
              is_valid: false,
              annotator: state.userID!,
              result: currentResult.id
            } ]
          }
          break;
      }
      if (currentResult.updated_to.length === 0)
        currentResult.validations = currentResult.validations.map(v => ({ ...v, is_valid: true }))
      state.hasChanged = true;
      state.results = results?.map(r => state.focusedResultID === r.id ? currentResult : r)
      _focusResult(state, { payload: currentResult.id })
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
        let validations = r.validations;
        let updated_to = r.updated_to
        if (r.id === payload) {
          if (validations.length > 0) {
            validations = validations.map(v => ({ ...v, is_valid: true }))
          } else {
            validations.push({
              id: -1,
              is_valid: true,
              annotator: state.userID!,
              result: r.id
            })
          }
          updated_to = []
        }
        if (result.type !== 'Weak' && r.label === result.label && r.type === 'Weak' && r.updated_to.length === 0) {
          validations = validations.map(v => ({ ...v, is_valid: true }))
        }
        return { ...r, validations, updated_to }
      })
      _focusResult(state, { payload })
    },
    invalidateResult: (state, { payload }: { payload: number }) => {
      const result = state.results?.find(r => r.id === payload);
      if (!result) return;
      state.results = state.results?.map(r => {
        let validations = r.validations;
        let updated_to = r.updated_to
        if (r.id === payload || (result.type == 'Weak' && r.label === result.label)) {
          if (validations.length > 0) {
            validations = validations.map(v => ({ ...v, is_valid: false }))
          } else {
            validations.push({
              id: -1,
              is_valid: false,
              annotator: state.userID!,
              result: r.id
            })
          }
          if (r.id === payload) updated_to = []
        }
        return { ...r, validations, updated_to }
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

    // Events
    onSpectrogramConfigurationsUpdated: (state, { payload }: { payload: SpectrogramConfiguration[] }) => {
      state.spectrogram_configurations = payload
    },
    onAnnotatorUpdated: (state, { payload }: { payload: AnnotatorData }) => {
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
    onCampaignUpdated: (state, { payload }: { payload: AnnotationCampaign }) => {
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
    onUserUpdated: (state, { payload }: { payload: User }) => {
      state.userID = payload.id;
    },
    onPhaseUpdated: (state, { payload }: { payload: AnnotationCampaignPhase }) => {
      state.phaseID = payload.id;
    },
    onConfidenceSetUpdated: (state, { payload }: { payload: ConfidenceIndicatorSet }) => {
      state.confidenceIndicators = payload.confidence_indicators;
    },
  },
})

export const useCanNavigate = () => {
  const {
    hasChanged: _hasChanged,
  } = useAppSelector(state => state.annotator);
  const hasChanged = useRef<boolean>(_hasChanged);
  useEffect(() => {
    hasChanged.current = _hasChanged
  }, [ _hasChanged ]);
  const alert = useAlert();

  async function canNavigate(): Promise<boolean> {
    if (!hasChanged.current) return true;
    return new Promise<boolean>((resolve) => {
      alert.showAlert({
        type: 'Warning',
        message: `You have unsaved changes. Are you sure you want to forget all of them?`,
        actions: [ {
          label: 'Forget my changes',
          callback: () => resolve(true)
        } ],
        onCancel: () => resolve(false)
      })
    })
  }

  return canNavigate;
}

export const useAnnotatorSliceSetup = () => {
  const dispatch = useAppDispatch()

  const { configurations } = useListSpectrogramForCurrentCampaign()
  useEffect(() => {
    dispatch(AnnotatorSlice.actions.onSpectrogramConfigurationsUpdated(configurations ?? []))
  }, [ configurations ]);

  const { campaign } = useRetrieveCurrentCampaign()
  useEffect(() => {
    if (campaign) dispatch(AnnotatorSlice.actions.onCampaignUpdated(campaign))
  }, [ campaign ]);

  const { phase } = useRetrieveCurrentPhase()
  useEffect(() => {
    if (phase) dispatch(AnnotatorSlice.actions.onPhaseUpdated(phase))
  }, [ phase ]);

  const { data } = useRetrieveAnnotator();
  useEffect(() => {
    if (data) dispatch(AnnotatorSlice.actions.onAnnotatorUpdated(data))
  }, [ data ]);

  const { data: user } = UserAPI.endpoints.getCurrentUser.useQuery()
  useEffect(() => {
    if (user) dispatch(AnnotatorSlice.actions.onUserUpdated(user))
  }, [ user ]);

  const { confidenceSet } = useGetConfidenceSetForCurrentCampaign()
  useEffect(() => {
    if (confidenceSet) dispatch(AnnotatorSlice.actions.onConfidenceSetUpdated(confidenceSet))
  }, [ confidenceSet ]);

}
