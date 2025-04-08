import { useParams } from "react-router-dom";
import { CampaignAPI } from "@/service/campaign";
import { AnnotationResultAPI } from "@/service/campaign/result";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { useCallback, useEffect, useMemo } from "react";
import { CHUNK_SIZE } from "@/service/campaign/result/import/type.ts";
import { getErrorMessage } from "@/service/function.ts";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { ResultImportSlice } from "@/service/campaign/result/import/slice.ts";

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
    if (!campaign) return;
    if (file.state !== 'loaded') return;
    if (uploadInfo.state !== 'uploading' && !bypassUploadState) return;
    const chunkRows = rows.slice(start, start + CHUNK_SIZE);
    console.log('UPLOAD CHUNK > ', uploadInfo)
    doImport({
      campaignID: campaign.id,
      datasetName: campaign.datasets![0],
      detectors_map: detectorsMap,
      data: [ file.header, ...chunkRows ],
      force_datetime: force?.force_datetime,
      force_max_frequency: force?.force_max_frequency,
    })
  }, [ campaign, doImport, detectorsMap, rows, uploadInfo ])

  const upload = useCallback((force?: {
    force_datetime?: boolean;
    force_max_frequency?: boolean;
  }) => {
    console.log('UPLOAD > ', force)
    if (file.state !== 'loaded') return;
    if (uploadInfo.state === 'uploading') return;
    const isDatetimeForced =  force?.force_datetime !== undefined ? force.force_datetime : (uploadInfo.state === 'initial' ? false : uploadInfo.force_datetime)
    const isMaxFrequencyForced =  force?.force_max_frequency !== undefined ? force.force_max_frequency : (uploadInfo.state === 'initial' ? false : uploadInfo.force_max_frequency)
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
