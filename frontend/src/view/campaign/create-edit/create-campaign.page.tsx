import React, { FormEvent, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { IonButton, IonSpinner } from "@ionic/react";
import { useCreateCampaign } from "@/services/create-campaign";
import { useBlur } from "@/services/utils/clic.ts";
import { useToast } from "@/services/utils/toast.ts";
import { GlobalInfoBloc } from "./blocs/global-info.bloc.tsx";
import { DatasetBloc } from "./blocs/dataset.bloc.tsx";
import { AnnotatorsBloc } from "./blocs/annotators.bloc.tsx";
import { AnnotationsBloc } from "./blocs/annotations.bloc.tsx";
import './create-edit-campaign.css'

export const CreateCampaign: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const service = useCreateCampaign();
  const blurUtil = useBlur();
  const toast = useToast();

  const history = useHistory();

  useEffect(() => {
    document.addEventListener('click', blurUtil.onClick)
    return () => {
      document.removeEventListener('click', blurUtil.onClick);
      blurUtil.cleanListener();
      toast.dismiss();
    }
  }, [])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit()
  }

  const submit = async (force: boolean = false) => {
    try {
      setIsLoading(true);
      await service.submitCampaign(force);

      history.push('/annotation-campaigns');
    } catch (e: any) {
      const force = await toast.presentError(e, e.response?.body?.dataset_file_not_found);
      if (force) await submit(force);
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <form id="create-campaign-form"
          onSubmit={ handleSubmit }>
      <h1>Create Annotation Campaign</h1>

      <GlobalInfoBloc/>

      <DatasetBloc/>

      <AnnotationsBloc/>

      <AnnotatorsBloc/>


      <IonButton color="primary" type="submit" disabled={ isLoading }>
        Create campaign
        { isLoading && <IonSpinner/> }
      </IonButton>
    </form>
  )
}
