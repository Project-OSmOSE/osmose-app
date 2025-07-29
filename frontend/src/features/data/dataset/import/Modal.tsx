import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./styles.module.scss";
import { useSearchedData } from "@/service/ui/search.ts";
import {
  IonButton,
  IonCheckbox,
  IonIcon,
  IonNote,
  IonSearchbar,
  IonSpinner,
  SearchbarInputEventDetail
} from "@ionic/react";
import { Modal, ModalFooter, ModalHeader } from "@/components/ui";
import { cloudUploadOutline } from "ionicons/icons";
import { DatasetAPI, ImportDataset } from "@/features/data/dataset/api";
import { DatasetCheckbox } from "./DatasetCheckbox.tsx";
import { DatasetImportHelpButton } from "./HelpButton.tsx";

export const ImportDatasetModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {

  const { data: availableDatasets, isLoading } = DatasetAPI.endpoints.getAvailableDatasetsForImport.useQuery()

  const [ search, setSearch ] = useState<string | undefined>();
  const [ selectAllDatasets, setSelectAllDatasets ] = useState<boolean>(false);
  const [ datasetSelection, setDatasetSelection ] = useState<Map<string, string[]>>(new Map());
  const datasetSelectionCount = useMemo(() => {
    return [ ...datasetSelection.values() ].filter(analysis => analysis.length > 0).length;
  }, [ datasetSelection ])
  const analysisSelectionCount = useMemo(() => {
    return [ ...datasetSelection.values() ].flatMap(a => a).length;
  }, [ datasetSelection ])

  const searchDatasets = useSearchedData({
    items: availableDatasets ?? [],
    search,
    sortField: 'name',
    mapping: (dataset: ImportDataset) => [ dataset.name, dataset.path, ...(dataset.analysis ?? []).flatMap(a => a ? [ a.name, a.path ] : []) ]
  })

  const searchbar = useRef<HTMLIonSearchbarElement | null>(null)

  useEffect(() => {
    searchbar.current?.getInputElement().then(input => input.focus())
  }, [ searchbar.current ]);

  useEffect(() => {
    if (!availableDatasets) return setSelectAllDatasets(false);
    if (availableDatasets.length > datasetSelectionCount) return setSelectAllDatasets(false);
    if (availableDatasets.flatMap(d => d.analysis).length > analysisSelectionCount) return setSelectAllDatasets(false);
    setSelectAllDatasets(true)
  }, [ datasetSelectionCount, analysisSelectionCount, availableDatasets ]);

  const onSearchUpdated = useCallback((event: CustomEvent<SearchbarInputEventDetail>) => {
    setSearch(event.detail.value ?? undefined);
  }, [])

  const onSearchCleared = useCallback(() => {
    setSearch(undefined);
  }, [])

  const toggleSelectAllDatasets = useCallback(() => {
    if (isLoading || !availableDatasets) return;
    if (selectAllDatasets) {
      setDatasetSelection(new Map<string, string[]>());
    } else {
      setDatasetSelection(new Map<string, string[]>(availableDatasets.map(d => [ d.name, d.analysis.map(a => a.name) ])));
    }
    setSelectAllDatasets(!selectAllDatasets)
  }, [ isLoading, availableDatasets, selectAllDatasets ])

  const onDatasetSelected = useCallback((dataset: ImportDataset) => {
    setDatasetSelection(prevState => {
      console.debug(prevState)
      if (prevState.get(dataset.name)) {
        return new Map<string, string[]>(
          [ ...prevState.entries() ]
            .map(([ datasetName, analysis ]) => {
              if (datasetName !== dataset.name) return [ datasetName, analysis ];
              return [
                datasetName,
                [ ...new Set([ ...analysis, ...dataset.analysis.map(a => a.name) ]) ]
              ]
            })
        )
      } else {
        return new Map<string, string[]>([ ...prevState.entries(), [ dataset.name, dataset.analysis.map(a => a.name) ] ])
      }
    });
  }, [ isLoading, availableDatasets, selectAllDatasets, setDatasetSelection ])

  const onDatasetUnSelected = useCallback((dataset: ImportDataset) => {
    setDatasetSelection(prevState => {
      return new Map<string, string[]>(
        [ ...prevState.entries() ]
          .map(([ datasetName, analysis ]) => {
            if (datasetName !== dataset.name) return [ datasetName, analysis ];
            return [
              datasetName,
              analysis.filter((a: string) => !dataset.analysis.map(a => a.name).includes(a))
            ]
          })
      )
    });
  }, [ isLoading, availableDatasets, selectAllDatasets ])

  return (
    <Modal onClose={ onClose }
           className={ [ styles.importModal, (!isLoading && !!availableDatasets && availableDatasets.length > 0) ? styles.filled : 'empty' ].join(' ') }>
      <ModalHeader title='Import a dataset'
                   onClose={ onClose }/>

      { isLoading && <IonSpinner/> }

      { !isLoading && !!availableDatasets && availableDatasets.length == 0 &&
          <IonNote>There is no new dataset or analysis</IonNote> }

      { !isLoading && !!availableDatasets && availableDatasets.length > 0 && <Fragment>

          <IonSearchbar ref={ searchbar } onIonInput={ onSearchUpdated } onIonClear={ onSearchCleared }/>

          <div className={ styles.content }>
              <div className={ styles.allDatasets } onClick={ toggleSelectAllDatasets }>
                  <IonCheckbox checked={ selectAllDatasets } disabled={ isLoading }/>
                  <span><b>All datasets</b><IonNote>{ availableDatasets && search && ` (${ searchDatasets.length }/${ availableDatasets.length } datasets)` }</IonNote></span>
              </div>

            { searchDatasets.map(d => <DatasetCheckbox key={ [ d.name, d.path ].join(' ') }
                                                       dataset={ d }
                                                       search={ search }
                                                       disabled={ isLoading }
                                                       selected={ datasetSelection.get(d.name) }
                                                       onSelect={ onDatasetSelected }
                                                       onUnSelect={ onDatasetUnSelected }/>) }
          </div>

          <ModalFooter className={ styles.buttons }>
              <DatasetImportHelpButton/>

            { isLoading && <IonSpinner/> }
            { datasetSelectionCount > 0 &&
                <p>{ datasetSelectionCount } Dataset selected ({ analysisSelectionCount } analysis)</p> }
              <IonButton onClick={ console.debug } disabled={ isLoading } color='primary' fill='solid'>
                  <IonIcon slot='start' icon={ cloudUploadOutline }/>
                  Import datasets
              </IonButton>
          </ModalFooter>

      </Fragment> }
    </Modal>
  )
}
