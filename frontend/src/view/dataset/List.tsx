import React, { Fragment, useEffect, useState } from 'react';
import { createPortal } from "react-dom";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import {
  ImportDataset,
  useImportDatasetMutation,
  useListDatasetForImportQuery,
  useListDatasetQuery
} from '@/service/dataset';
import { getErrorMessage } from '@/service/function.ts';
import styles from './dataset.module.scss'
import { downloadOutline } from 'ionicons/icons';
import { Table, TableContent, TableDivider, TableHead } from '@/components/table/table.tsx';
import { ImportDatasetModal } from '@/view/dataset/ImportModal.tsx';
import { useToast } from "@/service/ui";


export const DatasetList: React.FC = () => {
  const [ isImportModalOpen, setIsImportModalOpen ] = useState(false);

  // Services
  const { data: datasets, refetch: refetchDatasets, error: datasetsError, isLoading } = useListDatasetQuery()
  const {
    data: datasetsToImport,
    refetch: refetchDatasetsToImport,
    error: datasetsToImportError
  } = useListDatasetForImportQuery()
  const [ doImportDatasets, { isLoading: isImportInProgress } ] = useImportDatasetMutation()
  const { presentError, dismiss: dismissToast } = useToast();


  const importDatasets = async (importList: Array<ImportDataset>) => {
    doImportDatasets(importList).unwrap()
      .then(() => {
        refetchDatasetsToImport();
        refetchDatasets();
        setIsImportModalOpen(false);
      })
      .catch(error => presentError(getErrorMessage(error)))
  }

  useEffect(() => {
    return () => {
      dismissToast()
    }
  }, []);

  useEffect(() => {
    if (datasetsError) presentError(getErrorMessage(datasetsError));
  }, [ datasetsError ]);

  useEffect(() => {
    if (datasetsToImportError) presentError(getErrorMessage(datasetsToImportError));
  }, [ datasetsToImportError ]);

  function openImportModal() {
    if (!datasetsToImport) return;
    setIsImportModalOpen(!isImportModalOpen)
  }

  return (
    <div className={ styles.listPage }>
      <h2>Datasets</h2>

      <div className={ styles.buttons }>
        <IonButton color='primary' fill='outline'
                   disabled={ !datasetsToImport }
                   data-tooltip={ datasetsToImport ? undefined : "The datasets.csv doesn't contains new datasets" }
                   onClick={ openImportModal }>
          <IonIcon icon={ downloadOutline } slot='start'/>
          Import dataset
        </IonButton>
      </div>

      { (isLoading || isImportInProgress) && <IonSpinner/> }

      { datasets && <Table columns={ 7 } className={ styles.table }>
          <TableHead isFirstColumn={ true }>Name</TableHead>
          <TableHead>Created at</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>File type</TableHead>
          <TableHead>Number of files</TableHead>
          <TableHead>Start date</TableHead>
          <TableHead>End date</TableHead>
          <TableDivider/>

        { datasets.map(d => <Fragment key={ d.id }>
          <TableContent isFirstColumn={ true }>{ d.name }</TableContent>
          <TableContent>{ new Date(d.created_at).toLocaleDateString() }</TableContent>
          <TableContent>{ d.type }</TableContent>
          <TableContent>{ d.files_type }</TableContent>
          <TableContent>{ d.files_count }</TableContent>
          <TableContent>{ new Date(d.start_date).toLocaleDateString() }</TableContent>
          <TableContent>{ new Date(d.end_date).toLocaleDateString() }</TableContent>
          <TableDivider/>
        </Fragment>) }
      </Table> }

      { isImportModalOpen && createPortal(
        <ImportDatasetModal startImport={ (datasets) => importDatasets(datasets) }
                            onClose={ () => setIsImportModalOpen(false) }
                            isLoading={ isImportInProgress }
                            newData={ datasetsToImport ?? [] }/>,
        document.body) }
    </div>
  )
};