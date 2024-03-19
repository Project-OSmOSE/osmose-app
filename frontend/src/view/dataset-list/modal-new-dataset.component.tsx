import { ChangeEvent, FC, Fragment, useEffect, useState } from "react";
import { DatasetListToImport, DatasetListToImportItem } from "../../services/api";
import { IonButton } from "@ionic/react";


const NewDataItem: FC<{
  data: DatasetListToImportItem,
  index: number,
}> = ({ data, index }) => {
  return (
    <li className="list-group-item checkbox">
      <div className="form-check form-check-reverse">
        <input className="form-check-input"
               type="checkbox"
               name="addDataset"
               value={ `${ data.name }` }
               id={ `${ data.name }-${ index }` }/>
        <label className="form-check-label"
               htmlFor={ `${ data.name }-${ index }` }>
          { data.name }
          <p>Folder name : { data.folder_name }</p>
        </label>
      </div>
    </li>
  );
};


export const ModalNewDataset: FC<{
  onClose: () => void,
  newData: DatasetListToImport,
  startImport: (datasets: DatasetListToImport) => void
}> = ({ onClose, newData, startImport }) => {
  const [searchInputFilter, setSearchInputFilter] = useState<string>("");
  const [filteredResults, setFilteredResults] = useState<DatasetListToImport>([]);

  useEffect(() => {
    if (searchInputFilter !== "") {
      const regex = new RegExp(searchInputFilter, "i");
      const filteredData = newData.filter(oneData => {
        return regex.test(oneData.name);
      });
      setFilteredResults(filteredData);
    } else {
      setFilteredResults(newData);
    }
  }, [searchInputFilter]);

  // TODO: do not use document.getElementsByName
  const items = () => [...document.getElementsByName("addDataset")] as Array<HTMLInputElement>;

  const onSave = () => {
    startImport(items().filter(data => data.checked).map(data => ({ name: data.value })) as DatasetListToImport);
  }

  const onCheckAll = (event: ChangeEvent<HTMLInputElement>) => {
    items().forEach((element: any) => element.checked = event.currentTarget.checked);
  }

  return (
    <Fragment>
      <div onClick={ onClose }
           className="overlay fade show"
           id="exampleModal"
           tabIndex={ -1 }
           role="dialog"
           aria-labelledby="exampleModalLabel"
           aria-hidden="true">
        <div className="modal-dialog w-75" role="document">
          <div onClick={ (e) => e.stopPropagation() }
               className="modalContainer modal-content">
            <div className="modal-header bg-tertiary">
              <h2>Choose the datasets to import</h2>
              <div className="input-group rounded  w-auto">
                <input type="search"
                       className="form-control rounded"
                       placeholder="Search"
                       aria-label="Search"
                       aria-describedby="search-addon"
                       onChange={ event => setSearchInputFilter(event.target.value) }/>
              </div>
              <button onClick={ onClose }
                      className="btn btn-secondary"
                      data-dismiss="modal"
                      aria-label="Close">
                X
              </button>
            </div>

            <div className="content modal-body">
              <div className="card mx-500">
                <ul className="list-group list-group-flush mx-500">
                  <li className="list-group-item checkbox">
                    <div className="form-check form-check-reverse">
                      <input className="form-check-input"
                             type="checkbox"
                             name="allCheckbox"
                             value="all"
                             id="allCheckbox"
                             onChange={ onCheckAll }/>
                      <label className="form-check-label" htmlFor="allCheckbox">
                        All
                      </label>
                    </div>
                  </li>
                  { searchInputFilter.length > 1
                    ? filteredResults.map((data, index) => (
                      <NewDataItem
                        key={ `${ data.id }` }
                        data={ data }
                        index={ index }
                      />))
                    : newData.map((data, index) => (
                      <NewDataItem key={ data.id }
                                   data={ data }
                                   index={ index }/>)) }
                  { " " }
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <IonButton color={"medium"}
                         data-dismiss="modal"
                         onClick={ onClose }>
                Close
              </IonButton>
              <IonButton color={"primary"}
                         onClick={ onSave }>
                Save changes
              </IonButton>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
