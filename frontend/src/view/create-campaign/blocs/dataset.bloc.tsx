import React, { useEffect, useMemo, useState } from "react";
import { createCampaignActions } from "@/slices/create-campaign";
import { DatasetList, useDatasetsAPI } from "@/services/api";
import { FormBloc, Select, ChipsInput } from "@/components/form";
import { useAppSelector, useAppDispatch } from "@/slices/app";
import { useToast } from "@/services/utils/toast.ts";

export const DatasetBloc: React.FC = () => {

  // API Data
  const [datasets, setDatasets] = useState<DatasetList>([]);
  const datasetsAPI = useDatasetsAPI();

  // Form data
  const {
    dataset,
    datasetSpectroConfigs
  } = useAppSelector(state => state.createCampaignForm.global);
  const dispatch = useAppDispatch();
  const availableSpectro = useMemo(() => dataset?.spectros ? dataset.spectros : [], [dataset?.spectros])

  // Services
  const toast = useToast();

  useEffect(() => {
    let isCancelled = false;
    datasetsAPI.list('.wav').then(setDatasets).catch(e => !isCancelled && toast.presentError(e));

    return () => {
      isCancelled = true;
      datasetsAPI.abort();
    }
  }, [])

  const onDatasetChange = (value: string | number | undefined) => {
    const newDataset = datasets.find(d => d.id === value);
    dispatch(createCampaignActions.updateDataset(newDataset));
    dispatch(createCampaignActions.updateDatasetSpectroConfigs(newDataset?.spectros ?? []))
  }

  const onSpectroConfigsChange = (array: Array<string | number>) => {
    dispatch(createCampaignActions.updateDatasetSpectroConfigs(availableSpectro.filter(d => array.includes(d.id))))
  }

  return (
    <FormBloc label="Data">
      <Select label="Dataset"
              required={ true }
              placeholder="Select a dataset"
              options={ datasets.map(d => ({ value: d.id, label: d.name })) }
              optionsContainer="alert"
              value={ dataset?.id }
              onValueSelected={ onDatasetChange }/>

      <ChipsInput required={ true }
                  label="Spectrogram configurations"
                  disabled={ availableSpectro.length <= 0 }
                  items={ availableSpectro.map(c => ({ value: c.id, label: c.name })) }
                  activeItemsValues={ datasetSpectroConfigs.map(i => i.id) }
                  setActiveItemsValues={ onSpectroConfigsChange }/>
    </FormBloc>
  )
}
