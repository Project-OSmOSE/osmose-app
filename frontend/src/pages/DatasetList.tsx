import React, { useState, useEffect } from 'react';
import Toast, { ToastMsg } from '../components/Toast.tsx';
import '../css/modal.css';
import ReactDOM from "react-dom";
import { ModalNewData } from "../components/ModalNewData.tsx";
import { ListToImport, List, useDatasetsAPI } from "../utils/api/dataset.tsx";


const DatasetList: React.FC = () => {
  const [toastMsg, setToastMsg] = useState<ToastMsg | undefined>(undefined);
  const [datasets, setDatasets] = useState<List>([]);
  const [datasetsToImport, setDatasetsToImport] = useState<ListToImport>([]);
  const [error, setError] = useState<any | undefined>(undefined);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const datasetService = useDatasetsAPI();


  useEffect(() => {
    let isCancelled  = false;

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
    datasetService.list().then(setDatasets).catch(setError);
  }, [datasetsToImport]);

  useEffect(() => {
    if (error) {
      let toastMessage;

      try {
        toastMessage = JSON.parse(error?.response.text)
      } catch (jsonError) {
        console.debug(error)
        toastMessage = error?.response?.text ?? error.message
      }
      setToastMsg({ msg: toastMessage, lvl: "danger" })
    } else {
      setToastMsg(undefined)
    }
  }, [error]);

  const importDatasets = async (datasets: ListToImport) => {
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
      <Toast toastMsg={ toastMsg }></Toast>
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
          <ModalNewData startImport={ (datasets) => importDatasets(datasets) }
                        onClose={ () => setIsImportModalOpen(false) }
                        newData={ datasetsToImport }/>,
          document.body) }
      </p>
    </div>
  );
};

export default DatasetList;
