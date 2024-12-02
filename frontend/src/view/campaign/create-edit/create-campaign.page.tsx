import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { IonButton, IonSpinner } from "@ionic/react";
import { useBlur } from "@/services/utils/clic.ts";
import { useToast } from "@/services/utils/toast.ts";
import { AnnotatorsRangeBloc } from "@/view/campaign/create-edit/blocs/annotators-range.bloc.tsx";
import { CampaignBloc } from "@/view/campaign/create-edit/blocs/campaign.bloc.tsx";
import { BlocRef } from "@/view/campaign/create-edit/blocs/util.bloc.ts";
import { AnnotationCampaign } from '@/service/campaign';
import { Dataset } from '@/service/dataset';
import './create-edit-campaign.css'

export const CreateCampaign: React.FC = () => {
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ submittedCampaign, setSubmittedCampaign ] = useState<AnnotationCampaign | undefined>();
  const [ dataset, setDataset ] = useState<Dataset | undefined>();

  const blurUtil = useBlur();
  const toast = useToast();

  // Blocs
  const campaignBloc = useRef<BlocRef | null>(null);
  const fileRangeBloc = useRef<BlocRef | null>(null);


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

  const submit = async () => {
    try {
      setIsLoading(true);
      await campaignBloc.current?.submit();
      await fileRangeBloc.current?.submit()

      history.push('/annotation-campaign');
    } catch (e: any) {
      toast.presentError(e);
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <form id="create-campaign-form"
          onSubmit={ handleSubmit }>
      <h1>Create Annotation Campaign</h1>

      <CampaignBloc ref={ campaignBloc } onDatasetUpdated={ setDataset } onCampaignSubmitted={ setSubmittedCampaign }/>

      <AnnotatorsRangeBloc ref={ fileRangeBloc } campaign={ submittedCampaign } files_count={ dataset?.files_count }/>

      <IonButton color="primary" type="submit" disabled={ isLoading }>
        Create campaign
        { isLoading && <IonSpinner/> }
      </IonButton>
    </form>
  )
}
