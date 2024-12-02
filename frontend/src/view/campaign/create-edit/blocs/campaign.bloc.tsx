import React, { Fragment, InputHTMLAttributes, useEffect, useImperativeHandle, useRef, useState } from "react";
import { BlocRef } from "@/view/campaign/create-edit/blocs/util.bloc.ts";
import { ChipsInput, FormBloc, Select, Textarea } from "@/components/form";
import {
  ConfidenceIndicatorSet,
  SpectrogramConfiguration,
} from "@/services/api";
import { LabelSetSelect } from "@/view/campaign/create-edit/blocs/input/label-set.select.tsx";
import { ConfidenceSetSelect } from "@/view/campaign/create-edit/blocs/input/confidence-set.select.tsx";
import { CheckAnnotationsInputs } from "@/view/campaign/create-edit/blocs/input/check-annotations.tsx";
import { InputRef } from "@/components/form/inputs/utils.ts";
import { Input, InputValue } from "@/components/form/inputs/input.tsx";
import { TextareaValue } from "@/components/form/inputs/textarea.tsx";
import { useAppDispatch } from '@/slices/app.ts';
import { importAnnotationsActions } from '@/slices/create-campaign/import-annotations.ts';
import {
  AnnotationCampaign,
  AnnotationCampaignUsage, BaseAnnotationCampaign, useCreateCampaignMutation,
  WriteCheckAnnotationCampaign,
  WriteCreateAnnotationCampaign
} from '@/service/campaign';
import { useListDatasetQuery, Dataset } from '@/service/dataset';
import { LabelSet } from '@/service/campaign/label-set';

type SubmitCampaign = WriteCreateAnnotationCampaign & WriteCheckAnnotationCampaign
type SubmitCampaignKeys = keyof SubmitCampaign

