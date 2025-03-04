import React, { FormEvent, useEffect, useState } from "react";
import { IonButton, IonSpinner } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { useToast } from "@/service/ui";
import './create-edit-campaign.css';
import { AnnotatorsRangeBloc } from "@/view/campaign/create-edit/blocs/annotators-range.bloc.tsx";
import {
  clearDraftCampaign,
  loadDraftFileRange,
  selectDraftFileRange,
  useRetrieveCampaignQuery
} from '@/service/campaign';
import { useAppDispatch, useAppSelector } from '@/service/app';
import {
  useListAnnotationFileRangeQuery,
  usePostAnnotationFileRangeMutation
} from '@/service/campaign/annotation-file-range';


export const EditCampaign: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>()

  // Services
  const dispatch = useAppDispatch();
  const history = useHistory();
  const toast = useToast();
  const draftFileRanges = useAppSelector(selectDraftFileRange)
  const { data: campaign } = useRetrieveCampaignQuery(campaignID);
  const [ postFileRanges, { isLoading } ] = usePostAnnotationFileRangeMutation()
  const { data: initialFileRanges } = useListAnnotationFileRangeQuery({ campaignID: campaignID })
  const [ isForced, setIsForced ] = useState<true | undefined>();

  useEffect(() => {
    dispatch(clearDraftCampaign())
    dispatch(loadDraftFileRange(initialFileRanges ?? []))
    return () => {
      toast.dismiss();
    }
  }, [])

  useEffect(() => {
    dispatch(loadDraftFileRange(initialFileRanges ?? []))
  }, [ initialFileRanges ]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await submitFileRanges();

      history.push(`/annotation-campaign/${ campaignID }`);
    } catch (e: any) {
      toast.presentError(e)
    }
  }

  const submitFileRanges = () => {
    if (!campaign) return;
    return postFileRanges({
      campaignID: campaign.id,
      filesCount: campaign.files_count,
      data: draftFileRanges,
      force: isForced
    }).unwrap()
  }

  return (
    <form id="create-campaign-form"
          onSubmit={ handleSubmit }>
      <div className="title">
        <h2>Edit Annotation Campaign</h2>
        { campaign && <h5>{ campaign.name }</h5> }
      </div>

      <AnnotatorsRangeBloc setIsForced={ setIsForced }/>

      <IonButton color="primary"
                 disabled={ isLoading }
                 type="submit">
        Update campaign
        { isLoading && <IonSpinner/> }
      </IonButton>
    </form>
  )
}
