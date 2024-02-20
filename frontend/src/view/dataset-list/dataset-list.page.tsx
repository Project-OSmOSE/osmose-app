import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom";
import { useDatasetsAPI, DatasetListToImport, DatasetList as List } from "../../services/api";
import '../../css/modal.css';
import { Toast, ToastMessage } from '../global-components';
import { ModalNewDataset } from "./modal-new-dataset.component.tsx";


export const DatasetList: React.FC = () => {
  const [toastMsg, setToastMsg] = useState<ToastMessage | undefined>(undefined);
  const [datasets, setDatasets] = useState<List>([]);
  const [datasetsToImport, setDatasetsToImport] = useState<DatasetListToImport>([]);
  const [error, setError] = useState<any | undefined>(undefined);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const datasetService = useDatasetsAPI();


  useEffect(() => {
    let isCancelled = false;

    datasetService.listToImport().then(setDatasetsToImport).catch(e => {
      if (isCancelled) return;
      setError(e);
    });
    return () => {
      isCancelled = true;
      datasetService.abort();
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    datasetService.list().then(setDatasets).catch(e => {
      console.info(e, isCancelled)
      setError(e);
    });
    return () => {
      isCancelled = true;
      datasetService.abort();
    };
  }, [datasetsToImport]);

  useEffect(() => {
    if (error) {
      console.log('error to toast', error)
      let toastMessage;

      try {
        toastMessage = JSON.parse(error?.response.text)
      } catch (jsonError) {
        toastMessage = error?.response?.text ?? error.message
      }
      setToastMsg({ messages: [toastMessage], level: "danger" })
    } else {
      setToastMsg(undefined)
    }
  }, [error]);

  const importDatasets = async (datasets: DatasetListToImport) => {
    datasetService.importDatasets(datasets).then(data => {
      const remainingDatasets = datasetsToImport.filter(newDataset =>
        data.some(importedDataset => importedDataset.name !== newDataset.name)
      );
      setDatasetsToImport(remainingDatasets);
      setError(undefined)
    }).catch(setError).finally(() => setIsImportModalOpen(false));
  }

  return (
    <div className="col-sm-9 border rounded" id="content">
      <h1 className="text-center">Datasets</h1>
      <Toast toastMessage={ toastMsg }></Toast>
      <table className="table table-bordered">
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
        { datasets.map((dataset) => {
          return (
            <tr key={ dataset.id }>
              <td>{ dataset.name }</td>
              <td>{ dataset.created_at.toDateString() }</td>
              <td>{ dataset.type }</td>
              <td>{ dataset.files_type }</td>
              <td>{ dataset.files_count }</td>
              <td>{ dataset.start_date.toDateString() }</td>
              <td>{ dataset.end_date.toDateString() }</td>
            </tr>
          );
        }) }
        </tbody>
      </table>
      <p className="text-center">
        <button className="btn btn-primary"
                disabled={ datasetsToImport.length === 0 }
                onClick={ () => setIsImportModalOpen(!isImportModalOpen) }>
          Import
        </button>

        { isImportModalOpen && ReactDOM.createPortal(
          <ModalNewDataset startImport={ (datasets) => importDatasets(datasets) }
                           onClose={ () => setIsImportModalOpen(false) }
                           newData={ datasetsToImport }/>,
          document.body) }
      </p>
    </div>
  );
};
