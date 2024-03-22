import React, { ChangeEvent } from "react";
import { createCampaignActions } from "@/slices/create-campaign";
import { FormBloc, Textarea, Input } from "@/components/form";
import { useAppSelector, useAppDispatch } from "@/slices/app";

export const GlobalInfoBloc: React.FC = () => {

  // Form data
  const dispatch = useAppDispatch();
  const {
    name,
    description,
    instructionURL,
    startDate,
    endDate
  } = useAppSelector(state => state.createCampaignForm.global);

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(createCampaignActions.updateName(e.target.value));
  }

  const onDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(createCampaignActions.updateDescription(e.target.value));
  }

  const onInstructionURLChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(createCampaignActions.updateInstructionURL(e.target.value));
  }

  const onStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(createCampaignActions.updateStartDate(e.target.value));
  }

  const onEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(createCampaignActions.updateEndDate(e.target.value));
  }

  return (
    <FormBloc>
      <Input label="Name"
             placeholder="Campaign name"
             required={ true }
             value={ name ?? '' }
             onChange={ onNameChange }/>

      <Textarea label="Description"
                placeholder="Enter your campaign description"
                value={ description }
                onChange={ onDescriptionChange }/>

      <Input label="Instruction URL"
             placeholder="URL"
             value={ instructionURL ?? '' }
             onChange={ onInstructionURLChange }/>

      <div id="dates-input">
        <Input label="Start"
               value={ startDate ?? '' }
               type="date"
               onChange={ onStartDateChange }/>

        <Input label="End"
               value={ endDate ?? '' }
               type="date"
               onChange={ onEndDateChange }/>
      </div>
    </FormBloc>
  )
}
