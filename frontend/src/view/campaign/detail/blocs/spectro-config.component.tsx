import React, { Fragment } from 'react';
import { IonButton, IonIcon } from "@ionic/react";
import { AnnotationCampaignRetrieveCampaign, useAnnotationCampaignAPI } from "@/services/api";
import { downloadOutline } from "ionicons/icons";
import { SpectrogramConfiguration } from "@/types/process-metadata/spectrograms.ts";
import './blocs.css';
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";

interface Props {
  campaign: AnnotationCampaignRetrieveCampaign;
  spectroConfigurations: Array<SpectrogramConfiguration>;
}

export const DetailCampaignSpectroConfig: React.FC<Props> = ({
                                                               campaign,
                                                               spectroConfigurations
                                                             }) => {
  const campaignService = useAnnotationCampaignAPI();

  return (
    <div id="campaign-detail-spectro-config" className="bloc">
      <div className="head-bloc">
        <h5>Spectrogram configuration</h5>

        <div className="buttons">
          <IonButton color="primary"
                     onClick={ () => campaignService.downloadSpectroConfig(campaign) }>
            <IonIcon icon={ downloadOutline } slot="start"/>
            Spectrogram configuration (csv)
          </IonButton>
        </div>
      </div>

      <Table columns={ spectroConfigurations.length + 1 } isFirstColumnSticky={ true }>
        <TableHead isFirstColumn={ true }>NFFT</TableHead>
        { spectroConfigurations.map(c => <TableContent key={ c.id }>{ c.nfft }</TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>Window</TableHead>
        { spectroConfigurations.map(c => <TableContent key={ c.id }>
          { c.window_size } { c.window_type && `(${ c.window_type.name })` }
        </TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>Overlap</TableHead>
        { spectroConfigurations.map(c => <TableContent key={ c.id }>{ c.overlap }</TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>Dataset sample rate</TableHead>
        { spectroConfigurations.map(c => <TableContent key={ c.id }>{ c.dataset_sr / 1000 } kHz</TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>Colormap</TableHead>
        { spectroConfigurations.map(c => <TableContent key={ c.id }>{ c.colormap }</TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>Zoom level</TableHead>
        { spectroConfigurations.map(c => <TableContent key={ c.id }>{ c.zoom_level }</TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>Dynamic (min/max)</TableHead>
        { spectroConfigurations.map(c => <TableContent key={ c.id }>
          { c.dynamic_min } / { c.dynamic_max }
        </TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>Spectrogram duration</TableHead>
        { spectroConfigurations.map(c => <TableContent key={ c.id }>
          { c.spectro_duration }
        </TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>Data normalization</TableHead>
        { spectroConfigurations.map(c => <TableContent key={ c.id }>
          { c.data_normalization }
        </TableContent>) }
        <TableDivider/>

        { spectroConfigurations.some(c => c.data_normalization === 'zscore') && <Fragment>
            <TableHead isFirstColumn={ true }>Zscore duration</TableHead>
          { spectroConfigurations.map(c => <TableContent key={ c.id }>
            { c.zscore_duration }
          </TableContent>) }
            <TableDivider/>
        </Fragment> }

        { spectroConfigurations.some(c => c.data_normalization === 'instrument') && <Fragment>
            <TableHead isFirstColumn={ true }>Sensitivity (dB)</TableHead>
          { spectroConfigurations.map(c => <TableContent key={ c.id }>
            { c.sensitivity_dB }
          </TableContent>) }
            <TableDivider/>
        </Fragment> }

        { spectroConfigurations.some(c => c.data_normalization === 'instrument') && <Fragment>
            <TableHead isFirstColumn={ true }>Gain (dB)</TableHead>
          { spectroConfigurations.map(c => <TableContent key={ c.id }>
            { c.gain_dB }
          </TableContent>) }
            <TableDivider/>
        </Fragment> }

        { spectroConfigurations.some(c => c.data_normalization === 'instrument') && <Fragment>
            <TableHead isFirstColumn={ true }>Peak voltage</TableHead>
          { spectroConfigurations.map(c => <TableContent key={ c.id }>
            { c.peak_voltage }
          </TableContent>) }
            <TableDivider/>
        </Fragment> }

        <TableHead isFirstColumn={ true }>High pass filter minimum frequency</TableHead>
        { spectroConfigurations.map(c => <TableContent key={ c.id }>
          { c.hp_filter_min_freq } kHz
        </TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>Spectrogram normalisation</TableHead>
        { spectroConfigurations.map(c => <TableContent key={ c.id }>
          { c.spectro_normalization }
        </TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>Resolution</TableHead>
        { spectroConfigurations.map(c => <TableContent key={ c.id }>
          { c.frequency_resolution } Hz
          <br/>
          { c.temporal_resolution } s
        </TableContent>) }
        <TableDivider/>

        <TableHead isFirstColumn={ true }>Audio file dataset overlap</TableHead>
        { spectroConfigurations.map(c => <TableContent key={ c.id }>
          { c.audio_file_dataset_overlap }
        </TableContent>) }
        <TableDivider/>
      </Table>
    </div>
  )
}
