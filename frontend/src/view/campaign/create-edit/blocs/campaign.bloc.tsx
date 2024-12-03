import React, { useEffect } from "react";
import { FormBloc, Input, Textarea } from "@/components/form";
import { useAppDispatch, useAppSelector } from '@/service/app';
import {
  selectCampaignSubmissionErrors,
  selectCurrentCampaign,
  selectDraftCampaign,
  updateCampaignSubmissionErrors,
  updateDraftCampaign,
} from '@/service/campaign';
import { useListDatasetQuery } from '@/service/dataset';

export const CampaignBloc: React.FC = () => {
  // Services
  const dispatch = useAppDispatch();
  const { data: allDatasets } = useListDatasetQuery();

  // State
  const draftCampaign = useAppSelector(selectDraftCampaign)
  const createdCampaign = useAppSelector(selectCurrentCampaign)
  const errors = useAppSelector(selectCampaignSubmissionErrors)

  // Loading
  useEffect(() => {
    if (allDatasets && allDatasets.length === 0)
      dispatch(updateCampaignSubmissionErrors({ datasets: "You should first import a dataset." }));
  }, [ allDatasets ]);

  return <FormBloc> {/* Global */ }
    <Input label="Name"
           placeholder="Campaign name"
           error={ errors.name }
           value={ draftCampaign.name }
           onChange={ e => dispatch(updateDraftCampaign({ name: e.target.value })) }
           required={ true }
           disabled={ !!createdCampaign }/>

    <Textarea label="Description" placeholder="Enter your campaign description"
              error={ errors.desc }
              value={ draftCampaign.desc ?? undefined }
              onChange={ e => dispatch(updateDraftCampaign({ desc: e.target.value })) }
              disabled={ !!createdCampaign }/>

    <Input label="Instruction URL"
           placeholder="URL"
           error={ errors.instructions_url }
           value={ draftCampaign.instructions_url ?? undefined }
           onChange={ e => dispatch(updateDraftCampaign({ instructions_url: e.target.value })) }
           disabled={ !!createdCampaign }/>

    <Input label="Deadline"
           type="date"
           placeholder="Deadline"
           error={ errors.deadline }
           value={ draftCampaign.deadline ?? undefined }
           onChange={ e => dispatch(updateDraftCampaign({ deadline: e.target.value })) }
           disabled={ !!createdCampaign }/>
  </FormBloc>
}
