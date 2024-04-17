import { createSlice } from "@reduxjs/toolkit";

import { ToastMessage } from "@/types/toast.ts";
import { CampaignUsage } from "@/types/campaign.ts";
import { Retrieve } from "@/services/api/annotation-task-api.service.tsx";

export type AnnotatorSlice = {
  taskId?: number;
  campaignId?: number;
  campaignName?: string;
  audioURL?: string;
  instructionsURL?: string;
  prevAndNextAnnotation?: {
    prev: number;
    next: number;
  };
  audioRate?: number;
  toast?: ToastMessage;
  areShortcutsEnabled: boolean;
  mode: CampaignUsage;
}

export const annotatorSlice = createSlice({
  name: 'Annotator',
  initialState: {
    areShortcutsEnabled: true,
    mode: "Create"
  } as AnnotatorSlice,
  reducers: {
    initAnnotator: (state, action: { payload: Retrieve }) => {
      Object.assign(state, {
        taskId: action.payload.id,
        audioURL: action.payload.audioUrl,
        instructionsURL: action.payload.instructions_url,
        campaignId: action.payload.campaignId,
        campaignName: action.payload.campaignName,
        audioRate: action.payload.audioRate,
        prevAndNextAnnotation: action.payload.prevAndNextAnnotation,
        mode: action.payload.mode,
      });
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
