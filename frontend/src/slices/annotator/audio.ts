import { createSlice } from "@reduxjs/toolkit";


export type AudioSlice = {
  time: number;
  stopTime: number | null;
  playbackRate: number;
  isPaused: boolean;
}

export const InitialState: AudioSlice = {
  time: 0,
  stopTime: null,
  playbackRate: 1.0,
  isPaused: true,
}

export const audioSlice = createSlice({
  name: 'Audio',
  initialState: InitialState,
  reducers: {
    onPlay: (state) => {
      state.isPaused = false;
    },
    onPause: (state) => {
      state.isPaused = true;
    },

    setTime: (state, action: { payload: number }) => {
      state.time = action.payload ?? 0;
    },
    setStopTime: (state, action: { payload: number | null }) => {
      state.stopTime = action.payload;
    },
    setPlaybackRate: (state, action: { payload: number }) => {
      state.playbackRate = action.payload;
    },
  }
})

export const AudioActions = audioSlice.actions;

export default audioSlice.reducer;
