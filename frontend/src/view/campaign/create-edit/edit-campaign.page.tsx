import React, { useEffect, useState, FormEvent, useRef } from "react";
import { useAnnotationCampaignAPI } from "@/services/api";
import { IonButton, IonSpinner } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { useToast } from "@/services/utils/toast.ts";
import './create-edit-campaign.css';
import { AnnotatorsRangeBloc } from "@/view/campaign/create-edit/blocs/annotators-range.bloc.tsx";
import { BasicCampaign } from "@/services/api/annotation-file-range-api.service.tsx";
import { BlocRef } from "@/view/campaign/create-edit/blocs/util.bloc.ts";


export const EditCampaign: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>()

  // States
  const [ isSubmitting, setIsSubmitting ] = useState<boolean>(false);
  const [ campaign, setCampaign ] = useState<BasicCampaign | undefined>(undefined);

  // Services
  const history = useHistory();
  const toast = useToast();
  const campaignAPI = useAnnotationCampaignAPI();

  // Ref
  const annotatorBlocRef = useRef<BlocRef | null>(null);

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      campaignAPI.retrieve(campaignID).then(setCampaign),
    ]).catch(e => !isCancelled && toast.presentError(e));

    return () => {
      isCancelled = true;
     campaignAPI.abort();
      toast.dismiss();
    }
  }, [ campaignID ])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!annotatorBlocRef.current?.isValid) {
      toast.presentError(annotatorBlocRef.current?.getErrorMessage() ?? 'Unknown')
      return;
    }
    try {
      setIsSubmitting(true);

      await annotatorBlocRef.current.submit();

      history.push(`/annotation_campaign/${ campaignID }`);
    } catch (e: any) {
      toast.presentError(e)
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form id="create-campaign-form"
          onSubmit={ handleSubmit }>
      <div className="title">
        <h1>Edit Annotation Campaign</h1>
        { campaign && <h5>{ campaign.name }</h5> }
      </div>

      <AnnotatorsRangeBloc ref={ annotatorBlocRef } campaign={ campaign }/>

      <IonButton color="primary"
                 disabled={ isSubmitting }
                 type="submit">
        Update campaign
        { isSubmitting && <IonSpinner/> }
      </IonButton>
    </form>
  )
}
