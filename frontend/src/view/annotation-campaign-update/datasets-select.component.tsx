import { ChangeEvent, FC, Fragment } from "react";
import { DatasetList, DatasetListItem } from "../../services/api";

export const DatasetsSelectComponent: FC<{
  availableDatasets?: DatasetList,
  setSelectedDataset: (selectedDataset: DatasetListItem | undefined) => void,
}> = ({ availableDatasets, setSelectedDataset, }) => {

  const handleDatasetChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    const dataset = availableDatasets?.find(d => d.id === +event.target.value)
    setSelectedDataset(dataset);
  }

  if (!availableDatasets) return <Fragment/>
  return (
    <div className="form-group">
      <select id="cac-dataset"
              className="form-control"
              onChange={ handleDatasetChanged }>
        <option key="dataset-void" value="">Select a dataset</option>
        { availableDatasets?.map(dataset => (
          <option key={ `dataset-${ dataset.id }` } value={ dataset.id.toString() }>{ dataset.name }</option>
        )) }
      </select>
    </div>
  )
}