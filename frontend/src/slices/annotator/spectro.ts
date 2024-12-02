import { createSlice } from "@reduxjs/toolkit";
import { SpectrogramConfiguration } from '@/service/dataset/spectrogram-configuration';


export type SpectroSlice = {
  pointerPosition?: { time: number, frequency: number };

  configurations: Array<SpectrogramConfiguration>;
  selectedID: number;

  currentZoom: number;
  currentZoomOrigin?: { x: number, y: number };
  maxZoom: number;
}

export const spectroSlice = createSlice({
  name: 'Spectro',
  initialState: {
    configurations: [],
    selectedID: 0,
    currentZoom: 1,
    maxZoom: 1,
  } as SpectroSlice,
  reducers: {
    init: (state, action: {payload: {spectrogram_configurations: Array<SpectrogramConfiguration>}}) => {
      state.configurations = action.payload.spectrogram_configurations;
      state.currentZoom = 1;
      state.currentZoomOrigin = undefined;
      if (!state.configurations.some(s => s.id === state.selectedID)) {
        const simpleSpectrogramID = state.configurations.find(s => !s.multi_linear_frequency_scale && !s.linear_frequency_scale)?.id;
        state.selectedID = simpleSpectrogramID ?? Math.min(...state.configurations.map(s => s.id));
      }
      state.maxZoom = Math.max(...state.configurations.map(s => s.zoom_level));
    },

    selectSpectrogram: (state, action: { payload: number }) => {
      if (state.selectedID === action.payload) return;
      state.selectedID = action.payload
      state.currentZoom = 1
      state.maxZoom = state.configurations.find(s => s.id === action.payload)!.zoom_level;
    },

    updatePointerPosition: (state, action: { payload: { time: number, frequency: number } }) => {
      state.pointerPosition = action.payload
    },

    leavePointer: (state) => {
      state.pointerPosition = undefined
    },

    zoom: (state, action: {
      payload: { direction: 'in' | 'out', origin?: { x: number; y: number } }
    }) => {
      state.currentZoomOrigin = action.payload.origin;
      switch (action.payload.direction) {
        case "in":
          state.currentZoom = Math.min(state.currentZoom * 2, state.maxZoom);
          break;
        case "out":
          state.currentZoom = Math.max(state.currentZoom / 2, 1);
          break;
      }
    },
  }
})

export const SpectrogramActions = spectroSlice.actions;

export default spectroSlice.reducer;
