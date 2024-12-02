import React, { FormEvent, useRef, useState } from "react";
import { IonButton, IonSpinner } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { useToast } from "@/services/utils/toast.ts";
import './create-edit-campaign.css';
import { AnnotatorsRangeBloc } from "@/view/campaign/create-edit/blocs/annotators-range.bloc.tsx";
import { BlocRef } from "@/view/campaign/create-edit/blocs/util.bloc.ts";
import { useRetrieveCampaignQuery } from '@/service/campaign';


export const EditCampaign: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>()

  // States
  const [ isSubmitting, setIsSubmitting ] = useState<boolean>(false);

  // Services
  const history = useHistory();
  const toast = useToast();
  const { data: campaign } = useRetrieveCampaignQuery(campaignID);

  // Ref
  const annotatorBlocRef = useRef<BlocRef | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      await annotatorBlocRef.current?.submit();

      history.push(`/annotation-campaign/${ campaignID }`);
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

      <AnnotatorsRangeBloc ref={ annotatorBlocRef } createdCampaign={ campaign } files_count={ campaign?.files_count }/>

      <IonButton color="primary"
                 disabled={ isSubmitting }
                 type="submit">
        Update campaign
        { isSubmitting && <IonSpinner/> }
      </IonButton>
    </form>
  )
}
