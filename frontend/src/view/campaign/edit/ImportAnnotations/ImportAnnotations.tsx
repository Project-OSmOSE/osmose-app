import React, { Fragment, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useToast } from "@/service/ui";
import { CampaignAPI } from "@/service/campaign";
import { IonButton, IonNote, IonSpinner } from "@ionic/react";
import styles from '../edit.module.scss';
import { AnnotationResultAPI } from "@/service/campaign/result";
import { FileSelectorContent } from "@/view/campaign/edit/ImportAnnotations/FileSelectorContent.tsx";
import { DetectorsContent } from "@/view/campaign/edit/ImportAnnotations/DetectorsContent.tsx";
import { DetectorsConfigContent } from "@/view/campaign/edit/ImportAnnotations/DetectorsConfigContent.tsx";
import { useAppSelector } from "@/service/app.ts";
import { Progress } from "@/components/ui";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const CHUNK_SIZE = 200;

export const ImportAnnotations: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const toast = useToast();
  const { id: campaignID } = useParams<{ id: string }>();
  const {
    data: campaign,
  } = CampaignAPI.useRetrieveQuery(campaignID);
  const [ importResults ] = AnnotationResultAPI.useImportMutation()

  // File
  const { file, detectors } = useAppSelector(state => state.resultImport)
  const [ isSubmitting, setIsSubmitting ] = useState<boolean>(false);
  const [ errorSubmitting, setErrorSubmitting ] = useState<any | undefined>();
  const [ uploadDuration, setUploadDuration ] = useState<number>(0);
  const [ totalUploaded, setTotalUploaded ] = useState<number>(0);
  const totalLines = useMemo(() => file.state === 'loaded' ? file.rows.length : 0, [ file ])
  const remainingTime = useMemo(() => {
    const remainingLines = totalLines - totalUploaded;
    return remainingLines * uploadDuration / totalUploaded;
  }, [ totalLines, totalUploaded, uploadDuration ])

  // Navigation
  const page = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!campaign || !(location.state as any)?.fromCreateCampaign) return;
    toast.presentSuccess(`Campaign ${ campaign.name }' was successfully created`)
  }, [ location, campaign ]);
  const back = useCallback(() => {
    if (campaign) history.push(`/annotation-campaign/${ campaign.id }`)
  }, [ campaign ])

  // Submit
  const submit = useCallback(async (arg?: true | MouseEvent) => {
    const force = arg === true;
    if (!campaign || file.state !== 'loaded') return;
    setIsSubmitting(true);
    try {
      const chunkCount = Math.ceil(totalLines / CHUNK_SIZE);
      const detectors_map: { [key in string]: { detector: string, configuration: string } } = {}
      for (const d of detectors.selection) {
        const config = detectors.mapToConfiguration[d];
        detectors_map[d] = {
          detector: detectors.mapToKnown[d]?.name ?? d,
          configuration: typeof config === 'string' ? config : config?.configuration ?? '',
        }
      }
      for (let chunk = totalUploaded / CHUNK_SIZE; chunk < chunkCount; chunk++) {
        const start = Date.now()
        const lowIndex = CHUNK_SIZE * chunk;
        const highIndex = CHUNK_SIZE * (chunk + 1);
        const rows = file.rows.slice(lowIndex, highIndex);
        await importResults({
          campaignID: campaign.id,
          datasetName: campaign.datasets![0],
          detectors_map,
          data: [ file.header, ...rows ],
          force
        }).unwrap()
        setTotalUploaded(prev => prev + rows.length);
        setUploadDuration(prev => prev + (Date.now() - start))
      }
      setIsSubmitting(false)
      if ((location.state as any)?.fromCreateCampaign) {
        history.push(`/annotation-campaign/${ campaign.id }/edit-annotators`, { fromImportAnnotations: true })
      } else {
        back()
      }
    } catch (e) {
      setIsSubmitting(false)
      if ((e as any).status === 400) {
        const response_errors = (e as FetchBaseQueryError).data as Array<{ [key in string]: string[] }>
        const outOfFilesError = "This start and end datetime does not belong to any file of the dataset";
        if (!JSON.stringify(response_errors).includes(outOfFilesError)) throw e;
        const count = [ ...JSON.stringify(response_errors).matchAll(new RegExp(outOfFilesError, 'g')) ].length;
        const retry = await toast.presentError(`[${ count } results]: ${ outOfFilesError }`, true);
        if (retry) return submit(true)
      }
      setErrorSubmitting(e)
    }
  }, [])
  useEffect(() => {
    if (errorSubmitting) toast.presentError(errorSubmitting)
  }, [ errorSubmitting ]);

  return (
    <div className={ [styles.page, styles[file.state], detectors.selection.length > 0 ? styles.withConfig : ''].join(' ') } ref={ page }>

      <div className={ styles.title }>
        <h2>Import annotations</h2>
        { campaign && <h5>{ campaign.name }</h5> }
      </div>

      <FileSelectorContent/>
      <DetectorsContent/>
      <DetectorsConfigContent/>

      { isSubmitting && file.state === 'loaded' && <Fragment>
          <Progress value={ Math.trunc(totalUploaded / totalLines) } total={ 100 }/>
        { uploadDuration > 0 && totalLines > totalUploaded &&
            <IonNote>Estimated remaining time: { remainingTime }</IonNote> }
      </Fragment> }

      <div className={ styles.buttons }>
        <IonButton color='medium' fill='outline' onClick={ back }>
          Back to campaign
        </IonButton>
        { isSubmitting && <IonSpinner/> }
        { campaign?.usage === 'Check' && <IonButton disabled={ isSubmitting } onClick={ submit }>
            Import
        </IonButton> }
      </div>
    </div>
  )
}

