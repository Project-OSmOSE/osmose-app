import { createSlice } from "@reduxjs/toolkit";


export type AudioSlice = {
  time: number;
  stopTime?: number;
  playbackRate: number;
  isPaused: boolean;
}

export const audioSlice = createSlice({
  name: 'Audio',
  initialState: {
    time: 0,
    playbackRate: 1.0,
    isPaused: true,
  } as AudioSlice,
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
    setPlaybackRate: (state, action: { payload: number }) => {
      state.playbackRate = action.payload;
    },
  }
})

export const {
  onPlay,
  onPause,
  setTime,
  setPlaybackRate
} = audioSlice.actions;

export default audioSlice.reducer;
