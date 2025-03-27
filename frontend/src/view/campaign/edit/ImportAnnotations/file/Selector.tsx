import React, { DragEvent, Fragment, useCallback, useMemo, useState } from "react";
import styles from "../../edit.module.scss";
import importStyles from "../importAnnotations.module.scss";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { WarningMessage } from "@/components/warning/warning-message.component.tsx";
import { getErrorMessage } from "@/service/function.ts";
import { ACCEPT_CSV_MIME_TYPE } from "@/consts/csv.ts";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { loadFile, ResultImportSlice } from "@/service/campaign/result/import";
import { useParams } from "react-router-dom";
import { CampaignAPI } from "@/service/campaign";
import { cloudUploadOutline, refreshOutline } from "ionicons/icons";
import { FormBloc } from "@/components/form";
import { LoadInformation } from "./LoadInformation.tsx";
import { FileErrorDescription } from "./ErrorDescription.tsx";

export const FileSelector: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>();
  const {
    isFetching: isFetchingCampaign,
    error: errorLoadingCampaign
  } = CampaignAPI.useRetrieveQuery(campaignID);

  const { file, upload } = useAppSelector(state => state.resultImport)
  const dispatch = useAppDispatch();

  // Drag N Drop
  const [ isDraggingHover, setIsDraggingHover ] = useState<boolean>(false);
  const onDragStart = useCallback((event: DragEvent) => {
    setIsDraggingHover(true)
    event.preventDefault();
  }, [])
  const onDragEnd = useCallback((event: DragEvent) => {
    setIsDraggingHover(false)
    event.preventDefault();
  }, [])
  const handleInput = useCallback((files?: FileList) => {
    const _file = files?.item(0);
    if (!_file) return;
    if (!ACCEPT_CSV_MIME_TYPE.includes(_file.type)) return;
    dispatch(loadFile(_file))
  }, [])
  const onDragZoneClick = useCallback(() => {
    if (file.state !== 'initial') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ACCEPT_CSV_MIME_TYPE;
    input.click();
    input.oninput = () => handleInput(input.files ?? undefined)
  }, [file.state])
  const onDragZoneDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (file.state !== 'initial') return;
    setIsDraggingHover(false);
    handleInput(event.dataTransfer.files)
  }, [])

  const reset = useCallback(() => {
    dispatch(ResultImportSlice.actions.clear())
  }, [])

  const dragNDropContent = useMemo(() => {
    switch (file.state) {
      case 'initial':
        return <Fragment><IonIcon icon={ cloudUploadOutline }/> Import annotations (csv)</Fragment>
      case 'loading':
        return <IonSpinner color="primary"/>
      case 'error':
      case 'loaded':
        return <Fragment>
          <p>{ file.name }</p>
          <IonButton onClick={ reset } disabled={ upload.state !== 'initial' } className='ion-text-wrap'>Reset<IonIcon
            icon={ refreshOutline }
            slot="end"/></IonButton>
        </Fragment>
    }
  }, [ file.state, upload.state ])

  if (isFetchingCampaign) return <IonSpinner/>
  if (errorLoadingCampaign)
    return <WarningMessage>Fail loading campaign:<br/>{ getErrorMessage(errorLoadingCampaign) }</WarningMessage>

  return <FormBloc className={ styles.importBloc }>

    <LoadInformation/>

    {/* Drag N Drop zone */ }
    <div children={ dragNDropContent }
         className={ [ importStyles.dragNDropZone, importStyles[file.state], isDraggingHover ? importStyles.dragging : '' ].join(' ') }
         onClick={ onDragZoneClick } onDrop={ onDragZoneDrop }
         onDragOver={ onDragStart } onDragEnter={ onDragStart } onDragLeave={ onDragEnd } onDragEnd={ onDragEnd }/>

    <FileErrorDescription/>

  </FormBloc>
}