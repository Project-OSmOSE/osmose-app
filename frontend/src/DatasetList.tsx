// @flow
import React, {useState, useEffect} from 'react';
import request from 'superagent';
import Modal from './components/ModalNewData';
import Toast from './components/Toast';
import './css/modal.css';
import {v4 as uuidv4} from 'uuid';

const GET_DATASET_API_URL = '/api/dataset/';
const GET_NEW_DATASET_API_URL = '/api/dataset/list_to_import';
const IMPORT_DATASET_API_URL = '/api/dataset/datawork_import/';

type DatasetListProps = {
  app_token: string
};

const DatasetList = (props: DatasetListProps) => {
  const [launchImport, setLaunchImport] = useState(false)
  const [wanted_datasets, setWanted_datasets] = useState([])
  const [toastMsg, setToastMsg] = useState({ msg: ""});
  /*
    toastMsg: {
        msg: string,
        lvl: string
    }
    */
  const [datasets, setDatasets] = useState([]);
  /*
    datasets: Array < {
        id: number,
        name: string,
        type: string,
        files_type: string,
        files_count: number,
        start_date: string,
        end_date: string
    } >
    */
  const [newDatasets, setNewDatasets] = useState([]);
  /**
    newDatasets: Array < {
        name: string,
        folder_name: string,
        conf_folder: string,
        dataset_type_name: string,
        dataset_type_desc: string,
        files_type: string,
        location_name: string,
        location_desc: string,
        location_lat: string,
        location_lon: string
    } >
     */
  const [error, setError] = useState([]);
  /**    error: ? {
        status: number,
        message: string
    } */
  const [openModal, setOpenModal] = useState(false);
  /**openModal: boolean */

  let getData = request.get(GET_DATASET_API_URL);
  let getNewData = request.get(GET_NEW_DATASET_API_URL);
  let startImport = request.post(IMPORT_DATASET_API_URL);

  useEffect(() => {
    getNewData
      .set("Authorization", "Bearer " + props.app_token)
      .then((req) => {
        let newData = JSON.parse(req.text);
        newData.forEach(function (element) {
          element.id = uuidv4();
        });
        setNewDatasets(newData);
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
      getNewData.abort();
    };
  }, []);

  useEffect(() => {
    getData
      .set("Authorization", "Bearer " + props.app_token)
      .then((req) => {
        setDatasets(req.body);
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
      getData.abort();
    };
  }, [newDatasets]);

  useEffect(() => {
    if (!Array.isArray(error)) {
      let toastMessage;

      try {
        toastMessage = JSON.parse(error.response.text)
      } catch (jsonError) {
        toastMessage = error.response.text
      }
      setToastMsg({msg: toastMessage, lvl: "danger"})
    }else {
      setToastMsg({ msg: "" })
    }

  }, [error]);

  useEffect(() => {
    if (launchImport) {
      startImport
      .set("Authorization", "Bearer " + props.app_token)
        .send({ 'wanted_datasets': wanted_datasets })
      .set("Accept", "application/json")
      .then((req) => {
        const remainingDatasets = newDatasets.filter((newDataset) =>
          req.body.some(
            (importedDataset) => importedDataset.name !== newDataset.name
          )
        );
        setNewDatasets(remainingDatasets);
        setError([]);
        setToastMsg([]);
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
      startImport.abort();
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
          setWanted_datasets={(data) => {
            setWanted_datasets(data)
          }}
        />
      </p>
    </div>
  );
};

export default DatasetList;
