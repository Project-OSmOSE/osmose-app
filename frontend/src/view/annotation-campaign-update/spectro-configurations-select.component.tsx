import { FC, Fragment } from "react";
import { ListChooser } from "../global-components";
import { DatasetListItemSpectros } from "../../services/api";

export const SpectroConfigurationsSelectComponent: FC<{
  availableSpectroConfigurations?: Array<DatasetListItemSpectros>,
  setAvailableSpectroConfigurations: (availableSpectroConfigurations: Array<DatasetListItemSpectros>) => void,
  selectedSpectroConfigurations: Array<DatasetListItemSpectros>,
  setSelectedSpectroConfigurations: (selectedSpectroConfigurations: Array<DatasetListItemSpectros>) => void,
}> = ({ availableDatasets, setAvailableSpectroConfigurations, selectedSpectroConfigurations, setSelectedSpectroConfigurations, }) => {

  const handleAddSpectro = (id: number) => {
    const config = availableDatasets?.find(s => s.id === id);
    if (!availableDatasets || !config) return;
    setSelectedSpectroConfigurations([...(selectedSpectroConfigurations ?? []), config])
    setAvailableSpectroConfigurations(availableDatasets?.filter(s => s.id !== id))
  }

  const handleRemoveSpectro = (id: number) => {
    const config = selectedSpectroConfigurations?.find(s => s.id === id);
    if (!config) return;
    setSelectedSpectroConfigurations(selectedSpectroConfigurations?.filter(s => s.id !== id))
    setAvailableSpectroConfigurations([...(availableDatasets ?? []), config])
  }

  if (!availableDatasets) return <Fragment/>
  return (
    <div className="form-group">
      <ListChooser choice_type="spectro"
                   choices_list={ [...new Set(availableDatasets.sort((a, b) => a.name.localeCompare(b.name)))] }
                   chosen_list={ selectedSpectroConfigurations }
                   onSelectChange={ handleAddSpectro }
                   onDelClick={ handleRemoveSpectro }/>
    </div>
  )
}