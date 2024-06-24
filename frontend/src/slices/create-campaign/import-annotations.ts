import { createCampaignActions } from "@/slices/create-campaign/index.ts";
import { AnnotationsCSVRow } from "@/types/csv-import-annotations.ts";
import { createSlice } from "@reduxjs/toolkit";

type Status = 'empty' | 'loading' | 'errors' | 'edit-detectors' | 'edit-detectors-config' | 'done';
export type ImportAnnotationsError = {
  type: ImportAnnotationsErrorType;
  error: Error | string | undefined;
}
export type ImportAnnotationsErrorType =
  'unrecognised file' |
  'contains unrecognized dataset' |
  'inconsistent max confidence';

interface State {
  datasetName?: string;
  rows: Array<AnnotationsCSVRow>;
  errors: Array<ImportAnnotationsError>;
  status: Status;
  filename?: string;
  areDetectorsChosen: boolean;
}

export const importAnnotationsSlice = createSlice({
  name: 'Import annotations',

  initialState: {
    rows: [],
    errors: [],
    status: 'empty',
    areDetectorsChosen: false,
  } as State,

  reducers: {
    setStatus: (state, action: { payload: Status }) =>{
      state.status = action.payload
    },
    setErrors: (state, action: { payload: Array<ImportAnnotationsError> }) =>{
      state.errors = action.payload
    },
    setRows: (state, action: { payload: Array<AnnotationsCSVRow> }) => {
      state.rows = action.payload
    },
    setFilename: (state, action: { payload: string }) => {
      state.filename = action.payload
    },
    setAreDetectorsChosen: (state, action: { payload: boolean }) => {
      state.areDetectorsChosen = action.payload
    },

    clear: (state) => {
      state.status = 'empty';
      state.filename = undefined;
      state.errors = [];
      state.rows = [];
      state.areDetectorsChosen = false;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(createCampaignActions.updateDataset,
      (state, action) => ({
        ...state,
        datasetName: action.payload?.name
      })
    );
  },
})


export const importAnnotationsReducer = importAnnotationsSlice.reducer;
export const importAnnotationsActions = importAnnotationsSlice.actions;
