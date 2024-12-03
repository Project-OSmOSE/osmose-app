import React, { useEffect, useMemo } from "react";
import { ChipsInput, FormBloc, Select } from "@/components/form";
import { useAppDispatch, useAppSelector } from '@/service/app';
import {
  selectCampaignSubmissionErrors,
  selectCurrentCampaign,
  selectDraftCampaign,
  updateCampaignSubmissionErrors,
  updateDraftCampaign,
} from '@/service/campaign';
import { useListDatasetQuery } from '@/service/dataset';

export const DataBloc: React.FC = () => {
  // Services
  const dispatch = useAppDispatch();
  const { data: allDatasets } = useListDatasetQuery();

  // State
  const draftCampaign = useAppSelector(selectDraftCampaign)
  const createdCampaign = useAppSelector(selectCurrentCampaign)
  const errors = useAppSelector(selectCampaignSubmissionErrors)
  const draftCampaignDataset = useMemo(() => {
    if (!draftCampaign.datasets) return undefined;
    if (draftCampaign.datasets.length === 0) return undefined;
    return allDatasets?.find(d => draftCampaign.datasets![0] === d.name);
  }, [ draftCampaign.datasets, allDatasets ]);
  useEffect(() => {
    if (draftCampaignDataset) {
      dispatch(updateDraftCampaign({
        spectro_configs: draftCampaignDataset.spectros.map(s => s.id)
      }));
    }
  }, [draftCampaignDataset]);

  // Loading
  useEffect(() => {
    if (allDatasets && allDatasets.length === 0)
      dispatch(updateCampaignSubmissionErrors({ datasets: "You should first import a dataset." }));
  }, [ allDatasets ]);

  return <FormBloc label="Data">
    <Select label="Dataset"
            required={ true }
            error={ errors.datasets }
            placeholder="Select a dataset"
            options={ allDatasets?.map(d => ({ value: d.name, label: d.name })) ?? [] }
            optionsContainer="alert"
            value={ draftCampaignDataset?.name }
            isLoading={ !allDatasets }
            disabled={ !allDatasets || !allDatasets.length || !!createdCampaign }
            onValueSelected={ value => dispatch(updateDraftCampaign({ datasets: [ value as string ] })) }/>

    { draftCampaignDataset && <ChipsInput required={ true }
                                          error={ errors.spectro_configs }
                                          label="Spectrogram configurations"
                                          disabled={ !draftCampaignDataset?.spectros?.length || !!createdCampaign }
                                          items={ draftCampaignDataset?.spectros.map((c: any) => ({
                                            value: c.id,
                                            label: c.name
                                          })) ?? [] }
                                          activeItemsValues={ draftCampaign.spectro_configs ?? [] }
                                          setActiveItemsValues={ value => dispatch(updateDraftCampaign({ spectro_configs: value as Array<number> })) }/> }
  </FormBloc>
}
