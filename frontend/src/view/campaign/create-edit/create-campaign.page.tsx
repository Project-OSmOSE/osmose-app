import React, { FormEvent, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { IonButton, IonSpinner } from "@ionic/react";
import { useBlur } from "@/services/utils/clic.ts";
import { useToast } from "@/services/utils/toast.ts";
import { AnnotatorsRangeBloc } from "@/view/campaign/create-edit/blocs/annotators-range.bloc.tsx";
import { CampaignBloc } from "@/view/campaign/create-edit/blocs/campaign.bloc.tsx";
import { BlocRef } from "@/view/campaign/create-edit/blocs/util.bloc.ts";
import {
  BaseAnnotationCampaign,
  selectDraftCampaign,
  updateCampaignSubmissionErrors,
  useCreateCampaignMutation,
  WriteCreateAnnotationCampaign
} from '@/service/campaign';
import './create-edit-campaign.css'
import { useAppDispatch, useAppSelector } from '@/slices/app.ts';
import { Errors } from '@/service/type.ts';
import { WriteAnnotationCampaign } from '@/service/campaign';
import { DataBloc } from '@/view/campaign/create-edit/blocs/data.bloc.tsx';
import { AnnotationBloc } from '@/view/campaign/create-edit/blocs/annotation.bloc.tsx';

export const CreateCampaign: React.FC = () => {
  const blurUtil = useBlur();
  const toast = useToast();

  // Blocs
  const fileRangeBloc = useRef<BlocRef | null>(null);

  // Services
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [ createCampaign, {
    error: submitError,
    data: createdCampaign,
    isLoading: isCampaignSubmitting
  } ] = useCreateCampaignMutation()

  // State
  const draftCampaign = useAppSelector(selectDraftCampaign)


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
      await submitCampaign();
      await fileRangeBloc.current?.submit()

      history.push('/annotation-campaign');
    } catch (e: any) {
      toast.presentError(e);
    }
  }

  const submitCampaign = () => {
    if (createdCampaign) return;
    const missingFields = [];
    if (!draftCampaign.name?.trim()) missingFields.push('name');
    if (!draftCampaign.usage) missingFields.push('usage');
    if (!draftCampaign.datasets || draftCampaign.datasets.length === 0) missingFields.push('datasets');
    if (!draftCampaign.spectro_configs || draftCampaign.spectro_configs.length === 0) missingFields.push('spectro_configs');
    if (missingFields.length > 0) {
      const errors: Errors<WriteAnnotationCampaign> = {}
      for (const field in missingFields) errors[field as keyof WriteAnnotationCampaign] = `The ${ field } field is required.`;
      dispatch(updateCampaignSubmissionErrors(errors))
      throw new Error("Missing required fields");
    }
    const data: BaseAnnotationCampaign = {
      name: draftCampaign.name?.trim() ?? '',
      desc: draftCampaign.desc?.trim() ?? null,
      instructions_url: draftCampaign.instructions_url?.trim() ?? null,
      deadline: draftCampaign.deadline?.trim() ?? null,
      datasets: draftCampaign.datasets ?? [],
      spectro_configs: draftCampaign.spectro_configs ?? [],
    }

    if (draftCampaign.usage === 'Check') {
      return createCampaign({
        ...data,
        usage: 'Check',
      }).unwrap();
    }

    if (!(draftCampaign as WriteCreateAnnotationCampaign).label_set) {
      dispatch(updateCampaignSubmissionErrors({
        label_set: 'The label set is required.'
      }))
      throw new Error("Missing required fields");
    }

    const draft = draftCampaign as Partial<WriteCreateAnnotationCampaign>;
    return createCampaign({
      ...data,
      usage: 'Create',
      label_set: draft.label_set!,
      confidence_indicator_set: draft.confidence_indicator_set ?? null
    }).unwrap();
  }


  return (
    <form id="create-campaign-form"
          onSubmit={ handleSubmit }>
      <h1>Create Annotation Campaign</h1>

      <CampaignBloc createdCampaign={ createdCampaign }/>

      <DataBloc createdCampaign={ createdCampaign }/>

      <AnnotationBloc createdCampaign={ createdCampaign }/>

      <AnnotatorsRangeBloc ref={ fileRangeBloc } createdCampaign={ createdCampaign }/>

      <IonButton color="primary" type="submit" disabled={ isCampaignSubmitting }>
        Create campaign
        { isCampaignSubmitting && <IonSpinner/> }
      </IonButton>
    </form>
  )
}