export const CampaignBloc = React.forwardRef<BlocRef, {
  onDatasetUpdated: (dataset?: Dataset) => void,
  onCampaignSubmitted: (campaign?: AnnotationCampaign) => void,
}>(({ onDatasetUpdated, onCampaignSubmitted }, ref) => {
  // API
  const submittedCampaign = useRef<AnnotationCampaign | undefined>();
  const nameInput = useRef<InputRef<InputHTMLAttributes<HTMLInputElement>['value']> | null>(null)
  const inputsRef = useRef<{ [key in SubmitCampaignKeys]: InputRef<InputValue | TextareaValue> | null }>({})
  const errors = useRef<{ [key in SubmitCampaignKeys]: string | undefined }>({})

  // Services
  const dispatch = useAppDispatch();
  const [ createCampaign ] = useCreateCampaignMutation()
  const { data: allDatasets } = useListDatasetQuery();

  // Global states
  const description = useRef<string | null>(null);
  // Dataset states
  const [ dataset, setDataset ] = useState<Dataset | undefined>();
  const _dataset = useRef<Dataset | undefined>()
  const [ spectrogramConfigurations, setSpectrogramConfigurations ] = useState<Array<SpectrogramConfiguration>>([]);
  const _spectrogramConfigurations = useRef<Array<SpectrogramConfiguration>>([])
  // Annotation states
  const [ usage, setUsage ] = useState<AnnotationCampaignUsage | undefined>();
  const _usage = useRef<AnnotationCampaignUsage | undefined>()
  const [ labelSet, setLabelSet ] = useState<LabelSet | undefined>();
  const _labelSet = useRef<LabelSet | undefined>()
  const [ confidenceSet, setConfidenceSet ] = useState<ConfidenceIndicatorSet | undefined>();
  const _confidenceSet = useRef<ConfidenceIndicatorSet | undefined>()
  useEffect(() => {
    _dataset.current = dataset
  }, [ dataset ]);
  useEffect(() => {
    _spectrogramConfigurations.current = spectrogramConfigurations
  }, [ spectrogramConfigurations ]);
  useEffect(() => {
    _usage.current = usage
  }, [ usage ]);
  useEffect(() => {
    _labelSet.current = labelSet
  }, [ labelSet ]);
  useEffect(() => {
    _confidenceSet.current = confidenceSet
  }, [ confidenceSet ]);


  // Import part ref
  const importResultsRef = useRef<BlocRef & { setCampaignID: (id: number) => void } | null>(null);

  // Loading
  useEffect(() => {
    if (allDatasets && allDatasets.length === 0) errors.current.datasets = "You should first import a dataset."
  }, [allDatasets]);

  // Submission
  const submit = async () => {
    if (!submittedCampaign.current) {
      try {
        const campaign = await submitCampaign();
        submittedCampaign.current = campaign;
        dispatch(importAnnotationsActions.setCampaignID(campaign?.id))
        onCampaignSubmitted(campaign);
      } catch (e) {
        let realError = e;
        if ((e as any).status === 400) {
          const response = (e as any).response.text;
          try {
            const response_errors = JSON.parse(response);
            for (const [ key, value ] of Object.entries(response_errors)) {
              const error = (value as Array<string>).join(' ')
              inputsRef.current[key]?.setError(error);
              errors.current[key] = error;
            }
            if (response_errors.non_field_errors)
              realError = response_errors.non_field_errors;
          } catch (e) {
            console.warn(e)
          }
        }
        throw realError
      }
    }
    if (submittedCampaign.current)
      importResultsRef.current?.setCampaignID(submittedCampaign.current.id)
    if (_usage.current === 'Create') {
      if (Object.values(errors.current).filter(v => !!v).length > 0) throw errors.current;
      return
    }
    await importResultsRef?.current?.submit();
    dispatch(importAnnotationsActions.setCampaignID(undefined))
  }
  const submitCampaign = () => {
    if (!inputsRef.current.name?.validate() || !_dataset.current?.name) throw new Error('Some fields are missing');
    const desc: string | null = description.current?.trim() ?? null;
    const url: string | null = (inputsRef.current.instructions_url?.validate() as string)?.trim() ?? null;
    const deadline: string | null = (inputsRef.current.deadline?.validate() as string)?.trim() ?? null;
    const data: BaseAnnotationCampaign = {
      name: inputsRef.current.name.validate() as string,
      desc: desc === '' ? null : desc,
      instructions_url: url === '' ? null : url,
      deadline: deadline === '' ? null : deadline,
      datasets: [ _dataset.current.name ],
      spectro_configs: _spectrogramConfigurations.current.map(s => s.id)
    }

    switch (_usage.current) {
      case 'Create':
        if (!_labelSet.current?.id) throw new Error('Some fields are missing');
        return createCampaign({
          ...data,
          usage: 'Create',
          label_set: _labelSet.current.id,
          confidence_indicator_set: _confidenceSet.current?.id ?? null
        }).unwrap();
      case 'Check':
        return createCampaign({
          ...data,
          usage: 'Check',
        }).unwrap();
    }
  }

  // Ref
  useImperativeHandle(ref, () => ({
    submit,
    get isValid() {
      try {
        nameInput.current?.validate();
        return !!dataset && !!spectrogramConfigurations.length && !!importResultsRef.current?.isValid
      } catch {
        return false;
      }
    },
  }), [ nameInput.current, dataset, spectrogramConfigurations ])

  // Interface updates
  const onDatasetChange = (id: string | number | undefined) => {
    const dataset = allDatasets?.find(d => d.id === id)
    setDataset(dataset)
    setSpectrogramConfigurations(dataset?.spectros ?? [])
    onDatasetUpdated(dataset)
    errors.current.dataset = undefined;
    dispatch(importAnnotationsActions.setDatasetName(dataset?.name))
  }

  const onSpectrogramConfigurationsChange = (ids: Array<string | number>) => {
    setSpectrogramConfigurations(dataset?.spectros.filter((c: any) => ids.includes(c.id)) ?? [])
    errors.current.spectro_configs = undefined;
  }

  const onUsageChange = (value: string | number | undefined) => {
    setUsage(value as AnnotationCampaignUsage);
    errors.current.usage = undefined;
  }

  const onLabelSetChange = (set: LabelSet | undefined) => {
    setLabelSet(set);
    errors.current.label_set = undefined;
  }

  return <Fragment>
    <FormBloc> {/* Global */ }
      <Input label="Name"
             placeholder="Campaign name"
             ref={ el => inputsRef.current.name = el }
             required={ true }
             disabled={ !!submittedCampaign.current }/>

      <Textarea label="Description" placeholder="Enter your campaign description"
                error={ errors.current.desc }
                onChange={ e => description.current = e.target.value }
                disabled={ !!submittedCampaign.current }/>

      <Input label="Instruction URL" placeholder="URL" ref={ el => inputsRef.current.instructions_url = el }
             disabled={ !!submittedCampaign.current }/>

      <Input label="Deadline"
             type="date"
             placeholder="Deadline"
             ref={ el => inputsRef.current.deadline = el }
             disabled={ !!submittedCampaign.current }/>
    </FormBloc>

    <FormBloc label="Data">
      <Select label="Dataset"
              required={ true }
              error={ errors.current.datasets }
              placeholder="Select a dataset"
              options={ allDatasets?.map(d => ({ value: d.id, label: d.name })) ?? [] }
              optionsContainer="alert"
              value={ dataset?.id }
              isLoading={ !allDatasets }
              disabled={ !allDatasets || !allDatasets.length || !!submittedCampaign.current }
              onValueSelected={ onDatasetChange }/>

      { dataset && <ChipsInput required={ true }
                               error={ errors.current.spectro_configs }
                               label="Spectrogram configurations"
                               disabled={ !dataset?.spectros?.length || !!submittedCampaign.current }
                               items={ dataset?.spectros.map((c: any) => ({ value: c.id, label: c.name })) ?? [] }
                               activeItemsValues={ spectrogramConfigurations.map(i => i.id) }
                               setActiveItemsValues={ onSpectrogramConfigurationsChange }/> }
    </FormBloc>


    <FormBloc label="Annotation">
      <Select required={ true }
              error={ errors.current.usage }
              label="Annotation mode" placeholder="Select an annotation mode"
              options={ [
                { value: 'Create', label: 'Create annotations' },
                { value: 'Check', label: 'Check annotations' },
              ] }
              optionsContainer="popover"
              value={ usage }
              disabled={ !!submittedCampaign.current }
              onValueSelected={ onUsageChange }/>

      { usage === 'Create' &&
          <LabelSetSelect labelSet={ labelSet }
                          error={ errors.current.label_set }
                          onLabelSetChange={ onLabelSetChange }
                          disabled={ !!submittedCampaign.current }/> }

      { usage === 'Create' &&
          <ConfidenceSetSelect confidenceSet={ confidenceSet }
                               error={ errors.current.confidence_indicator_set }
                               onConfidenceSetChange={ setConfidenceSet }
                               disabled={ !!submittedCampaign.current }/> }

      { usage === 'Check' &&
          <CheckAnnotationsInputs ref={ importResultsRef }
                                  dataset={ dataset }/> }
    </FormBloc>
  </Fragment>
});
