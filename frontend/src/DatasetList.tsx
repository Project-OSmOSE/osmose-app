import React, {useState, useEffect} from 'react';
import request, { SuperAgentRequest } from 'superagent';
import Modal from './components/ModalNewData';
import Toast, { ToastMsg } from './components/Toast';
import './css/modal.css';
import {v4 as uuidv4} from 'uuid';

const GET_DATASET_API_URL = '/api/dataset/';
const GET_NEW_DATASET_API_URL = '/api/dataset/list_to_import';
const IMPORT_DATASET_API_URL = '/api/dataset/datawork_import/';

type DatasetListProps = {
  app_token: string
};
type Dataset = {
  id: number,
  name: string,
  type: string,
  files_type: string,
  files_count: number,
  start_date: string,
  end_date: string,
  created_at: string,
};
export type NewDataset = {
  id: string,
  name: string,
  folder_name: string,
  conf_folder: string,
  dataset_type_name: string,
  dataset_type_desc: string,
  files_type: string,
  location_name: string,
  location_desc: string,
  location_lat: string,
  location_lon: string,
};

const DatasetList: React.FC<DatasetListProps> = (props: DatasetListProps) => {
  const [launchImport, setLaunchImport] = useState(false)
  const [wanted_datasets, setWanted_datasets] = useState<NewDataset[]>([])
  const [toastMsg, setToastMsg] = useState<ToastMsg | undefined>(undefined);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [newDatasets, setNewDatasets] = useState<NewDataset[]>([]);
  const [error, setError] = useState<any>(undefined);
  const [openModal, setOpenModal] = useState(false);

  let getData: SuperAgentRequest | undefined;
  let getNewData: SuperAgentRequest | undefined;
  let startImport: SuperAgentRequest | undefined;

  useEffect(() => {
    getNewData = request.get(GET_NEW_DATASET_API_URL);
    getNewData
      .set("Authorization", "Bearer " + props.app_token)
      .then((req) => {
        let newData = JSON.parse(req.text);
        newData.forEach(function (element: NewDataset) {
          element.id = uuidv4();
        });
        setNewDatasets(newData);
        setError(undefined);
      })
      .catch((err) => {
        if (err.status && err.status === 401) {
          // Server returned 401 which means token was revoked
          document.cookie = "token=;max-age=0;path=/";
          window.location.reload();
        }
        setError(err);
      });
    return () => {
      if (getNewData) {
        getNewData.abort();
      }
    };
  }, []);

  useEffect(() => {
    getData = request.get(GET_DATASET_API_URL);
    getData
      .set("Authorization", "Bearer " + props.app_token)
      .then((req) => {
        setDatasets(req.body);
        setError(undefined);
      })
      .catch((err) => {
        if (err.status && err.status === 401) {
          // Server returned 401 which means token was revoked
          document.cookie = "token=;max-age=0;path=/";
          window.location.reload();
        }
        setError(err);
      });

    return () => {
      if (getData) {
        getData.abort();
      }
    };
  }, [newDatasets]);

  useEffect(() => {
    if (error && !Array.isArray(error)) {
      let toastMessage;

      if (error.response) {
        try {
          toastMessage = JSON.parse(error.response.text)
        } catch (jsonError) {
          toastMessage = error.response.text
        }
      } else {
        toastMessage = error.message;
      }
      setToastMsg({msg: toastMessage, lvl: "danger"})
    } else {
      setToastMsg(undefined)
    }

  }, [error]);

  useEffect(() => {
    if (launchImport) {
      startImport = request.post(IMPORT_DATASET_API_URL);
      startImport
      .set("Authorization", "Bearer " + props.app_token)
        .send({ 'wanted_datasets': wanted_datasets })
      .set("Accept", "application/json")
      .then((req) => {
        const remainingDatasets = newDatasets.filter((newDataset) =>
          req.body.some(
            (importedDataset: Dataset) => importedDataset.name !== newDataset.name
          )
        );
        setNewDatasets(remainingDatasets);
        setError(undefined);
        setToastMsg(undefined);
        setOpenModal(false);
        setLaunchImport(false)
      })
      .catch((err) => {
        if (err.status && err.status === 401) {
          // Server returned 401 which means token was revoked
          document.cookie = "token=;max-age=0;path=/";
          window.location.reload();
        }
        setError(err);
        setOpenModal(false);
        setLaunchImport(false)
      });
    }

    return () => {
      if (startImport) {
        startImport.abort();
      }
    };
  }, [launchImport])

  return (
    <div className="col-sm-9 border rounded" id="content">
      <h1 className="text-center">Datasets</h1>
      <Toast toastMsg={toastMsg}></Toast>
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
          {datasets.map((dataset) => {
            return (
              <tr key={dataset.id}>
                <td>{dataset.name}</td>
                <td>{new Date(dataset.created_at).toDateString()}</td>
                <td>{dataset.type}</td>
                <td>{dataset.files_type}</td>
                <td>{dataset.files_count}</td>
                <td>{new Date(dataset.start_date).toDateString()}</td>
                <td>{new Date(dataset.end_date).toDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-center">
        <button
          className="btn btn-primary"
          disabled={newDatasets.length === 0}
          onClick={() => {
            setOpenModal(!openModal);
          }}
        >
          Import
        </button>

        <Modal
          openModal={openModal}
          newData={newDatasets}
          setLaunchImportAvailable={() => {setLaunchImport(true)}}
          onClose={() => {setOpenModal(false);}}
          setWanted_datasets={(data: NewDataset[]) => {
            setWanted_datasets(data)
          }}
        />
      </p>
    </div>
  );
};

export default DatasetList;
