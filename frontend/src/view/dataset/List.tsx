import React, { Fragment, useMemo } from 'react';
import { IonNote, IonSpinner } from "@ionic/react";
import { getErrorMessage } from '@/service/function.ts';
import { Table, TableContent, TableDivider, TableHead, WarningText } from "@/components/ui";
import { ImportDatasetButton } from "@/components/Dataset";
import styles from './styles.module.scss'
import { AudioMetadataModalButton } from "@/components/Dataset/AudioMetadata";
import { SpectrogramMetadataModalButton } from "@/components/Dataset/SpectrogramMetadata";
import { DatasetAPI } from "@/service/api/dataset.ts";


export const DatasetList: React.FC = () => {

  // Services
  const { data: datasets, error: datasetsError, isLoading } = DatasetAPI.endpoints.listDataset.useQuery()
  const sortedDatasets = useMemo(() =>
      [ ...(datasets ?? []) ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [datasets]
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ _, { isLoading: isImportInProgress } ] = DatasetAPI.endpoints.importDataset.useMutation()

  return <Fragment>
    <h2>Datasets</h2>

    <div className={ styles.buttons }>
      <ImportDatasetButton/>
    </div>

    { (isLoading || isImportInProgress) && <IonSpinner/> }
    { datasetsError && <WarningText>{ getErrorMessage(datasetsError) }</WarningText> }

    { sortedDatasets && sortedDatasets.length === 0 && <IonNote color='medium'>No datasets</IonNote> }
    { sortedDatasets && sortedDatasets.length > 0 && <Table columns={ 9 } className={ styles.table }>
        <TableHead topSticky isFirstColumn={ true }>Name</TableHead>
        <TableHead topSticky>Created at</TableHead>
        <TableHead topSticky>Type</TableHead>
        <TableHead topSticky>File type</TableHead>
        <TableHead topSticky>Number of files</TableHead>
        <TableHead topSticky>Start date</TableHead>
        <TableHead topSticky>End date</TableHead>
        <TableHead topSticky>Audio</TableHead>
        <TableHead topSticky>Spectrogram</TableHead>
        <TableDivider/>

      { sortedDatasets.map(d => <Fragment key={ d.id }>
        <TableContent isFirstColumn={ true }>{ d.name }</TableContent>
        <TableContent>{ new Date(d.created_at).toLocaleDateString() }</TableContent>
        <TableContent>{ d.type }</TableContent>
        <TableContent>{ d.files_type }</TableContent>
        <TableContent>{ d.files_count }</TableContent>
        <TableContent>{ new Date(d.start_date).toDateString() }</TableContent>
        <TableContent>{ new Date(d.end_date).toDateString() }</TableContent>
        <TableContent>
          <AudioMetadataModalButton filename={ d.name.replaceAll(' ', '_') + '_audio_metadata.csv' }
                                    datasetID={ d.id }
                                    canDownload={ true }/>
        </TableContent>
        <TableContent>
          <SpectrogramMetadataModalButton filename={ d.name.replaceAll(' ', '_') + '_spectrogram_configuration.csv' }
                                          datasetID={ d.id }
                                          canDownload={ true }/>
        </TableContent>
        <TableDivider/>
      </Fragment>) }
    </Table> }
  </Fragment>
};