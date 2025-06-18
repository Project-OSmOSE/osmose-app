import React, { Fragment, useCallback, useEffect, useMemo } from "react";
import { useToast } from "@/service/ui";
import { getErrorMessage } from "@/service/function.ts";
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
import { IonButton, IonIcon, IonNote, IonSpinner } from "@ionic/react";
import { downloadOutline } from "ionicons/icons";
import { LinearScale, MultiLinearScale } from "@/service/dataset/spectrogram-configuration/scale";
import { IoArrowForwardOutline } from "react-icons/io5";
import styles from './styles.module.scss';
import { useModal } from "@/service/ui/modal.ts";
import { createPortal } from "react-dom";
import { ID } from "@/service/type.ts";
import { SpectrogramConfigurationAPI } from "@/service/api/spectrogram-configuration.ts";


export const SpectrogramMetadataModalButton: React.FC<{
  canDownload: boolean;
  filename: string;
  datasetID?: ID;
  campaignID?: ID;
}> = (params) => {
  const modal = useModal()
  return <Fragment>
    <IonButton fill='outline' color='medium' className='ion-text-wrap' onClick={ modal.toggle }>
      Spectrogram configuration
    </IonButton>
    { modal.isOpen && createPortal(<SpectrogramMetadataModal onClose={ modal.toggle } { ...params }/>, document.body) }
  </Fragment>
}


export const SpectrogramMetadataModal: React.FC<{
  onClose?(): void;
  canDownload: boolean;
  filename: string;
  datasetID?: ID;
  campaignID?: ID;
}> = ({ onClose, canDownload = false, campaignID, datasetID, filename }) => {
  const {
    data: configurations,
    isLoading,
    error: loadingError
  } = SpectrogramConfigurationAPI.endpoints.listSpectrogramConfiguration.useQuery({ campaignID, datasetID })
  const [ download, { error: downloadError } ] = SpectrogramConfigurationAPI.endpoints.downloadSpectrogramConfiguration.useMutation()
  const toast = useToast();

  useEffect(() => {
    if (downloadError) toast.presentError(downloadError);
  }, [ downloadError ]);

  const onDownload = useCallback(() => {
    download({ filename, datasetID, campaignID })
  }, [ filename, datasetID, campaignID ])

  return (
    <Modal onClose={ onClose } className={ styles.modal }>
      <ModalHeader onClose={ onClose } title='Spectrogram configuration'/>

      { isLoading && <IonSpinner/> }

      { loadingError && <WarningText>{ getErrorMessage(loadingError) }</WarningText> }

      { configurations && configurations.length === 0 && <IonNote>No spectrogram configuration</IonNote> }

      { configurations && configurations.length > 0 && (
        <div className={ styles.table }>
          <Table columns={ configurations.length + 1 }
                 isFirstColumnSticky={ true }>
            <TableHead isFirstColumn={ true }>NFFT</TableHead>
            { configurations.map(c => <TableContent key={ c.id }>{ c.nfft }</TableContent>) }
            <TableDivider/>

            <TableHead isFirstColumn={ true }>Window</TableHead>
            { configurations.map(c => <TableContent key={ c.id }>
              { c.window_size } { c.window_type && `(${ c.window_type.name })` }
            </TableContent>) }
            <TableDivider/>

            <TableHead isFirstColumn={ true }>Overlap</TableHead>
            { configurations.map(c => <TableContent key={ c.id }>{ c.overlap }</TableContent>) }
            <TableDivider/>

            <TableHead isFirstColumn={ true }>Colormap</TableHead>
            { configurations.map(c => <TableContent key={ c.id }>{ c.colormap }</TableContent>) }
            <TableDivider/>

            <TableHead isFirstColumn={ true }>Zoom level</TableHead>
            { configurations.map(c => <TableContent key={ c.id }>{ c.zoom_level }</TableContent>) }
            <TableDivider/>

            <TableHead isFirstColumn={ true }>Dynamic (min/max)</TableHead>
            { configurations.map(c => <TableContent key={ c.id }>
              { c.dynamic_min } / { c.dynamic_max }
            </TableContent>) }
            <TableDivider/>

            <TableHead isFirstColumn={ true }>Spectrogram duration</TableHead>
            { configurations.map(c => <TableContent key={ c.id }>
              { c.spectro_duration }
            </TableContent>) }
            <TableDivider/>

            <TableHead isFirstColumn={ true }>Data normalization</TableHead>
            { configurations.map(c => <TableContent key={ c.id }>
              { c.data_normalization }
            </TableContent>) }
            <TableDivider/>

            { configurations.some(c => c.data_normalization === 'zscore') && <Fragment>
                <TableHead isFirstColumn={ true }>Zscore duration</TableHead>
              { configurations.map(c => <TableContent key={ c.id }>
                { c.zscore_duration }
              </TableContent>) }
                <TableDivider/>
            </Fragment> }

            { configurations.some(c => c.data_normalization === 'instrument') && <Fragment>
                <TableHead isFirstColumn={ true }>Sensitivity (dB)</TableHead>
              { configurations.map(c => <TableContent key={ c.id }>
                { c.sensitivity_dB }
              </TableContent>) }
                <TableDivider/>
            </Fragment> }

            { configurations.some(c => c.data_normalization === 'instrument') && <Fragment>
                <TableHead isFirstColumn={ true }>Gain (dB)</TableHead>
              { configurations.map(c => <TableContent key={ c.id }>
                { c.gain_dB }
              </TableContent>) }
                <TableDivider/>
            </Fragment> }

            { configurations.some(c => c.data_normalization === 'instrument') && <Fragment>
                <TableHead isFirstColumn={ true }>Peak voltage</TableHead>
              { configurations.map(c => <TableContent key={ c.id }>
                { c.peak_voltage }
              </TableContent>) }
                <TableDivider/>
            </Fragment> }

            <TableHead isFirstColumn={ true }>High pass filter minimum frequency</TableHead>
            { configurations.map(c => <TableContent key={ c.id }>
              { c.hp_filter_min_freq } Hz
            </TableContent>) }
            <TableDivider/>

            <TableHead isFirstColumn={ true }>Spectrogram normalisation</TableHead>
            { configurations.map(c => <TableContent key={ c.id }>
              { c.spectro_normalization }
            </TableContent>) }
            <TableDivider/>

            <TableHead isFirstColumn={ true }>Resolution</TableHead>
            { configurations.map(c => <TableContent key={ c.id }>
              { c.frequency_resolution } Hz
              { c.temporal_resolution !== null && <Fragment>
                  <br/>
                { c.temporal_resolution } s
              </Fragment> }
            </TableContent>) }
            <TableDivider/>

            <TableHead isFirstColumn={ true }>Audio file dataset overlap</TableHead>
            { configurations.map(c => <TableContent key={ c.id }>
              { c.audio_file_dataset_overlap }
            </TableContent>) }
            <TableDivider/>

            { configurations.some(c => c.linear_frequency_scale || c.multi_linear_frequency_scale) && <Fragment>
                <TableHead isFirstColumn={ true }>Frequency scale</TableHead>
              { configurations.map(c => <TableContent key={ c.id }>
                <ScaleCellContent linear_frequency_scale={ c.linear_frequency_scale }
                                  multi_linear_frequency_scale={ c.multi_linear_frequency_scale }/>
                { c.peak_voltage }
              </TableContent>) }
                <TableDivider/>
            </Fragment> }
          </Table>
        </div>)
      }

      <ModalFooter>
        { canDownload && configurations && configurations.length > 0 && (
          <IonButton fill='outline' onClick={ onDownload }>
            <IonIcon icon={ downloadOutline } slot='start'/>
            Download configurations (csv)
          </IonButton>
        ) }
      </ModalFooter>
    </Modal>
  )
}


