import { AnnotationsCSVRow } from "@/types/csv-import-annotations.ts";
import { createSlice } from "@reduxjs/toolkit";
import { Detector, DetectorConfiguration } from '@/service/campaign/detector';

type Status = 'empty' | 'loading' | 'errors' | 'edit-detectors' | 'edit-detectors-config' | 'done';
export type ImportAnnotationsError = {
  type: ImportAnnotationsErrorType;
  error: Error | string | undefined;
}
export type ImportAnnotationsErrorType =
  'unrecognised file' |
  'contains unrecognized dataset';

export interface DetectorSelection {
  initialName: string;
  isNew: boolean;
  knownDetector?: Detector; // isNew = false
  isNewConfiguration?: boolean;
  knownConfiguration?: DetectorConfiguration; // isNewConfiguration = false
  newConfiguration?: string; // isNewConfiguration = true
}

interface State {
  initialRows: Array<Omit<AnnotationsCSVRow, 'detector_item'>>;
  datasetName?: string;
  selectedDatasets?: Array<string>;
  selectedDetectors?: Array<DetectorSelection>;
  filename?: string;
  areDetectorsChosen: boolean;

  errors: Array<ImportAnnotationsError>;
  status: Status;
  campaignID?: number;
}

export const importAnnotationsSlice = createSlice({
  name: 'Import annotations',

  initialState: {
    initialRows: [],

    errors: [],
    status: 'empty',
    areDetectorsChosen: false,
  } as State,

  reducers: {
    setInitialRows: (state, action: { payload: Array<AnnotationsCSVRow> }) => {
      state.initialRows = action.payload
    },
    setDatasetName: (state, action: { payload: string | undefined }) => {
      state.datasetName = action.payload
    },
    setSelectedDetectors: (state, action: { payload: Array<DetectorSelection> }) => {
      state.selectedDetectors = action.payload
      if (!action.payload.every(d => d.isNewConfiguration === undefined))
        state.status = 'edit-detectors-config';
    },
    setSelectedDatasets: (state, action: { payload: Array<string> }) => {
      state.selectedDatasets = action.payload
      state.errors = state.errors
        .filter(e => e.type !== 'contains unrecognized dataset');
      state.status = 'edit-detectors';
    },
    setStatus: (state, action: { payload: Status }) => {
      state.status = action.payload
    },
    setErrors: (state, action: { payload: Array<ImportAnnotationsError> }) => {
      state.errors = action.payload
    },
    setFilename: (state, action: { payload: string }) => {
      state.filename = action.payload
    },

    clear: (state) => {
      state.status = 'empty';
      state.filename = undefined;
      state.errors = [];
      state.initialRows = [];
      state.selectedDetectors = undefined;
      state.selectedDatasets = undefined;
      state.areDetectorsChosen = false;
    },

    setCampaignID: (state, action: { payload: number | undefined }) => {
      state.campaignID = action.payload
    }
  },
})


export const importAnnotationsReducer = importAnnotationsSlice.reducer;
export const importAnnotationsActions = importAnnotationsSlice.actions;
