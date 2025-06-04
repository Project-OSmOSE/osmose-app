import { createSlice } from "@reduxjs/toolkit";

type SettingsSliceState = {
  disableSpectrogramResize: boolean,
}

function updateState(state: SettingsSliceState,
                     field: keyof SettingsSliceState,
                     newValue: any) {
  state[field] = newValue;
  localStorage.setItem(field, JSON.stringify(newValue));
}

export const SettingsSlice = createSlice({
  name: "settings",
  initialState: {
    disableSpectrogramResize: localStorage.getItem('disableSpectrogramResize') === 'true',
  } as SettingsSliceState,
  reducers: {
    allowSpectrogramResize: (state) => updateState(state, 'disableSpectrogramResize', false),
    disableSpectrogramResize: (state) => updateState(state, 'disableSpectrogramResize', true),
  }
})