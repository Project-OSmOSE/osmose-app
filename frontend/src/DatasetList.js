// @flow
import React, {useState, useEffect} from "react";
import request from 'superagent';
import Modal from './modalNewData';
import './css/modal.css';
import FlashMessage from "./FlashMessage";
import {v4 as uuidv4} from 'uuid';

const GET_DATASET_API_URL = '/api/dataset/';
const GET_NEW_DATASET_API_URL = '/api/dataset/list_to_import';
const IMPORT_DATASET_API_URL = '/api/dataset/datawork_import/';

type DatasetListProps = {
    app_token: string
};

const DatasetList = (props : DatasetListProps) => {
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
    const [flashMessages, setFlashMessages] = useState([]);
    /*
    flash_messages: {
        message: string,
        tags: string
    }
    */
    const [error, setError] = useState([]);
    /**    error: ? {
        status: number,
        message: string
    } */
    const [errorNewDatasets, setErrorNewDatasets] = useState([]);
    /**
    error_newDatasets: ? {
        status: number,
        message: string
    } */
    const [openModal, setOpenModal] = useState(false);
    /**openModal: boolean */
    const [datasetsHTML, setDatasetsHTML] = useState([]);


    let getData = request.get(GET_DATASET_API_URL)
    let getNewData = request.get(GET_NEW_DATASET_API_URL)
    let startImport = request.post(IMPORT_DATASET_API_URL)

    useEffect(() => {
        getNewData.set('Authorization', 'Bearer ' + props.app_token).then(req => {
          if (req.body.flash_messages) {
            setFlashMessages(req.body.flash_messages)
          } else if (req.text === "[]") {
            setFlashMessages([{ "message": "No new data  : Add new data in datasets.csv", "tags": "info" }])
          } else {
                let newData = JSON.parse(req.text)
                    newData = newData.map(obj => ({
                        ...obj,
                        'id': uuidv4()
                    }))
                    setNewDatasets(newData);
                }

        }).catch(err => {
            if (err.status && err.status === 401) { // Server returned 401 which means token was revoked
                document.cookie = 'token=;max-age=0;path=/';
                window.location.reload();
            }
            setErrorNewDatasets(err);
        });
    }, [])

    useEffect(() => {
        getData.set('Authorization', 'Bearer ' + props.app_token).then(req => {
            setDatasets(req.body.result);
        }).catch(err => {
            if (err.status && err.status === 401) { // Server returned 401 which means token was revoked
                document.cookie = 'token=;max-age=0;path=/';
                window.location.reload();
            }
            setError(err);
        });
    }, [newDatasets])

    useEffect(() => {
        setDatasetsHTML(datasets.map(dataset => {
            return (
                <tr key={
                    dataset.id
                }>
                    <td>{
                        dataset.name
                    }</td>
                    <td>{
                        dataset.type
                    }</td>
                    <td>{
                        dataset.files_type
                    }</td>
                    <td>{
                        dataset.files_count
                    }</td>
                    <td>{
                        new Date(dataset.start_date).toDateString()
                    }</td>
                    <td>{
                        new Date(dataset.end_date).toDateString()
                    }</td>
                </tr>
            );
        }));
    }, [datasets])

    const importNewData = (dataset_checked) => {
        return startImport.set('Authorization', 'Bearer ' + props.app_token).send({dataset_checked}).set('Accept', 'application/json').then((req) => {
            if (req.body.flash_messages.length > 0) {
                setFlashMessages(req.body.flash_messages)
            }

          if (req.body.result.length > 0) {
                let newDatasets_tmp = newDatasets;
                req.body.result.forEach(oneNewData => {
                    newDatasets_tmp = newDatasets_tmp.filter((item) => {
                        return item.name !== oneNewData.name
                    });
                })
                setNewDatasets(newDatasets_tmp);
            }else{}
        }).then(() => {
            setOpenModal(false);
        }).catch(err => {
            if (err.status && err.status === 401) { // Server returned 401 which means token was revoked
                document.cookie = 'token=;max-age=0;path=/';
                window.location.reload();
            }
            setError(err);
        });
    }

    return (
        <div className="col-sm-9 border rounded" id="content">
            <h1 className="text-center">Datasets</h1>
            <FlashMessage flashMessages={flashMessages}/>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>File type</th>
                        <th>Number of files</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                    </tr>
                </thead>
                <tbody>{datasetsHTML}</tbody>
            </table>
            <p className="text-center">
                <button className="btn btn-primary" disabled={newDatasets.length===0}
                    onClick={
                        () => {
                            setOpenModal(!openModal);
                        }
                }>
                    Import
                </button>

                <Modal openModal={openModal}
                    newData={newDatasets}
                    importNewData={importNewData}
                    onClose={
                        () => {
                            setOpenModal(false);
                        }
                    }/>
            </p>
    </div>
    )
}
export default DatasetList;
