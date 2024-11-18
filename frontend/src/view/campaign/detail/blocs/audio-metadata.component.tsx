import React, { useEffect, useState } from 'react';
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { AnnotationCampaign, AudioMetadatum, useAudioMetadataAPI } from "@/services/api";
import { downloadOutline } from "ionicons/icons";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import './blocs.css';

interface Props {
  isOwner: boolean;
  campaign: AnnotationCampaign;
  setError: (e: any) => void
}

export const DetailCampaignAudioMetadata: React.FC<Props> = ({ campaign, setError, isOwner }) => {
  // State
  const [ metadata, setMetadata ] = useState<Array<AudioMetadatum> | undefined>();

  // Service
  const audioMetadataService = useAudioMetadataAPI();

  useEffect(() => {
    let isCancelled = false;

    audioMetadataService.list(undefined, {
      annotation_campaign: campaign.id
    })
      .then(setMetadata)
      .catch(e => {
        if (isCancelled) return;
        setError(e);
      })

    return () => {
      isCancelled = true;
      audioMetadataService.abort();
    }
  }, [ campaign.id ])

  return (
    <div id="audio-meta" className="bloc">
      <div className="head-bloc">
        <h5>Audio files metadata</h5>

        <div className="buttons">
          { !metadata && <IonSpinner/> }
          { isOwner && metadata && metadata.length > 0 && <IonButton color="primary"
                                                                     onClick={ () => audioMetadataService.downloadForCampaign(campaign) }>
              <IonIcon icon={ downloadOutline } slot="start"/>
              Audio files metadata (csv)
          </IonButton> }
          { metadata && metadata.length === 0 && "No metadata" }
        </div>
      </div>

      { metadata && metadata.length > 0 && <Table columns={ metadata.length + 1 } isFirstColumnSticky={ true }>
          <TableHead isFirstColumn={ true }>Files subtypes</TableHead>
        { metadata.map(c => <TableContent key={ c.id }>{ c.files_subtypes.join(', ') }</TableContent>) }
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
