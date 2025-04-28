import React, { ChangeEvent, Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from './create.module.scss'
import { ChipsInput, FormBloc, Input, Select, Switch, Textarea } from "@/components/form";
import {
  AnnotationCampaignUsage,
  BaseAnnotationCampaign,
  CampaignAPI,
  WriteCheckAnnotationCampaign,
  WriteCreateAnnotationCampaign
} from "@/service/campaign";
import { Dataset, DatasetAPI } from "@/service/dataset";
import { IonButton, IonNote, IonSpinner } from "@ionic/react";
import { getErrorMessage } from "@/service/function.ts";
import { SpectrogramConfiguration } from "@/service/dataset/spectrogram-configuration";
import { LabelSet, LabelSetAPI } from "@/service/campaign/label-set";
import { ConfidenceIndicatorSet, ConfidenceSetAPI } from "@/service/campaign/confidence-set";
import { LabelSetDisplay } from "@/components/AnnotationCampaign";
import { useToast } from "@/service/ui";
import { useNavigate } from "react-router-dom";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Colormap, COLORMAP_GREYS, COLORMAPS } from "@/services/utils/color.ts";
import { WarningText } from "@/components/ui";

type Errors = { [key in (keyof WriteCheckAnnotationCampaign) | (keyof WriteCreateAnnotationCampaign)]?: string }

