import React, { useState, Fragment } from 'react';
import { createPortal } from "react-dom";
import { ModalNewDataset } from "./modal-new-dataset.component.tsx";
import { IonButton, IonSpinner } from "@ionic/react";
import '../../css/modal.css';
import {
  Dataset,
  ImportDataset,
  useImportDatasetMutation,
  useListDatasetForImportQuery,
  useListDatasetQuery
} from '@/service/dataset';


export const DatasetList: React.FC = () => {
  const [ isImportModalOpen, setIsImportModalOpen ] = useState(false);

  // Services
  const { data: datasets, refetch: refetchDatasets } = useListDatasetQuery()
  const { data: datasetsToImport, refetch: refetchDatasetsToImport } = useListDatasetForImportQuery()
  const [ doImportDatasets, { isLoading } ] = useImportDatasetMutation()


  const importDatasets = async (importList: Array<ImportDataset>) => {
    doImportDatasets(importList).unwrap()
      .then(() => {
        refetchDatasetsToImport();
        refetchDatasets();
        setIsImportModalOpen(false);
      })
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

const DatasetTable: React.FC<{ datasets: Array<Dataset> }> = ({ datasets }) => {
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