import { API } from "@/service/api/index.ts";
import { AnnotationResult } from "@/service/types";
import { FetchBaseQueryError, QueryStatus } from "@reduxjs/toolkit/query";
import { getErrorMessage } from "@/service/function.ts";
import { ID } from "@/service/type.ts";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { useCallback, useEffect, useMemo } from "react";
import { CHUNK_SIZE } from "@/service/campaign/result/import/type.ts";
import { ResultImportSlice } from "@/service/campaign/result/import";
import { useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";


export const AnnotationAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    importAnnotations: builder.mutation<Array<AnnotationResult>, {
      campaignID: ID,
      phaseID: ID,
      datasetName: string,
      detectors_map: { [key in string]: { detector: string, configuration: string } },
      data: string[][],
      force_datetime?: boolean
      force_max_frequency?: boolean
    }>({
      query: ({ campaignID, phaseID, datasetName, data, force_datetime, force_max_frequency, detectors_map }) => {
        return {
          url: `annotation-result/campaign/${ campaignID }/phase/${ phaseID }/import/`,
          params: {
            dataset_name: datasetName,
            detectors_map: JSON.stringify(detectors_map),
            force_datetime: force_datetime ?? false,
            force_max_frequency: force_max_frequency ?? false,
          },
          method: 'POST',
          body: { data: data.map(row => row.map(cell => `"${ cell }"`).join(',')).join('\n') },
        }
      },
      transformErrorResponse(error: FetchBaseQueryError): unknown {
        const outOfFilesError = "This start and end datetime does not belong to any file of the dataset";
        if (error.status === 400) {
          const errors = error.data as Array<{ [key in string]: string[] }>
          if (JSON.stringify(errors).includes(outOfFilesError)) {
            const count = [ ...JSON.stringify(errors).matchAll(new RegExp(outOfFilesError, 'g')) ].length;
            return {
              status: 400,
              data: `[${ count } results]: ${ outOfFilesError }`,
              canForceDatetime: true
            }
          }
          const max_frequency_errors: { [key in string]: string[] } | undefined = errors.find(e => e["max_frequency"])
          if (max_frequency_errors?.max_frequency.find((e) => e.includes("less than or equal"))) {
            return {
              ...error,
              canForceMaxFrequency: true
            }
          }
        }
        return error
      },
      invalidatesTags: [
        'CampaignPhase',
        'Detector'
      ]
    }),
  })
})

export const useUploadAnnotationChunk = (onFulfilled: () => void) => {
  const { campaign } = useRetrieveCurrentCampaign();
  const { phase } = useRetrieveCurrentPhase();
  const [ doImport, {
    error,
    originalArgs,
    reset,
    fulfilledTimeStamp,
    startedTimeStamp,
    status
  } ] = AnnotationAPI.endpoints.importAnnotations.useMutation()
  const { file, detectors, upload: uploadInfo } = useAppSelector(state => state.resultImport)
  const dispatch = useAppDispatch()

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

  const uploadChunk = useCallback((bypassUploadState?: true, start: number = 0, force?: {
    force_datetime?: boolean;
    force_max_frequency?: boolean;
  }) => {
    if (!campaign || !phase) return;
    if (file.state !== 'loaded') return;
    if (uploadInfo.state !== 'uploading' && !bypassUploadState) return;
    const chunkRows = rows.slice(start, start + CHUNK_SIZE);
    doImport({
      campaignID: campaign.id,
      phaseID: phase.id,
      datasetName: campaign.datasets![0],
      detectors_map: detectorsMap,
      data: [ file.header, ...chunkRows ],
      force_datetime: force?.force_datetime,
      force_max_frequency: force?.force_max_frequency,
    })
  }, [ campaign, phase, doImport, detectorsMap, rows, uploadInfo ])

  const upload = useCallback((force?: {
    force_datetime?: boolean;
    force_max_frequency?: boolean;
  }) => {
    if (file.state !== 'loaded') return;
    if (uploadInfo.state === 'uploading') return;
    const isDatetimeForced = force?.force_datetime !== undefined ? force.force_datetime : (uploadInfo.state === 'initial' ? false : uploadInfo.force_datetime)
    const isMaxFrequencyForced = force?.force_max_frequency !== undefined ? force.force_max_frequency : (uploadInfo.state === 'initial' ? false : uploadInfo.force_max_frequency)
    const newForce = {
      force_datetime: isDatetimeForced,
      force_max_frequency: isMaxFrequencyForced
    }
    dispatch(ResultImportSlice.actions.updateUpload({
      state: 'uploading',
      uploaded: uploadInfo.state === 'initial' ? 0 : uploadInfo.uploaded,
      total: rows.length,
      duration: uploadInfo.state === 'initial' ? 0 : uploadInfo.duration,
      remainingDurationEstimation: undefined,
      force_datetime: isDatetimeForced,
      force_max_frequency: isMaxFrequencyForced
    }))
    uploadChunk(true, uploadInfo.state === 'initial' ? 0 : uploadInfo.uploaded, newForce)
  }, [ uploadInfo, rows, detectorsMap, file ])

  // Update duration and remainingDurationEstimation
  useEffect(() => {
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
      canForceDatetime: (error as any).canForceDatetime,
      canForceMaxFrequency: (error as any).canForceMaxFrequency
    }))
  }, [ error ]);

  // Manage chunk import fulfilled
  useEffect(() => {
    if (uploadInfo.state !== 'uploading') return;
    if (status !== QueryStatus.fulfilled) return;
    if (!originalArgs) return;
    const uploaded = uploadInfo.uploaded + originalArgs.data.length - 1; // Don't count headers
    const state = uploadInfo.total > uploaded ? 'uploading' : 'fulfilled';
    dispatch(ResultImportSlice.actions.updateUpload({ ...uploadInfo, uploaded, state }))
    reset();
    if (state === 'uploading') uploadChunk(undefined, uploaded, {
      force_datetime: uploadInfo.force_datetime,
      force_max_frequency: uploadInfo.force_max_frequency,
    });
    if (state === 'fulfilled') onFulfilled();
  }, [ status, originalArgs ]);

  return { upload }
}
