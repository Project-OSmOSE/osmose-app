import { createSlice } from "@reduxjs/toolkit";

import { ToastMessage } from "@/types/toast.ts";
import { AnnotationCampaign, DatasetFile, User } from "@/services/api";

export type AnnotatorSlice = {
  file?: DatasetFile;
  user?: User;
  campaign?: AnnotationCampaign;
  previous_file_id: number | null;
  next_file_id: number | null;

  toast?: ToastMessage;
  areShortcutsEnabled: boolean;
  sessionStart: number;
}

export const annotatorSlice = createSlice({
  name: 'Annotator',
  initialState: {
    areShortcutsEnabled: true,
    sessionStart: Date.now(),
    previous_file_id: null,
    next_file_id: null,
  } as AnnotatorSlice,
  reducers: {
    init: (state, action: {
      payload: {
        campaign: AnnotationCampaign;
        file: DatasetFile;
        user: User;
        previous_file_id: number | null;
        next_file_id: number | null;
      }
    }) => {
      state.file = action.payload.file;
      state.campaign = action.payload.campaign;
      state.user = action.payload.user;
      state.sessionStart = Date.now();
      state.previous_file_id = action.payload.previous_file_id;
      state.next_file_id = action.payload.next_file_id;
    },

    setDangerToast: (state, action: { payload: string }) => {
      state.toast = {
        level: 'danger',
        messages: [ action.payload ]
      };
    },
    setSuccessToast: (state, action: { payload: string }) => {
      state.toast = {
        level: 'success',
        messages: [ action.payload ]
      };
    },
    setPrimaryToast: (state, action: { payload: string }) => {
      state.toast = {
        level: 'primary',
        messages: [ action.payload ]
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

export const AnnotatorActions = annotatorSlice.actions;

export default annotatorSlice.reducer;
