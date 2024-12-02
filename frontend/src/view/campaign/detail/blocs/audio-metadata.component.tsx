import React, { useEffect } from 'react';
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { downloadOutline } from "ionicons/icons";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import { useAppSelector } from '@/slices/app.ts';
import { selectCurrentCampaign } from '@/service/campaign/function.ts';
import { useDownloadAudioMetadataMutation, useListAudioMetadataQuery } from '@/service/dataset/audio-metatada';
import { useToast } from '@/services/utils/toast.ts';
import { getErrorMessage } from '@/service/function.ts';
import './blocs.css';

interface Props {
  isOwner: boolean;
}

export const DetailCampaignAudioMetadata: React.FC<Props> = ({ isOwner }) => {
  // State
  const campaign = useAppSelector(selectCurrentCampaign);

  // Service
  const { presentError, dismiss: dismissToast } = useToast();
  const { data: metadata, error } = useListAudioMetadataQuery({ campaignID: campaign!.id });
  const [ download, { error: downloadError } ] = useDownloadAudioMetadataMutation()

  useEffect(() => {
    return () => {
      dismissToast()
    }
  }, [])

  useEffect(() => {
    if (error) presentError(getErrorMessage(error));
  }, [ error ]);

  useEffect(() => {
    if (downloadError) presentError(getErrorMessage(downloadError));
  }, [ downloadError ]);

  return (
    <div id="audio-meta" className="bloc">
      <div className="head-bloc">
        <h5>Audio files metadata</h5>

        <div className="buttons">
          { !metadata && <IonSpinner/> }
          { isOwner && metadata && metadata.length > 0 && <IonButton color="primary"
                                                                     onClick={ () => download(campaign!) }>
              <IonIcon icon={ downloadOutline } slot="start"/>
              Audio files metadata (csv)
          </IonButton> }
          { metadata && metadata.length === 0 && "No metadata" }
        </div>
      </div>

      { metadata && metadata.length > 0 && <Table columns={ metadata.length + 1 } isFirstColumnSticky={ true }>
          <TableHead isFirstColumn={ true }>Sample bits</TableHead>
        { metadata.map(c => <TableContent key={ c.id }>{ c.sample_bits }</TableContent>) }
          <TableDivider/>

          <TableHead isFirstColumn={ true }>Channel count</TableHead>
        { metadata.map(c => <TableContent key={ c.id }>{ c.channel_count }</TableContent>) }
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
    </div>
  )
}
