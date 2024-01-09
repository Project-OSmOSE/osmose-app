import React, { useState, useEffect } from 'react';
import Toast, { ToastMsg } from '../components/Toast.tsx';
import '../css/modal.css';
import ReactDOM from "react-dom";
import { ModalNewData } from "../components/ModalNewData.tsx";
import { useAuth, useCatch401 } from "../utils/auth.tsx";
import * as Datasets from '../utils/api/dataset.tsx';
import { Request } from '../utils/requests.tsx';


const DatasetList: React.FC = () => {
  const [toastMsg, setToastMsg] = useState<ToastMsg | undefined>(undefined);
  const [datasets, setDatasets] = useState<Datasets.List>([]);
  const [datasetsToImport, setDatasetsToImport] = useState<Datasets.ListToImport>([]);
  const [error, setError] = useState<any | undefined>(undefined);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const auth = useAuth();
  const catch401 = useCatch401();
  const [listToImport, setListToImport] = useState<Request | undefined>();
  const [listRequest, setListRequest] = useState<Request | undefined>();
  const [importRequest, setImportRequest] = useState<Request | undefined>();


  useEffect(() => {
    const { request, response } = Datasets.listToImport(auth.bearer!);
    setListToImport(request);
    response.then(setDatasetsToImport).catch(catch401).catch(setError);
    return () => {
      listToImport?.abort();
      listRequest?.abort();
      importRequest?.abort()
    };
  }, []);

  useEffect(() => {
    const { request, response } = Datasets.list(auth.bearer!);
    setListRequest(request);
    response.then(setDatasets).catch(catch401).catch(setError);
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

  const importDatasets = async (datasets: Datasets.ListToImport) => {
    const { request, response } = Datasets.importDatasets(datasets, auth.bearer!);
    setImportRequest(request);
    response.then(data => {
      const remainingDatasets = datasetsToImport.filter(newDataset =>
        data.some(importedDataset => importedDataset.name !== newDataset.name)
      );
      setDatasetsToImport(remainingDatasets);
      setError(undefined)
    }).catch(catch401).catch(setError).finally(() => setIsImportModalOpen(false));
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
