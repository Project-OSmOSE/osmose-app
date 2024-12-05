export {
  AnnotatorAPI,
  usePostAnnotatorMutation,
  useRetrieveAnnotatorQuery,
} from './api';

export {
  CANVAS_DIMENSIONS
} from './const'

export {
  getPresenceLabels,
  getResultType,
  getDefaultConfidence,
} from './function';

export {
  AnnotatorSlice,
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
  zoom,
  setPointerPosition,
  enableShortcuts,
  selectSpectrogramConfiguration,
  disableShortcuts,
  leavePointerPosition,
  setTime,
  onPause,
  setStopTime,
  setAudioSpeed,
  onPlay,

} from './slice';


export type {
  ResultType,
  AnnotatorData,
  WriteAnnotatorData,
  AnnotatorState,
} from './type';