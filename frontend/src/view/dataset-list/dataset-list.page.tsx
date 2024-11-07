import React, { useState, useEffect, Fragment } from 'react';
import { createPortal } from "react-dom";
import { DatasetList as List, DatasetListToImport, useDatasetsAPI } from "@/services/api";
import { ModalNewDataset } from "./modal-new-dataset.component.tsx";
import { IonButton, IonSpinner } from "@ionic/react";
import { useToast } from "@/services/utils/toast.ts";
import '../../css/modal.css';


export const DatasetList: React.FC = () => {
  const [ datasets, setDatasets ] = useState<List | undefined>();
  const [ datasetsToImport, setDatasetsToImport ] = useState<DatasetListToImport | undefined>();
  const [ isImportModalOpen, setIsImportModalOpen ] = useState(false);
  const [ isLoading, setIsLoading ] = useState<boolean>(true);

  // Services
  const datasetService = useDatasetsAPI();
  const toast = useToast();


  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    Promise.all([
      datasetService.list(),
      datasetService.listToImport(),
    ]).then(([ d, dToImport ]) => {
      setDatasets(d);
      setDatasetsToImport(dToImport);
    }).catch(e => {
      if (isCancelled) return;
      toast.presentError(e);
    }).finally(() => !isCancelled && setIsLoading(false))

    return () => {
      isCancelled = true;
      datasetService.abort();
      setIsLoading(false);
      toast.dismiss();
    };
  }, []);


  const importDatasets = async (datasets: DatasetListToImport) => {
    setIsLoading(true);
    datasetService.importDatasets(datasets)
      .then((data: DatasetListToImport) => {
        const remainingDatasets = datasetsToImport?.filter(newDataset => {
          return data.some(importedDataset => importedDataset.name !== newDataset.name)
        });
        setDatasetsToImport(remainingDatasets);
        toast.dismiss();
        setIsImportModalOpen(false);
        return datasetService.list()
      })
      .then(setDatasets)
      .catch(toast.presentError.bind(toast))
      .finally(() => setIsLoading(false));
  }

  return (
    <Fragment>
      <h1 className="text-center">Datasets</h1>

      { datasetsToImport && <div className="d-flex justify-content-center">
          <IonButton color={ "primary" }
                     disabled={ !datasetsToImport || datasetsToImport.length === 0 }
                     onClick={ () => setIsImportModalOpen(!isImportModalOpen) }>
              Import
          </IonButton>

        { isImportModalOpen && createPortal(
          <ModalNewDataset startImport={ (datasets) => importDatasets(datasets) }
                           onClose={ () => setIsImportModalOpen(false) }
                           isLoading={ isLoading }
                           newData={ datasetsToImport ?? [] }/>,
          document.body) }
      </div> }

      { datasets && <DatasetTable datasets={ datasets }/> }

      { isLoading && <Spinner/> }
    </Fragment>
  )

};

const Spinner: React.FC = () => <div className="d-flex justify-content-center"><IonSpinner/></div>

const DatasetTable: React.FC<{ datasets: List }> = ({ datasets }) => {
  if (datasets.length === 0) return <div className="d-flex justify-content-center"><p>No datasets</p></div>
  return <table className="table table-bordered">
    <thead>
    <tr>
      <th>Name</th>
      <th>Created at</th>
      <th>Type</th>
      <th>File type</th>
      <th>Number of files</th>
      <th>Start Date</th>
      <th>End Date</th>
    </tr>
    </thead>
    <tbody>
    { datasets?.map((dataset) => {
      return (
        <tr key={ dataset.id }>
          <td>{ dataset.name }</td>
          <td>{ new Date(dataset.created_at).toDateString() }</td>
          <td>{ dataset.type }</td>
          <td>{ dataset.files_type }</td>
          <td>{ dataset.files_count }</td>
          <td>{ new Date(dataset.start_date).toDateString() }</td>
          <td>{ new Date(dataset.end_date).toDateString() }</td>
        </tr>
      );
    }) }
    </tbody>
  </table>
}