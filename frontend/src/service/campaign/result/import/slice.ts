import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  CHUNK_SIZE,
  EmptyCSVError,
  ImportSliceState,
  UnreadableFileError,
  UnsupportedCSVError,
  WrongMIMETypeError
} from "./type";
import { ACCEPT_CSV_MIME_TYPE, ACCEPT_CSV_SEPARATOR, IMPORT_ANNOTATIONS_COLUMNS } from "@/consts/csv.ts";
import { formatCSVToTable } from "@/services/utils/format.tsx";
import { Detector, DetectorConfiguration } from "@/service/campaign/detector";
import { AnnotationResultAPI } from "@/service/campaign/result";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { useParams } from "react-router-dom";
import { CampaignAPI } from "@/service/campaign";
import { getErrorMessage } from "@/service/function.ts";
import { QueryStatus } from "@reduxjs/toolkit/query";

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

export const useUploadResultChunk = (onFulfilled: () => void) => {
  const { id: campaignID } = useParams<{ id: string }>();
  const { data: campaign } = CampaignAPI.useRetrieveQuery(campaignID);
  const [ doImport, {
    error,
    originalArgs,
    reset,
    fulfilledTimeStamp,
    startedTimeStamp,
    status
  } ] = AnnotationResultAPI.useImportMutation()
  const { file, detectors, upload: uploadInfo } = useAppSelector(state => state.resultImport)
  const dispatch = useAppDispatch()
  const [ force, setForce ] = useState<boolean>(false);

  const rows = useMemo(() => {
    if (file.state === 'loaded')
      return file.rows.filter(r => r.some(cell => detectors.selection.includes(cell)));
    return [];
  }, [ file, detectors.selection ])

  const detectorsMap = useMemo(() => {
    const detectors_map: { [key in string]: { detector: string, configuration: string } } = {}
    for (const d of detectors.selection) {
      const detector = detectors.mapToKnown[d]?.name ?? d;
      const config = detectors.mapToConfiguration[detector];
      detectors_map[d] = {
        detector,
        configuration: typeof config === 'string' ? config : config?.configuration ?? '',
      }
    }
    return detectors_map
  }, [ detectors ])

  const uploadChunk = useCallback(() => {
    if (!campaign) return;
    if (file.state !== 'loaded') return;
    if (uploadInfo.state !== 'uploading') return;
    doImport({
      campaignID: campaign.id,
      datasetName: campaign.datasets![0],
      detectors_map: detectorsMap,
      data: [ file.header, ...rows.slice(uploadInfo.uploaded + 1, uploadInfo.uploaded + 1 + CHUNK_SIZE) ],
      force
    })
  }, [ doImport, detectorsMap ])

  const upload = useCallback((force?: boolean) => {
    if (file.state !== 'loaded') return;
    if (uploadInfo.state === 'uploading') return;
    if (force !== undefined) setForce(force);
    dispatch(ResultImportSlice.actions.updateUpload({
      state: 'uploading',
      uploaded: uploadInfo.state === 'initial' ? 0 : uploadInfo.uploaded,
      total: rows.length,
      duration: uploadInfo.state === 'initial' ? 0 : uploadInfo.duration,
      remainingDurationEstimation: undefined
    }))
    uploadChunk()
  }, [ uploadInfo, rows, detectorsMap ])

  // Update duration and remainingDurationEstimation
  useEffect(() => {
    console.log('TIMESTAMP >>', startedTimeStamp, fulfilledTimeStamp)
    if (uploadInfo.state !== 'uploading') return;
    if (!fulfilledTimeStamp || !startedTimeStamp) return;
    const duration = uploadInfo.duration + (fulfilledTimeStamp - startedTimeStamp);
    dispatch(ResultImportSlice.actions.updateUpload({
      ...uploadInfo,
      duration,
      remainingDurationEstimation: (uploadInfo.total - uploadInfo.uploaded) * duration / uploadInfo.uploaded,
    }))
  }, [ startedTimeStamp, fulfilledTimeStamp ]);

  // Manage chunk import failed
  useEffect(() => {
    if (uploadInfo.state !== 'uploading') return;
    if (error) dispatch(ResultImportSlice.actions.updateUpload({
      ...uploadInfo,
      state: 'error',
      error: getErrorMessage(error) ?? 'Unknown error',
      canForce: (error as any).canForce
    }))
  }, [ error ]);

  // Manage chunk import fulfilled
  useEffect(() => {
    if (uploadInfo.state !== 'uploading') return;
    if (status !== QueryStatus.fulfilled) return;
    if (!originalArgs) return;
    const uploaded = uploadInfo.uploaded + originalArgs.data.length - 1; // Don't count headers
    const state = uploadInfo.total > uploaded ? 'uploading' : 'fulfilled';
    dispatch(ResultImportSlice.actions.updateUpload({
      ...uploadInfo,
      uploaded,
      state,
    }))
    reset();
    if (state === 'uploading') uploadChunk();
  }, [ status, originalArgs ]);

  return { upload }
}
