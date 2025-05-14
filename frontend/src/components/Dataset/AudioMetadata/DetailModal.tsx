import React, { Fragment, useCallback, useEffect } from "react";
import { useToast } from "@/service/ui";
import {
  Modal,
  ModalFooter,
  ModalHeader,
  Table,
  TableContent,
  TableDivider,
  TableHead,
  WarningText
} from "@/components/ui";
import styles from "./styles.module.scss";
import { IonButton, IonIcon, IonNote, IonSpinner } from "@ionic/react";
import { getErrorMessage } from "@/service/function.ts";
import { downloadOutline } from "ionicons/icons";
import { ID } from "@/service/type.ts";
import { useModal } from "@/service/ui/modal.ts";
import { createPortal } from "react-dom";
import { AudioMetadataAPI } from "@/service/api/audio-metadata.ts";


export const AudioMetadataModalButton: React.FC<{
  canDownload: boolean;
  filename: string;
  datasetID?: ID;
  campaignID?: ID;
}> = (params) => {
  const modal = useModal()
  return <Fragment>
    <IonButton fill='outline' color='medium' className='ion-text-wrap' onClick={ modal.toggle }>
      Audio metadata
    </IonButton>
    { modal.isOpen && createPortal(<AudioMetadataModal onClose={ modal.toggle } { ...params }/>, document.body) }
  </Fragment>
}

export const AudioMetadataModal: React.FC<{
  onClose?(): void;
  canDownload: boolean;
  filename: string;
  datasetID?: ID;
  campaignID?: ID;
}> = ({ onClose, canDownload = false, campaignID, datasetID, filename }) => {
  const { data: metadata, isLoading, error: loadingError } = AudioMetadataAPI.endpoints.listAudioMetadata.useQuery({ campaignID, datasetID });
  const [ download, { error: downloadError } ] = AudioMetadataAPI.endpoints.downloadAudioMetadata.useMutation()
  const toast = useToast();

  useEffect(() => {
    if (downloadError) toast.presentError(downloadError);
  }, [ downloadError ]);

  const onDownload = useCallback(() => {
    download({ filename, datasetID, campaignID })
  }, [ filename, datasetID, campaignID ])

  return (
    <Modal onClose={ onClose } className={ styles.modal }>
      <ModalHeader onClose={ onClose } title='Audio metadata'/>

      { isLoading && <IonSpinner/> }

      { loadingError && <WarningText>{ getErrorMessage(loadingError) }</WarningText> }

      { metadata && metadata.length === 0 && <IonNote>No metadata</IonNote> }

      { metadata && metadata.length > 0 && <Table columns={ metadata.length + 1 } isFirstColumnSticky={ true }>
          <TableHead isFirstColumn={ true }>Files subtypes</TableHead>
        { metadata.map(c => <TableContent key={ c.id }>{ c.files_subtypes.join(', ') }</TableContent>) }
          <TableDivider/>

          <TableHead isFirstColumn={ true }>Channel count</TableHead>
        { metadata.map(c => <TableContent key={ c.id }>{ c.channel_count }</TableContent>) }
          <TableDivider/>

          <TableHead isFirstColumn={ true }>Files count</TableHead>
        { metadata.map(c => <TableContent key={ c.id }>{ c.audio_file_count }</TableContent>) }
          <TableDivider/>

          <TableHead isFirstColumn={ true }>Files durations</TableHead>
        { metadata.map(c => <TableContent key={ c.id }>{ c.audio_file_dataset_duration }</TableContent>) }
          <TableDivider/>

          <TableHead isFirstColumn={ true }>Start</TableHead>
        { metadata.map(c => <TableContent key={ c.id }>{ new Date(c.start).toLocaleString() }</TableContent>) }
          <TableDivider/>

          <TableHead isFirstColumn={ true }>End</TableHead>
        { metadata.map(c => <TableContent key={ c.id }>{ new Date(c.end).toLocaleString() }</TableContent>) }
          <TableDivider/>

          <TableHead isFirstColumn={ true }>Dataset sample rate</TableHead>
        { metadata.map(c => <TableContent key={ c.id }>{ c.dataset_sr / 1000 } kHz</TableContent>) }
          <TableDivider/>
      </Table> }

      <ModalFooter>
        { canDownload && metadata && metadata.length > 0 && (
          <IonButton fill='outline' onClick={ onDownload }>
            <IonIcon icon={ downloadOutline } slot='start'/>
            Download metadata (csv)
          </IonButton>
        ) }
      </ModalFooter>
    </Modal>
  )
}
