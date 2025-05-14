import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { EmptyCSVError, ImportSliceState, UnreadableFileError, UnsupportedCSVError, WrongMIMETypeError } from "./type";
import { ACCEPT_CSV_MIME_TYPE, ACCEPT_CSV_SEPARATOR, IMPORT_ANNOTATIONS_COLUMNS } from "@/consts/csv.ts";
import { formatCSVToTable } from "@/services/utils/format.tsx";
import { Detector, DetectorConfiguration } from "@/service/types";

export const loadFile = createAsyncThunk(
  'campaign/loadFile',
  async (file: File) => {
    if (!ACCEPT_CSV_MIME_TYPE.includes(file.type)) throw new WrongMIMETypeError(file.type);

    const rows = await new Promise<string[][]>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onerror = () => reject(new UnreadableFileError())
      reader.onload = (event) => {
        const result = event.target?.result;
        if (!result || typeof result !== 'string') {
          reject(new UnsupportedCSVError())
          return;
        }

        resolve(formatCSVToTable(result, ACCEPT_CSV_SEPARATOR))
      }
    })

    if (rows.length === 0) throw new EmptyCSVError();
    const missingColumns = [];
    const headers = rows[0]
    for (const column of IMPORT_ANNOTATIONS_COLUMNS.required) {
      if (!headers.includes(column)) missingColumns.push(column);
    }
    if (missingColumns.length > 0)
      throw new Error(`Missing columns: ${ missingColumns.join(', ') }`);

    return rows;
  }
)

export const ResultImportSlice = createSlice({
  name: 'resultImport',
  initialState: {
    file: {
      state: 'initial'
    },
    detectors: {
      selection: [],
      mapToKnown: {},
      mapToConfiguration: {},
    },
    upload: {
      state: 'initial'
    }
  } satisfies ImportSliceState as ImportSliceState,
  reducers: {
    clear: (state) => {
      state.file = { state: 'initial' };
      state.detectors = {
        selection: [],
        mapToKnown: {},
        mapToConfiguration: {},
      };
      state.upload = { state: 'initial' };
    },
    selectDetector: (state, action: { payload: string }) => {
      state.detectors.selection = [ ...new Set([ ...state.detectors.selection, action.payload ]) ];
    },
    unselectDetector: (state, action: { payload: string }) => {
      state.detectors.selection = state.detectors.selection.filter(d => d !== action.payload)
    },
    mapDetector: (state, action: { payload: { name: string, detector: Detector | undefined } }) => {
      state.detectors.mapToKnown[action.payload.name] = action.payload.detector;
    },
    mapConfiguration: (state, action: {
      payload: { name: string, configuration: DetectorConfiguration | string | undefined }
    }) => {
      state.detectors.mapToConfiguration[action.payload.name] = action.payload.configuration;
    },
    updateUpload: (state, action: { payload: ImportSliceState['upload'] }) => {
      state.upload = action.payload;
    },
    updateFile: (state) => {
      if (state.upload.state === 'initial') return;
      state.upload.state = 'update file';
      state.file = { state: 'initial' };
    }
  },
  extraReducers: builder => {
    builder.addCase(loadFile.pending, (state, { meta }) => {
      state.file = { state: 'loading', name: meta.arg.name };
    });
    builder.addCase(loadFile.rejected, (state, { error, meta }) => {
      state.file = { state: 'error', error, name: meta.arg.name };
    })
    builder.addCase(loadFile.fulfilled, (state, { payload, meta }) => {
      const header: string[] = payload.shift()!;
      const rows: string[][] = payload;
      const annotatorPosition = header.indexOf('annotator');
      state.file = {
        state: 'loaded',
        name: meta.arg.name,
        type: meta.arg.type,
        header, rows,
        detectors: [ ...new Set(rows.map(r => r[annotatorPosition])) ],
      };
    })
  }
})
