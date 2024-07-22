import { createSlice } from "@reduxjs/toolkit";

import { ToastMessage } from "@/types/toast.ts";
import { Retrieve } from "@/services/api/annotation-task-api.service.tsx";

export type AnnotatorSlice = {
  task: Retrieve;

  toast?: ToastMessage;
  areShortcutsEnabled: boolean;
}

export const annotatorSlice = createSlice({
  name: 'Annotator',
  initialState: {
    areShortcutsEnabled: true,
  } as AnnotatorSlice,
  reducers: {
    initAnnotator: (state, action: { payload: Retrieve }) => {
      state.task = action.payload
    },

    setDangerToast: (state, action: { payload: string }) => {
      state.toast = {
        level: 'danger',
        messages: [action.payload]
      };
    },
    setSuccessToast: (state, action: { payload: string }) => {
      state.toast = {
        level: 'success',
        messages: [action.payload]
      };
    },
    setPrimaryToast: (state, action: { payload: string }) => {
      state.toast = {
        level: 'primary',
        messages: [action.payload]
      };
    },
    removeToast: (state) => {
      state.toast = undefined;
    },

    enableShortcuts: (state) => {
      state.areShortcutsEnabled = true;
    },
    disableShortcuts: (state) => {
      state.areShortcutsEnabled = false;
    },
  }
})

export const {
  initAnnotator,
  setDangerToast,
  setSuccessToast,
  setPrimaryToast,
  removeToast,
  enableShortcuts,
  disableShortcuts,
} = annotatorSlice.actions;

export default annotatorSlice.reducer;
