import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/service/ui";
import { IonButton, IonCheckbox, IonIcon, IonSearchbar, IonSpinner, SearchbarInputEventDetail } from "@ionic/react";
import { cloudUploadOutline, downloadOutline } from "ionicons/icons";
import { createPortal } from "react-dom";
import { useModal } from "@/service/ui/modal.ts";
import { Modal, ModalFooter, ModalHeader, Table, TableContent, TableDivider, TableHead } from "@/components/ui";
import { DatasetAPI } from "@/service/api/dataset.ts";
import styles from "./styles.module.scss";
import { ImportDataset } from "@/service/types";

export const ImportDatasetButton: React.FC = () => {
  const modal = useModal();
  const toast = useToast();

  const {
    data: datasetsToImport,
    error: datasetsToImportError
  } = DatasetAPI.endpoints.listDatasetForImport.useQuery()
  const [ doImportDatasets, { isLoading: isImportInProgress } ] = DatasetAPI.endpoints.importDataset.useMutation()

  const canImportDatasets = useMemo(() => datasetsToImport && datasetsToImport.length > 0, [ datasetsToImport ]);

  // Updates
  useEffect(() => {
    if (datasetsToImportError) toast.presentError(datasetsToImportError);
  }, [ datasetsToImportError ]);

  const importDatasets = useCallback((importList: Array<ImportDataset>) => {
    doImportDatasets(importList).unwrap()
      .then(() => {
        modal.close();
      })
      .catch(error => toast.presentError(error));
  }, [ toast, doImportDatasets, modal ])

  return <Fragment>
    <IonButton color='primary' fill='outline'
               disabled={ !canImportDatasets }
               style={ { zIndex: 2 } }
               data-tooltip={ canImportDatasets ? undefined : "The datasets.csv doesn't contains new datasets" }
               onClick={ modal.toggle }>
      <IonIcon icon={ downloadOutline } slot='start'/>
      Import dataset
    </IonButton>

    { modal.isOpen && createPortal(
      <ImportDatasetModal startImport={ (datasets) => importDatasets(datasets) }
                          onClose={ modal.close }
                          isLoading={ isImportInProgress }
                          newData={ datasetsToImport ?? [] }/>,
      document.body) }
  </Fragment>
}

export const ImportDatasetModal: React.FC<{
  onClose: () => void,
  newData: Array<ImportDataset>,
  startImport: (datasets: Array<ImportDataset>) => void,
  isLoading: boolean
}> = ({ onClose, newData, startImport, isLoading }) => {
  const [ search, setSearch ] = useState<string | undefined>();
  const [ selectAllDatasets, setSelectAllDatasets ] = useState<boolean>(false);
  const [ datasetSelection, setDatasetSelection ] = useState<Map<string, boolean>>(new Map());

  const filteredDatasets = useMemo(() => {
    return newData.filter(dataset => {
      if (!search) return true;
      if (dataset.name.toLowerCase().includes(search.toLowerCase())) return true;
      return dataset.path.toLowerCase().includes(search.toLowerCase())
    }).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  }, [ newData, search ])

  useEffect(() => {
    setDatasetSelection(new Map<string, boolean>(newData.map(d => [ d.name, false ])));
  }, [ newData ]);

  function onSearchUpdated(event: CustomEvent<SearchbarInputEventDetail>) {
    setSearch(event.detail.value ?? undefined);
  }

  function onSearchCleared() {
    setSearch(undefined);
  }

  function toggleSelectAllDatasets() {
    if (isLoading) return;
    setSelectAllDatasets(!selectAllDatasets)
    setDatasetSelection(new Map<string, boolean>(newData.map(d => [ d.name, !selectAllDatasets ])));
  }

  function toggleDataset(dataset: ImportDataset) {
    if (isLoading) return;
    const newMap = new Map<string, boolean>([ ...datasetSelection.entries() ].map(([ d, checked ]) => {
      if (dataset.name === d) return [ d, !checked ];
      return [ d, checked ];
    }))
    setDatasetSelection(newMap);
    if ([ ...newMap.values() ].every(checked => checked)) setSelectAllDatasets(true);
    else setSelectAllDatasets(false);
  }

  function doImport() {
    if (isLoading) return;
    const validatedDatasets = newData.filter(dataset => datasetSelection.get(dataset.name));
    startImport(validatedDatasets)
  }

  return (
    <Modal onClose={ onClose } className={ styles.importModal }>
      <ModalHeader title='Import a dataset'
                   onClose={ onClose }/>

      <IonSearchbar onIonInput={ onSearchUpdated } onIonClear={ onSearchCleared }/>

      <div className={ styles.tableContainer }>
        <Table columns={ 1 } className={ styles.importModalTable }>
          <TableHead isFirstColumn={ true }>
            <div className={ styles.item } onClick={ toggleSelectAllDatasets }>
              <IonCheckbox checked={ selectAllDatasets } disabled={ isLoading }/>
              <span><b>All datasets</b></span>
            </div>
          </TableHead>
          <TableDivider/>

          { filteredDatasets.map((dataset: ImportDataset, index: number) => <Fragment key={ index }>
            <TableContent isFirstColumn={ true }>
              <div className={ styles.item } onClick={ () => toggleDataset(dataset) }>
                <IonCheckbox checked={ datasetSelection.get(dataset.name) } disabled={ isLoading }/>
                <span>
                <b>{ dataset.name }</b>
                <p>{ dataset.path }</p>
              </span>
              </div>
            </TableContent>
          </Fragment>) }
        </Table>
      </div>


      <ModalFooter className={ styles.buttons }>
        <IonButton onClick={ onClose } disabled={ isLoading } color='medium' fill='outline'>Cancel</IonButton>
        { isLoading && <IonSpinner/> }
        <IonButton onClick={ doImport } disabled={ isLoading } color='primary' fill='solid'>
          <IonIcon slot='start' icon={ cloudUploadOutline }/>
          Import datasets
        </IonButton>
      </ModalFooter>
    </Modal>
  )
}
