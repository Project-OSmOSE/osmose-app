import React, { FormEvent, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { IonButton, IonSpinner } from "@ionic/react";
import { useBlur } from "@/services/utils/clic.ts";
import { useToast } from "@/services/utils/toast.ts";
import { AnnotatorsRangeBloc } from "@/view/campaign/create-edit/blocs/annotators-range.bloc.tsx";
import { CampaignBloc } from "@/view/campaign/create-edit/blocs/campaign.bloc.tsx";
import {
  BaseAnnotationCampaign,
  clearCampaign,
  selectDraftCampaign,
  selectDraftFileRange,
  updateCampaignSubmissionErrors,
  useCreateCampaignMutation,
  WriteAnnotationCampaign,
  WriteCreateAnnotationCampaign
} from '@/service/campaign';
import './create-edit-campaign.css'
import { useAppDispatch, useAppSelector } from '@/service/app';
import { Errors } from '@/service/type.ts';
import { DataBloc } from '@/view/campaign/create-edit/blocs/data.bloc.tsx';
import { AnnotationBloc } from '@/view/campaign/create-edit/blocs/annotation.bloc.tsx';
import { getErrorMessage } from '@/service/function.ts';
import { usePostAnnotationFileRangeMutation } from '@/service/campaign/annotation-file-range';
import { useImportResultMutation } from '@/service/campaign/result';

export const CreateCampaign: React.FC = () => {
  const blurUtil = useBlur();
  const toast = useToast();

  // Services
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [ createCampaign, { data: createdCampaign, isLoading: isSubmittingCampaign } ] = useCreateCampaignMutation()
  const [ postFileRanges, { isLoading: isSubmittingFileRanges } ] = usePostAnnotationFileRangeMutation()
  const [ importResults, { isLoading: isImportingResults } ] = useImportResultMutation()

  // State
  const draftCampaign = useAppSelector(selectDraftCampaign)
  const draftFileRanges = useAppSelector(selectDraftFileRange)
  const detectors = useAppSelector(state => state.campaign.resultImport.detectors)
  const [ resultFile, setResultFile ] = useState<File | undefined>();

  useEffect(() => {
    document.addEventListener('click', blurUtil.onClick)
    dispatch(clearCampaign())
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
      if (!await submitCampaign()) return;
      if (!await submitResults()) return;
      if (!await submitFileRanges()) return;

      history.push('/annotation-campaign');
    } catch (e: any) {
      toast.presentError(getErrorMessage(e));
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

  const submitResults = async (force: boolean = false) => {
    if (!createdCampaign) return;
    if (!resultFile) return;
    if (!detectors || detectors.length === 0) throw new Error('You should import results');
    try {
      return importResults({
        campaignID: createdCampaign.id,
        datasetName: createdCampaign.datasets[0],
        detectors,
        file: resultFile,
        force
      })
    } catch (e) {
      if (force) throw e;

      if ((e as any).status === 400) {
        const response = (e as any).response.text;
        const response_errors: string[] = JSON.parse(response).flatMap((result_error: any) => Object.values(result_error)).flat()
        const distinct_errors = [ ...new Set(response_errors) ];
        const outOfFilesError = "This start and end datetime does not belong to any file of the dataset";
        if (!response_errors.includes(outOfFilesError)) throw e
        const retry = await toast.presentError(distinct_errors.map((error: string) => {
          const count = response_errors.filter((err: string) => err.includes(error)).length;
          return `[${ count } results]: ${ error }`
        }).join('\n'), true);
        if (retry) return submitResults(true)
      }
    }
  }

  const submitFileRanges = () => {
    if (!createdCampaign) return;
    return postFileRanges({
      campaignID: createdCampaign.id,
      data: draftFileRanges.map(r => {
        const first_file_index = r.first_file_index === undefined ? 0 : (+r.first_file_index - 1);
        const last_file_index = r.last_file_index === undefined ? (createdCampaign.files_count - 1) : (+r.last_file_index - 1);
        return {
          id: r.id >= 0 ? r.id : undefined,
          first_file_index: first_file_index < 0 ? 0 : first_file_index,
          last_file_index: last_file_index < 0 ? createdCampaign.files_count! - 1 : last_file_index,
          annotator: r.annotator
        }
      })
    })
  }


  return (
    <form id="create-campaign-form"
          onSubmit={ handleSubmit }>
      <h1>Create Annotation Campaign</h1>

      <CampaignBloc/>

      <DataBloc/>

      <AnnotationBloc onFileImported={ setResultFile } onFileRemoved={ () => setResultFile(undefined) }/>

      <AnnotatorsRangeBloc/>

      <IonButton color="primary" type="submit"
                 disabled={ isSubmittingCampaign || isSubmittingFileRanges || isImportingResults }>
        Create campaign
        { (isSubmittingCampaign || isSubmittingFileRanges || isImportingResults) && <IonSpinner/> }
      </IonButton>
    </form>
  )
}
