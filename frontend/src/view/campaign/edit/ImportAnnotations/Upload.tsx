import React, { Fragment, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { Progress } from "@/components/ui";
import { IonButton, IonNote, IonSpinner } from "@ionic/react";
import { formatTime } from "@/service/dataset/spectrogram-configuration/scale";
import { WarningMessage } from "@/components/warning/warning-message.component.tsx";
import { ResultImportSlice, useUploadResultChunk } from "@/service/campaign/result/import";
import styles from "@/view/campaign/edit/edit.module.scss";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { CampaignAPI } from "@/service/campaign";

export const Upload: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>();
  const { data: campaign } = CampaignAPI.useRetrieveQuery(campaignID);
  const { upload: uploadInfo } = useAppSelector(state => state.resultImport)
  const location = useLocation();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const back = useCallback(() => {
    if (campaign) history.push(`/annotation-campaign/${ campaign.id }`)
  }, [ campaign ])

  const onUploaded = useCallback(() => {
    if ((location.state as any)?.fromCreateCampaign) {
      history.push(`/annotation-campaign/${ campaignID }/edit-annotators`, { fromImportAnnotations: true })
    } else {
      back()
    }
  }, [ campaignID, location, history, back ])

  const { upload } = useUploadResultChunk(onUploaded)
  const reset = useCallback(() => {
    dispatch(ResultImportSlice.actions.clear())
  }, [])

  const buttons = useMemo(() => <div className={ styles.buttons }>
    <IonButton color='medium' fill='outline' onClick={ back }>
      Back to campaign
    </IonButton>
    { uploadInfo.state === 'uploading' && <IonSpinner/> }
    <IonButton disabled={ uploadInfo.state === 'uploading' } onClick={ () => upload() }>
      Import
    </IonButton>
  </div>, [ upload, uploadInfo, back ])

  if (campaign?.usage !== 'Check') return <Fragment/>
  if (uploadInfo.state === 'initial') return buttons
  return <Fragment>
    <Progress label='Upload' value={ uploadInfo.uploaded } total={ uploadInfo.total }/>

    { uploadInfo.state === 'uploading' && uploadInfo.duration > 0 && uploadInfo.total > uploadInfo.uploaded && uploadInfo.remainingDurationEstimation &&
        <IonNote>Estimated remaining
            time: { formatTime(uploadInfo.remainingDurationEstimation / 1000) } minutes</IonNote> }

    { uploadInfo.state === 'error' && <WarningMessage>
        <p>{ uploadInfo.error }</p>

      { uploadInfo.canForce ?
        <IonButton color='warning' fill='clear' onClick={ () => upload(true) }>
          Import anyway
        </IonButton> : <IonButton color='primary' fill='clear' onClick={ reset }>
          Reset
        </IonButton> }
    </WarningMessage> }

    { buttons }
  </Fragment>
}