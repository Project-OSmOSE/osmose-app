import React, { ChangeEvent } from "react";
import { createCampaignActions } from "@/slices/create-campaign";
import { FormBloc, Input, Textarea } from "@/components/form";
import { useAppDispatch, useAppSelector } from "@/slices/app.ts";

export const GlobalInfoBloc: React.FC = () => {

  // Form data
  const dispatch = useAppDispatch();
  const {
    name,
    description,
    instructionURL,
    deadline
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

  const onDeadlineChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(createCampaignActions.updateDeadline(e.target.value));
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

      <Input label="Deadline"
             value={ deadline ?? '' }
             type="date"
             onChange={ onDeadlineChange }/>
    </FormBloc>
  )
}
