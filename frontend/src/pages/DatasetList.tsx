import React, { useState, useEffect } from 'react';
import Toast, { ToastMsg } from '../components/Toast.tsx';
import '../css/modal.css';
import { DatasetApiService } from "../services/API/DatasetApiService.tsx";
import ReactDOM from "react-dom";
import { ModalNewData } from "../components/ModalNewData.tsx";
import { Dataset } from "../services/API/ApiService.data.tsx";


const DatasetList: React.FC = () => {
  const [toastMsg, setToastMsg] = useState<ToastMsg | undefined>(undefined);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [newDatasets, setNewDatasets] = useState<Dataset[]>([]);
  const [error, setError] = useState<any | undefined>(undefined);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    DatasetApiService.shared.getNotImportedDatasets()
      .then(setNewDatasets)
      .catch(setError);
    return () => {
      DatasetApiService.shared.abortRequests();
    };
  }, []);

  useEffect(() => {
    DatasetApiService.shared.list()
      .then(setDatasets)
      .catch(setError);
  }, [newDatasets]);

  useEffect(() => {
    if (error) {
      let toastMessage;

      try {
        toastMessage = JSON.parse(error?.response.text)
      } catch (jsonError) {
        toastMessage = error?.response.text
      }
      setToastMsg({ msg: toastMessage, lvl: "danger" })
    } else {
      setToastMsg(undefined)
    }
  }, [error]);

  const importDatasets = async (datasets: Array<Dataset>) => {
    try {
      const data = await DatasetApiService.shared.postImportDatasets(datasets);

      const remainingDatasets = newDatasets.filter((newDataset) =>
        data.some(
          (importedDataset: Dataset) => importedDataset.name !== newDataset.name
        )
      );
      setNewDatasets(remainingDatasets);
      setError(undefined)
    } catch (e) {
      setError(e);
    } finally {
      setIsImportModalOpen(false);
    }
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
      <p className="text-center">
        <button className="btn btn-primary"
                disabled={ newDatasets.length === 0 }
                onClick={ () => setIsImportModalOpen(!isImportModalOpen) }>
          Import
        </button>

        { isImportModalOpen && ReactDOM.createPortal(
          <ModalNewData
            startImport={ (datasets) => importDatasets(datasets) }
            onClose={ () => setIsImportModalOpen(false) }
            newData={ newDatasets }/>,
          document.body) }
      </p>
    </div>
  );
};

export default DatasetList;
