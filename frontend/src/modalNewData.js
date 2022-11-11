import React, {useState, useEffect} from "react";
import ReactDOM from "react-dom";

type modalProp = {
    openModal: Boolean,
    onClose: object,
    newData: Array,
    importNewData: object
}

type NewDataItem_type = {
    data: object,
    index: integer
}

const NewDataItem = (props : NewDataItem_type) => {
    return (
        <li className='list-group-item checkbox'>
            <div className="form-check form-check-reverse">
                <input className="form-check-input" type="checkbox" name="addDataset"
                    value={
                        `${
                            props.data.name
                        }`
                    }
                    id={
                        `${
                            props.data.name
                        }-${
                            props.index
                        }`
                    }/>
                <label className="form-check-label"
                    htmlFor={
                        `${
                            props.data.name
                        }-${
                            props.index
                        }`
                }>
                    {
                    props.data.name
                }
                    <p>Folder name : {
                        props.data.folder_name
                    }</p>
                </label>
            </div>
        </li>
    )
}

function checkboxSelected() {
    let cases = document.getElementsByName('addDataset');
    let resultat = [];
    for (let i = 0; i < cases.length; i++) {
        if (cases[i].checked) {
            resultat.push({"name": cases[i].value});
        }
    }
    return resultat
}

function filtre_newData(searchInputFilter, newData) {
    const regex = new RegExp(searchInputFilter, "i");
    let data_filter = newData.filter((oneData) => {
        return regex.test(oneData.name)
    })

    return data_filter
}


const ModalNewData = ({onClose, newData, importNewData}) => {
    const [searchInputFilter, setSearchInputFilter] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);

    useEffect(() => {
        if (searchInputFilter !== '') {
            const filteredData = filtre_newData(searchInputFilter, newData)
            setFilteredResults(filteredData)
        } else {
            setFilteredResults(newData)
        }
    }, [searchInputFilter])

    return (
        <React.Fragment>
            <div onClick={onClose}
                className="overlay fade show"
                id="exampleModal"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true">
                <div className="modal-dialog w-75" role="document">
                    <div onClick={
                            (e) => {
                                e.stopPropagation();
                            }
                        }
                        className="modalContainer modal-content">
                        <div className="modal-header bg-tertiary">
                            <h2>Choose the datasets to import</h2>
                            <div className="input-group rounded  w-auto">
                                <input type="search" className="form-control rounded" placeholder="Search" aria-label="Search" aria-describedby="search-addon"
                                    onChange={
                                        (event) => {
                                            setSearchInputFilter(event.target.value)
                                        }
                                    }/>
                            </div>
                        <button onClick={onClose}
                            className="btn btn-secondary"
                            data-dismiss="modal"
                            aria-label="Close">
                            X
                        </button>
                    </div>

                    <div className="content modal-body">
                        <div className="card">
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item checkbox">
                                    <div className="form-check form-check-reverse">
                                        <input className="form-check-input" type="checkbox" name="allCheckbox" value="all" id="allCheckbox"
                                            onChange={
                                                (event) => {
                                                    let allCheckbox = document.getElementsByName('addDataset')
                                                    allCheckbox.forEach(element => {
                                                        if (event.currentTarget.checked) {
                                                            element.checked = true
                                                        } else {
                                                            element.checked = false
                                                        }

                                                    });

                                                }
                                            }/>
                                        <label className="form-check-label" htmlFor="allCheckbox">All</label>
                                    </div>
                                </li>
                                {
                                searchInputFilter.length > 1 ? filteredResults.map((data, index) => {
                                    return(< NewDataItem key = {
                                        `${
                                            data.id
                                        }`
                                    }
                                    data = {
                                        data
                                    }
                                    index = {
                                        index
                                    } />)
                                }) : (newData.map((data, index) => {
                                    return(< NewDataItem key = {
                                        `${
                                            data.id
                                        }`
                                    }
                                    data = {
                                        data
                                    }
                                    index = {
                                        index
                                    } />)
                                }))
                            } </ul>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal"
                            onClick={onClose}>Close</button>
                        <button type="button" className="btn btn-primary"
                            onClick={
                                () => {
                                    importNewData(checkboxSelected())
                                }
                        }>Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    </React.Fragment>
    )
}


const Modal = (props : modalProp) => props.openModal ? ReactDOM.createPortal (
    <ModalNewData onClose={
            props.onClose
        }
        newData={
            props.newData
        }
        importNewData={
            props.importNewData
        }/>,
    document.body
) : null;
export default Modal;