export const CreateCampaign: React.FC = () => {

  const { data: allDatasets, isFetching: isFetchingDatasets, error: datasetsError } = DatasetAPI.useListQuery({});
  const { data: allLabelSets, isFetching: isFetchingLabelSets, error: labelSetsError } = LabelSetAPI.useListQuery();
  const {
    data: allConfidenceSets,
    isFetching: isFetchingConfidenceSets,
    error: confidenceSetsError
  } = ConfidenceSetAPI.useListQuery();
  const [ createCampaign, {
    data: createdCampaign,
    isLoading: isSubmittingCampaign,
    error: errorSubmittingCampaign
  } ] = CampaignAPI.useCreateMutation()
  const toast = useToast();
  const navigate = useNavigate();

  const [ errors, setErrors ] = useState<Errors>({});
  const page = useRef<HTMLDivElement | null>(null);

  // Global information
  const [ name, setName ] = useState<string>('');
  const [ desc, setDesc ] = useState<string>('');
  const [ instructions_url, setInstructionsUrl ] = useState<string>('');
  const [ deadline, setDeadline ] = useState<string>('');
  const [ usage, setUsage ] = useState<AnnotationCampaignUsage>('Create');
  const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setErrors(prev => ({ ...prev, name: undefined }))
  }, [])
  const onDescChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setDesc(e.target.value)
    setErrors(prev => ({ ...prev, desc: undefined }))
  }, [])
  const onInstructionsURLChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInstructionsUrl(e.target.value)
    setErrors(prev => ({ ...prev, instructions_url: undefined }))
  }, [])
  const onDeadlineChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setDeadline(e.target.value)
    setErrors(prev => ({ ...prev, deadline: undefined }))
  }, [])
  const onUsageChange = useCallback((selection: string) => {
    switch (selection) {
      case "Check annotations":
        setUsage('Check');
        break;
      case "Create annotations":
        setUsage('Create');
        break;
    }
    setErrors(prev => ({ ...prev, usage: undefined }))
  }, [])

  // Data
  const [ dataset, setDataset ] = useState<Dataset | undefined>();
  const [ spectro_configs, setSpectroConfigs ] = useState<Array<SpectrogramConfiguration>>([]);
  const onDatasetChange = useCallback((value: number | string | undefined) => {
    const d = allDatasets?.find(d => d.name === value);
    setDataset(d)
    setSpectroConfigs(d?.spectros ?? [])
    setErrors(prev => ({ ...prev, datasets: undefined }))
  }, [ allDatasets ])
  const onSpectroConfigsChange = useCallback((selection: Array<string | number>) => {
    setSpectroConfigs(dataset?.spectros.filter(s => selection.indexOf(s.id) > -1) ?? [])
    setErrors(prev => ({ ...prev, spectro_configs: undefined }))
  }, [ dataset?.spectros ])

  // Spectrogram tuning
  const [ allow_image_tuning, setAllowImageTuning ] = useState<boolean>(false);
  const [ allow_colormap_tuning, setAllowColormapTuning ] = useState<boolean>(false);
  const [ colormap_default, setColormapDefault ] = useState<Colormap | null>(null);
  const [ colormap_inverted_default, setColormapInvertedDefault ] = useState<boolean | null>(null);
  const onAllowImageTuningChange = useCallback(() => {
    setAllowImageTuning(prev => !prev)
    setErrors(prev => ({ ...prev, allow_image_tuning: undefined }))
  }, [ setAllowImageTuning, setErrors ])
  const onAllowColormapTuningChange = useCallback(() => {
    setAllowColormapTuning(prev => {
      const newValue = !prev;
      setColormapDefault(newValue ? 'Greys' : null)
      setColormapInvertedDefault(newValue ? false : null)
      return newValue
    })
    setErrors(prev => ({ ...prev, allow_colormap_tuning: undefined }))
  }, [ setAllowColormapTuning, setColormapDefault, setErrors ])
  const onColormapDefaultChange = useCallback((value: string | number | undefined) => {
    setColormapDefault(value as Colormap ?? null)
    setErrors(prev => ({ ...prev, colormap_default: undefined }))
  }, [ setColormapDefault, setErrors ])
  const onColormapInvertedDefaultChange = useCallback(() => {
    setColormapInvertedDefault(prev => !prev)
    setErrors(prev => ({ ...prev, colormap_inverted_default: undefined }))
  }, [ setColormapInvertedDefault, setErrors ])
  const isColormapEditable = useMemo(() => {
    return spectro_configs?.map((config) => config.colormap).includes("Greys");
  }, [ spectro_configs ]);

  // Annotation
  const [ labelSet, setLabelSet ] = useState<LabelSet | undefined>();
  const [ labels_with_acoustic_features, setLabelsWithAcousticFeatures ] = useState<Array<string>>([]);
  const [ confidenceSet, setConfidenceSet ] = useState<ConfidenceIndicatorSet | undefined>();
  const [ allow_point_annotation, setAllowPointAnnotation ] = useState<boolean>(false);
  const onLabelSetChange = useCallback((value: number | string | undefined) => {
    setLabelSet(allLabelSets?.find(l => l.id === value))
    setErrors(prev => ({ ...prev, label_set: undefined }))
  }, [ allLabelSets ])
  const onLabelWithAcousticFeaturesChange = useCallback((selection: Array<string>) => {
    setLabelsWithAcousticFeatures(selection)
    setErrors(prev => ({ ...prev, labels_with_acoustic_features: undefined }))
  }, [])
  const onConfidenceSetChange = useCallback((value: number | string | undefined) => {
    setConfidenceSet(allConfidenceSets?.find(c => c.id === value))
    setErrors(prev => ({ ...prev, confidence_indicator_set: undefined }))
  }, [ allConfidenceSets ])
  const onAllowPointAnnotationChange = useCallback(() => {
    setAllowPointAnnotation(prev => !prev)
    setErrors(prev => ({ ...prev, allow_point_annotation: undefined }))
  }, [])

  // Submit
  const submit = useCallback(() => {
    if (!name || !dataset || spectro_configs.length === 0 || (usage === 'Create' && !labelSet)) {
      const errors: Errors = {};
      if (!name) errors.name = 'Name is required';
      if (!dataset) errors.datasets = 'Dataset is required';
      if (spectro_configs.length === 0) errors.spectro_configs = 'A spectrogram configuration is required';
      if (usage === 'Create' && !labelSet) errors.label_set = 'Label set is required';
      setErrors(errors);
      page.current?.scrollTo({ top: 0, left: 0 });
      return;
    }
    const base: BaseAnnotationCampaign = {
      name, desc, instructions_url, deadline,
      datasets: [ dataset.name ], spectro_configs: spectro_configs?.map(s => s.id),
      labels_with_acoustic_features: labelSet ? labels_with_acoustic_features.filter(l => labelSet.labels.indexOf(l) > -1) : [],
      allow_point_annotation,
      allow_image_tuning,
      allow_colormap_tuning,
      colormap_default,
      colormap_inverted_default,
    }
    switch (usage) {
      case "Create":
        createCampaign({
          ...base, usage,
          label_set: labelSet!.id,
          confidence_indicator_set: confidenceSet?.id ?? null,
        })
        break;
      case "Check":
        createCampaign({ ...base, usage })
        break;
    }
  }, [ name, desc, instructions_url, deadline, dataset, spectro_configs, labelSet, labels_with_acoustic_features, confidenceSet, allow_point_annotation, usage ])
  useEffect(() => {
    if (errorSubmittingCampaign) {
      toast.presentError(errorSubmittingCampaign)
      const data = (errorSubmittingCampaign as FetchBaseQueryError).data as any;
      if (!data) return;
      setErrors(data)
      page.current?.scrollTo({ top: 0, left: 0 });
    }
  }, [ errorSubmittingCampaign ]);
  useEffect(() => {
    if (!createdCampaign) return;
    switch (usage) {
      case 'Create':
        navigate(`/annotation-campaign/${ createdCampaign.id }/edit-annotators`, { state: { fromCreateCampaign: true } })
        break;
      case 'Check':
        navigate(`/annotation-campaign/${ createdCampaign.id }/import-annotations`, { state: { fromCreateCampaign: true } })
        break;
    }
  }, [ createdCampaign, usage ]);

  return <div className={ styles.page } ref={ page }>

    <h2>Create Annotation Campaign</h2>

    {/* Global */ }
    <FormBloc>
      <Input label="Name" placeholder="Campaign name" error={ errors.name }
             value={ name } onChange={ onNameChange }
             required={ true }/>

      <Textarea label="Description" placeholder="Enter your campaign description" error={ errors.desc }
                value={ desc } onChange={ onDescChange }/>

      <Input label="Instruction URL" placeholder="URL" error={ errors.instructions_url }
             value={ instructions_url } onChange={ onInstructionsURLChange }/>

      <Input label="Deadline" type="date" placeholder="Deadline" error={ errors.deadline }
             value={ deadline } onChange={ onDeadlineChange }/>

      <Switch label="Annotation mode" options={ [ 'Create annotations', 'Check annotations' ] } error={ errors.usage }
              value={ `${ usage } annotations` } onValueSelected={ onUsageChange }
              required={ true }/>
    </FormBloc>

    {/* Dataset & Spectro config */ }
    <FormBloc label="Data">

      { isFetchingDatasets && <IonSpinner/> }

      { datasetsError &&
          <WarningText>Fail loading datasets:<br/>{ getErrorMessage(datasetsError) }</WarningText> }

      { allDatasets && <Fragment>
          <Select label="Dataset" placeholder="Select a dataset" error={ errors.datasets }
                  options={ allDatasets.map(d => ({ value: d.name, label: d.name })) ?? [] } optionsContainer="alert"
                  value={ dataset?.name } disabled={ !allDatasets.length } onValueSelected={ onDatasetChange }
                  required={ true }/>
        { allDatasets.length === 0 && <IonNote>You should first import a dataset</IonNote> }

        { dataset && <ChipsInput label="Spectrogram configurations" error={ errors.spectro_configs }
                                 disabled={ !dataset.spectros?.length }
                                 items={ dataset?.spectros.map((c: any) => ({
                                   value: c.id,
                                   label: c.name
                                 })) ?? [] }
                                 activeItemsValues={ spectro_configs.map(s => s.id) }
                                 setActiveItemsValues={ onSpectroConfigsChange }
                                 required={ true }/> }
      </Fragment> }
    </FormBloc>

    {/* Spectrogram tuning */ }
    <FormBloc label="Spectrogram Tuning">
      {/* Allow brightness / contrast tuning */ }
      <Input type="checkbox" label="Allow brigthness / contrast modification"
             checked={ allow_image_tuning } onChange={ onAllowImageTuningChange }/>

      {/* Allow colormap tuning */ }
      <Input type="checkbox" label="Allow colormap modification" disabled={ !isColormapEditable }
             checked={ allow_colormap_tuning } onChange={ onAllowColormapTuningChange }
             note={ isColormapEditable ? undefined : "Available only when at least one spectrogram configuration was generated in grey scale" }/>

      {/* Default colormap */ }
      { allow_colormap_tuning && <Select
          required={ true }
          label="Default colormap"
          value={ colormap_default ?? COLORMAP_GREYS }
          placeholder="Select a default colormap"
          optionsContainer="popover"
          options={ Object.keys(COLORMAPS).map((colormap) => ({
            value: colormap, label: colormap, img: `/app/images/colormaps/${ colormap.toLowerCase() }.png`
          })) }
          onValueSelected={ onColormapDefaultChange }/> }

      {/* Default colormap inverted? */ }
      { allow_colormap_tuning && <Input type="checkbox" label="Invert default colormap" disabled={ !isColormapEditable }
                                        checked={ colormap_inverted_default ?? false }
                                        onChange={ onColormapInvertedDefaultChange }
                                        note={ isColormapEditable ? undefined : "Available only when at least one spectrogram configuration was generated in grey scale" }/> }
    </FormBloc>

    {/* Create mode: Annotations */ }
    { usage === 'Create' && <FormBloc label="Annotation">

      { (isFetchingLabelSets || isFetchingConfidenceSets) && <IonSpinner/> }

      {/* Label set */ }
      { labelSetsError &&
          <WarningText>Fail loading label sets:<br/>{ getErrorMessage(labelSetsError) }</WarningText> }
      { allLabelSets && <Select label="Label set" placeholder="Select a label set" error={ errors.label_set }
                                options={ allLabelSets?.map(s => ({ value: s.id, label: s.name })) ?? [] }
                                optionsContainer="alert"
                                disabled={ !allLabelSets?.length }
                                value={ labelSet?.id }
                                onValueSelected={ onLabelSetChange }
                                required={ true }>
        { labelSet && (<LabelSetDisplay set={ labelSet }
                                        labelsWithAcousticFeatures={ labels_with_acoustic_features }
                                        setLabelsWithAcousticFeatures={ onLabelWithAcousticFeaturesChange }/>) }

        { allLabelSets.length === 0 && <IonNote>You need to create a label set to use it in your campaign</IonNote> }
      </Select> }

      {/* Confidence set */ }
      { confidenceSetsError &&
          <WarningText>Fail loading confidence sets:<br/>{ getErrorMessage(confidenceSetsError) }
          </WarningText> }
      { allConfidenceSets && <Select label="Confidence indicator set" placeholder="Select a confidence set"
                                     error={ errors.confidence_indicator_set }
                                     options={ allConfidenceSets?.map(s => ({ value: s.id, label: s.name })) ?? [] }
                                     optionsContainer="alert"
                                     disabled={ !allConfidenceSets?.length }
                                     value={ confidenceSet?.id }
                                     onValueSelected={ onConfidenceSetChange }>
        { confidenceSet && (
          <Fragment>
            { confidenceSet.desc }
            { confidenceSet.confidence_indicators.map(c => (
              <p key={ c.level }><b>{ c.level }:</b> { c.label }</p>
            )) }
          </Fragment>)
        }
        { allConfidenceSets.length === 0 &&
            <IonNote>You need to create a confidence set to use it in your campaign</IonNote> }
      </Select> }

        <Input type="checkbox" label='Allow annotations of type "Point"'
               checked={ allow_point_annotation } onChange={ onAllowPointAnnotationChange }/>

    </FormBloc> }

    <div className={ styles.buttons }>
      { isSubmittingCampaign && <IonSpinner/> }
      <IonButton disabled={ isSubmittingCampaign } onClick={ submit }>
        Create campaign
      </IonButton>
    </div>
  </div>
}