import React, { FormEvent, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { IonButton } from "@ionic/react";
import { useCreateCampaign } from "@/services/create-campaign";
import { useBlur } from "@/services/utils/clic";
import { useToast } from "@/services/utils/toast";
import { GlobalInfoBloc } from "./blocs/global-info.bloc.tsx";
import { DatasetBloc } from "./blocs/dataset.bloc.tsx";
import { AnnotatorsBloc } from "./blocs/annotators.bloc.tsx";
import { AnnotationsBloc } from "./blocs/annotations.bloc.tsx";
import './create-edit-campaign.css'

export const CreateCampaign: React.FC = () => {

  const service = useCreateCampaign();
  const blurUtil = useBlur();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const history = useHistory();

  useEffect(() => {
    document.addEventListener('click', blurUtil.onClick)
    return () => {
      document.removeEventListener('click', blurUtil.onClick);
      blurUtil.cleanListener();
      toast.dismiss();
    }
  }, [])


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await service.submitCampaign();
      setIsSubmitting(false);

      history.push('/annotation-campaigns');
    } catch (e: any) {
      toast.presentError(e);
    }
  }


  return (
    <form id="create-campaign-form"
          onSubmit={ handleSubmit }
          className="col-sm-9 border rounded">
      <h1>Create Annotation Campaign</h1>

      <GlobalInfoBloc/>

      <DatasetBloc/>

      <AnnotationsBloc/>

      <AnnotatorsBloc/>


      <IonButton color="primary"
                 disabled={ isSubmitting }
                 type="submit">
        Create campaign
      </IonButton>
    </form>
  )
}
