import React, { useEffect } from "react";
import { useToast } from "@/service/ui";
import { getErrorMessage } from "@/service/function.ts";
import { Modal, ModalFooter, ModalHeader, WarningText } from "@/components/ui";
import { IonButton, IonIcon, IonNote, IonSpinner } from "@ionic/react";
import { downloadOutline } from "ionicons/icons";
import { AudioMetadataAPI } from "@/service/dataset/audio-metatada";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import styles from './modal.module.scss';
import { useParams } from "react-router-dom";
import { CampaignAPI, useHasAdminAccessToCampaign } from "@/service/campaign";

export const AudioModal: React.FC<{
  onClose?(): void;
}> = ({ onClose }) => {
  const { id: campaignID } = useParams<{ id: string }>();
  const { data: campaign } = CampaignAPI.useRetrieveQuery(campaignID);
  const { data: metadata, isLoading, error: loadingError } = AudioMetadataAPI.useListQuery({ campaignID });
  const [ download, { error: downloadError } ] = AudioMetadataAPI.useDownloadMutation()
  const toast = useToast();
  const { hasAdminAccess } = useHasAdminAccessToCampaign(campaign)

  useEffect(() => {
    if (downloadError) toast.presentError(downloadError);
  }, [ downloadError ]);

  function onDownload() {
    if (campaign) download(campaign)
  }

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
      </Table>
      }

      <ModalFooter>
        { hasAdminAccess && metadata && metadata.length > 0 && (
          <IonButton fill='outline' onClick={ onDownload }>
            <IonIcon icon={ downloadOutline } slot='start'/>
            Download metadata (csv)
          </IonButton>
        ) }
      </ModalFooter>
    </Modal>
  )
}