const ScaleCellContent: React.FC<{
  linear_frequency_scale: LinearScale | null,
  multi_linear_frequency_scale: MultiLinearScale | null,
}> = ({ linear_frequency_scale, multi_linear_frequency_scale }) => {
  if (linear_frequency_scale) return <LinearScaleLine scale={ linear_frequency_scale }/>
  if (multi_linear_frequency_scale)
    return <Fragment>
      <p>{ multi_linear_frequency_scale.name }</p>
      { multi_linear_frequency_scale.inner_scales.map((scale, id) => <LinearScaleLine scale={ scale }
                                                                                      allScales={ multi_linear_frequency_scale.inner_scales }
                                                                                      key={ id }/>) }
    </Fragment>
  return <Fragment/>
}

const LinearScaleLine: React.FC<{
  scale: LinearScale,
  allScales?: Array<LinearScale>
}> = ({
        scale,
        allScales = []
      }) => {
  const rangePercent = useMemo(() => {
    const min = Math.max(0, ...allScales.filter(s => s.ratio < scale.ratio).map(s => s.ratio))
    const percent = (scale.ratio - min) * 100;
    return Math.round(percent);
  }, [ scale.ratio, allScales ])

  return <p>
    { scale.name } { scale.min_value }Hz <IoArrowForwardOutline/> { scale.max_value }Hz ({ rangePercent }%)
  </p>
}