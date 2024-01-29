import { FC, Fragment } from "react";
import { ListChooser } from "../global-components";
import { DatasetListItemSpectros } from "../../services/api";

export const SpectroConfigurationsSelectComponent: FC<{
  availableSpectroConfigurations?: Array<DatasetListItemSpectros>,
  setAvailableSpectroConfigurations: (availableSpectroConfigurations: Array<DatasetListItemSpectros>) => void,
  selectedSpectroConfigurations: Array<DatasetListItemSpectros>,
  setSelectedSpectroConfigurations: (selectedSpectroConfigurations: Array<DatasetListItemSpectros>) => void,
}> = ({ availableSpectroConfigurations, setAvailableSpectroConfigurations, selectedSpectroConfigurations, setSelectedSpectroConfigurations, }) => {

  const handleAddSpectro = (id: number) => {
    const config = availableSpectroConfigurations?.find(s => s.id === id);
    if (!availableSpectroConfigurations || !config) return;
    setSelectedSpectroConfigurations([...(selectedSpectroConfigurations ?? []), config])
    setAvailableSpectroConfigurations(availableSpectroConfigurations?.filter(s => s.id !== id))
  }

  const handleRemoveSpectro = (id: number) => {
    const config = selectedSpectroConfigurations?.find(s => s.id === id);
    if (!config) return;
    setSelectedSpectroConfigurations(selectedSpectroConfigurations?.filter(s => s.id !== id))
    setAvailableSpectroConfigurations([...(availableSpectroConfigurations ?? []), config])
  }

  if (!availableSpectroConfigurations) return <Fragment/>
  return (
    <div className="form-group">
      <ListChooser choice_type="spectro"
                   choices_list={ [...new Set(availableSpectroConfigurations.sort((a, b) => a.name.localeCompare(b.name)))] }
                   chosen_list={ selectedSpectroConfigurations }
                   onSelectChange={ handleAddSpectro }
                   onDelClick={ handleRemoveSpectro }/>
    </div>
  )
}