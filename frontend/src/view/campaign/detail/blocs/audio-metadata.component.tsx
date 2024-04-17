import React from 'react';
import { IonButton, IonIcon } from "@ionic/react";
import { AnnotationCampaignRetrieveCampaign, useAnnotationCampaignAPI } from "@/services/api";
import { downloadOutline } from "ionicons/icons";
import { AudioMetadatum } from "@/types/process-metadata/audio.ts";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import './blocs.css';

interface Props {
  campaign: AnnotationCampaignRetrieveCampaign;
  audioMetadata: Array<AudioMetadatum>;
}

export const DetailCampaignAudioMetadata: React.FC<Props> = ({
                                                               campaign,
                                                               audioMetadata
                                                             }) => {
  const campaignService = useAnnotationCampaignAPI();

  return (
    <div id="audio-meta" className="bloc">
      <div className="head-bloc">
        <h5>Audio files metadata</h5>

        <div className="buttons">
          <IonButton color="primary"
                     onClick={ () => campaignService.downloadAudioMeta(campaign) }>
            <IonIcon icon={ downloadOutline } slot="start"/>
            Audio files metadata (csv)
          </IonButton>
        </div>
      </div>

      <Table columns={ audioMetadata.length + 1 } isFirstColumnSticky={ true }>
        <TableHead isFirstColumn={ true }>Sample bits</TableHead>
        { audioMetadata.map(c => <TableContent key={ c.id }>{ c.sample_bits }</TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>Channel count</TableHead>
        { audioMetadata.map(c => <TableContent key={ c.id }>{ c.channel_count }</TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>Start</TableHead>
        { audioMetadata.map(c => <TableContent key={ c.id }>{ c.start.toLocaleString() }</TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>End</TableHead>
        { audioMetadata.map(c => <TableContent key={ c.id }>{ c.end.toLocaleString() }</TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>Dataset sample rate</TableHead>
        { audioMetadata.map(c => <TableContent key={ c.id }>{ c.dataset_sr }</TableContent>) }
        <TableDivider/>
      </Table>
    </div>
  )
}
