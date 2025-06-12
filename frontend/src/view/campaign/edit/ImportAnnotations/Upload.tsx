import React, { Fragment, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { Progress, WarningText } from "@/components/ui";
import { IonButton, IonNote, IonSpinner } from "@ionic/react";
import { formatTime } from "@/service/dataset/spectrogram-configuration/scale";
import styles from "@/view/campaign/edit/edit.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useUploadAnnotationChunk } from "@/service/api/annotation.ts";
import { useListPhasesForCurrentCampaign, useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";
import { ImportAnnotationsSlice } from "@/service/slices/import-annotations.ts";

export const Upload: React.FC = () => {
  const { campaign } = useRetrieveCurrentCampaign();
  const { phase } = useRetrieveCurrentPhase()
  const { verificationPhase } = useListPhasesForCurrentCampaign()
  const { upload: uploadInfo, detectors, file } = useAppSelector(state => state.resultImport)
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const back = useCallback(() => {
    if (campaign && verificationPhase) navigate(`/annotation-campaign/${ campaign.id }/phase/${ verificationPhase.id }`)
    else if (campaign && phase) navigate(`/annotation-campaign/${ campaign.id }/phase/${ phase.id }`)
  }, [ campaign, verificationPhase, phase ])

  const onUploaded = useCallback(() => {
    if ((location.state as any)?.fromCreateCampaign) {
      navigate(`/annotation-campaign/${ campaign?.id }/edit-annotators`, { state: { fromImportAnnotations: true } })
    } else {
      back()
    }
  }, [ campaign?.id, location, navigate, back ])

  const { upload } = useUploadAnnotationChunk(onUploaded)
  const reset = useCallback(() => {
    dispatch(ImportAnnotationsSlice.actions.clear())
  }, [])

  const buttons = useMemo(() => {
    const allSelectedAnnotatorsHasConfiguration = detectors.selection.map(detector => {
      const name = detectors.mapToKnown[detector]?.name ?? detector
      let config = detectors.mapToConfiguration[name]
      if (!config) return false;
      if (typeof config !== 'string') config = config.configuration
      return !!config;
    }).reduce((a, b) => a && b, true)
    const canImport = file.state === 'loaded'
      && detectors.selection.length > 0
      && allSelectedAnnotatorsHasConfiguration
      && uploadInfo.state !== 'uploading';
    return <div className={ styles.buttons }>
      <IonButton color='medium' fill='outline' onClick={ back }>
        Back to campaign
      </IonButton>
      { uploadInfo.state === 'uploading' && <IonSpinner/> }
      <IonButton disabled={ !canImport }
                 onClick={ () => upload() }>
        Import
      </IonButton>
    </div>
  }, [ upload, uploadInfo, detectors, back, file ])

  if (phase?.phase !== 'Annotation') return <Fragment/>
  if (uploadInfo.state === 'initial') return buttons
  return <Fragment>
    <Progress label='Upload' value={ uploadInfo.uploaded } total={ uploadInfo.total }/>

    { uploadInfo.state === 'uploading' && uploadInfo.duration > 0 && uploadInfo.total > uploadInfo.uploaded && uploadInfo.remainingDurationEstimation &&
        <IonNote>Estimated remaining
            time: { formatTime(uploadInfo.remainingDurationEstimation / 1000) } minutes</IonNote> }

    { uploadInfo.state === 'error' && <WarningText>
        <p>{ uploadInfo.error }</p>

      { uploadInfo.canForceDatetime &&
          <IonButton color='warning' fill='clear' onClick={ () => upload({ force_datetime: true }) }>Import
              anyway</IonButton> }
      { uploadInfo.canForceMaxFrequency &&
          <IonButton color='warning' fill='clear' onClick={ () => upload({ force_max_frequency: true }) }>Import
              anyway</IonButton> }
      { !(uploadInfo.canForceDatetime || uploadInfo.canForceMaxFrequency) &&
          <IonButton color='primary' fill='clear' onClick={ reset }>Reset</IonButton> }
    </WarningText> }

    { buttons }
  </Fragment>
}