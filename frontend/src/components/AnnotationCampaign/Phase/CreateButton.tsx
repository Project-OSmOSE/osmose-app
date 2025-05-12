import React, { Fragment, useCallback, useState } from "react";
import { CampaignAPI, WriteCheckAnnotationCampaign, WriteCreateAnnotationCampaign } from "@/service/campaign";
import { CampaignPhaseAPI } from "@/service/campaign/phase";
import { useModal } from "@/service/ui/modal.ts";
import { useAppDispatch } from "@/service/app.ts";
import { useNavigate } from "react-router-dom";
import { Button, Modal, ModalHeader, WarningText } from "@/components/ui";
import { IonIcon, IonNote, IonSpinner } from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { createPortal } from "react-dom";
import styles from "./styles.module.scss";
import { getErrorMessage } from "@/service/function.ts";
import { ConfidenceIndicatorSet, ConfidenceSetAPI } from "@/service/campaign/confidence-set";
import { LabelSet, LabelSetAPI } from "@/service/campaign/label-set";
import { FormBloc, Input, Select } from "@/components/form";
import { LabelSetDisplay } from "@/components/AnnotationCampaign";

type Errors = { [key in (keyof WriteCheckAnnotationCampaign) | (keyof WriteCreateAnnotationCampaign)]?: string }

export const CreateAnnotationPhaseButton: React.FC = () => {
  const { data: campaign, isFetching: isFetchingCampaign, refetch } = CampaignAPI.useRetrieveQuery()
  const [ postPhase, { isLoading: isPostingPhase, error: phaseError } ] = CampaignPhaseAPI.useCreateMutation()
  const [ patchCampaign, { isLoading: isUpdatingCampaign, error: campaignError } ] = CampaignAPI.usePatchMutation()
  const { data: allLabelSets, isFetching: isFetchingLabelSets, error: labelSetsError } = LabelSetAPI.useListQuery();
  const {
    data: allConfidenceSets,
    isFetching: isFetchingConfidenceSets,
    error: confidenceSetsError
  } = ConfidenceSetAPI.useListQuery();
  const modal = useModal();
  const navigate = useNavigate()

  const [ errors, setErrors ] = useState<Errors>({});
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

  const create = useCallback(async () => {
    if (!campaign) return;
    await patchCampaign({
      id: campaign.id,
      label_set: labelSet?.id,
      confidence_indicator_set: confidenceSet?.id,
      labels_with_acoustic_features,
      allow_point_annotation,
    }).unwrap()
    const phase = await postPhase({ campaign, phase: 'Annotation' }).unwrap()
    await refetch().unwrap()
    navigate(`/annotation-campaign/${ campaign?.id }/phase/${ phase.id }`)
  }, [ campaign, labelSet, confidenceSet, labels_with_acoustic_features, allow_point_annotation ])

  return <Fragment>
    <Button fill='clear' color='medium' onClick={ modal.toggle }>
      Annotation
      <IonIcon icon={ addOutline } slot="end"/>
    </Button>

    { modal.isOpen && createPortal(<Modal onClose={ modal.close } className={ styles.modal }>
      <ModalHeader title='New annotation phase' onClose={ modal.close }/>

      <div className={ styles.content }>
        <p>In an "Annotation" phase, you create new annotations.</p>


        <FormBloc>
          { (isFetchingLabelSets || isFetchingConfidenceSets) && <IonSpinner/> }

          {/*  /!* Label set */ }
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

            { allLabelSets.length === 0 &&
                <IonNote>You need to create a label set to use it in your campaign</IonNote> }
          </Select> }

          {/*  /!* Confidence set */ }
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

        </FormBloc>

        { phaseError && <WarningText>{ getErrorMessage(phaseError) }</WarningText> }
        { campaignError && <WarningText>{ getErrorMessage(campaignError) }</WarningText> }
      </div>
      <div className={ styles.buttons }>
        <Button color="medium" fill='clear' onClick={ modal.close }>
          Cancel
        </Button>

        <div className={ styles.buttons }>
          { (isUpdatingCampaign || isPostingPhase || isFetchingCampaign) && <IonSpinner/> }
          <Button color="primary" fill='solid' onClick={ create }>
            Create
          </Button>
        </div>
      </div>
    </Modal>, document.body) }
  </Fragment>
}

export const CreateVerificationPhaseButton: React.FC = () => {
  const { data: campaign, isFetching: isFetchingCampaign, refetch } = CampaignAPI.useRetrieveQuery()
  const [ post, { isLoading: isPostingPhase, error } ] = CampaignPhaseAPI.useCreateMutation()
  const modal = useModal();
  const dispatch = useAppDispatch();
  const navigate = useNavigate()

  const create = useCallback(async () => {
    if (!campaign) return;
    const phase = await post({ campaign, phase: 'Verification' }).unwrap()
    await refetch().unwrap()
    navigate(`/annotation-campaign/${ campaign?.id }/phase/${ phase.id }`)
  }, [ campaign ])

  const createAndImport = useCallback(async () => {
    if (!campaign) return;
    const phase = await post({ campaign, phase: 'Verification' }).unwrap()
    dispatch(CampaignAPI.util?.invalidateTags([ { type: 'AnnotationCampaign', id: campaign.id } ]));
    navigate(`/annotation-campaign/${ campaign?.id }/phase/${ phase.id }/import-annotations`)
  }, [ campaign ])

  return <Fragment>
    <Button fill='clear' color='medium' onClick={ modal.toggle }>
      Verification
      <IonIcon icon={ addOutline } slot="end"/>
    </Button>

    { modal.isOpen && createPortal(<Modal onClose={ modal.close } className={ styles.modal }>
      <ModalHeader title='New verification phase' onClose={ modal.close }/>

      <div className={ styles.content }>
        <p>In a "Verification" phase, you can validate, invalidate, or add missing annotations.</p>
        <p>The annotations you can see come from:</p>
        <ul>
          <li>The "Annotation" phase</li>
          <li>Imported annotations, for exemple the output of an automatic detector</li>
        </ul>
        <p>Do you really want to create a "Verification" phase?</p>
        { error && <WarningText>{ getErrorMessage(error) }</WarningText> }
      </div>

      <div className={ styles.buttons }>
        <Button color="medium" fill='clear' onClick={ modal.close }>
          Cancel
        </Button>

        <div className={ styles.buttons }>
          { (isPostingPhase || isFetchingCampaign) && <IonSpinner/> }
          <Button color="primary" fill='clear' onClick={ createAndImport }>
            Create and import annotations
          </Button>
          <Button color="primary" fill='solid' onClick={ create }>
            Create
          </Button>
        </div>
      </div>
    </Modal>, document.body) }
  </Fragment>
}
