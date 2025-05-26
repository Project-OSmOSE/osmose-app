import React, { Fragment, useCallback, useState } from "react";
import { useModal } from "@/service/ui/modal.ts";
import { useNavigate } from "react-router-dom";
import { Button, Modal, ModalHeader, WarningText } from "@/components/ui";
import { IonIcon, IonNote, IonSpinner } from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { createPortal } from "react-dom";
import styles from "./styles.module.scss";
import { getErrorMessage } from "@/service/function.ts";
import { FormBloc, Input, Select } from "@/components/form";
import { LabelSetDisplay } from "@/components/AnnotationCampaign";
import { CampaignAPI, PatchAnnotationCampaign, useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { CampaignPhaseAPI, useListPhasesForCurrentCampaign } from "@/service/api/campaign-phase.ts";
import { ConfidenceIndicatorSet, LabelSet } from "@/service/types";
import { LabelSetAPI } from "@/service/api/label-set.ts";
import { ConfidenceSetAPI } from "@/service/api/confidence-set.ts";
import { useAlert } from "@/service/ui";

type Errors = { [key in keyof PatchAnnotationCampaign]?: string }

export const CreateAnnotationPhaseButton: React.FC = () => {
  const { campaign } = useRetrieveCurrentCampaign()
  const modal = useModal();

  if (campaign?.archive) return <Fragment/>
  return <Fragment>
    <Button fill='clear' color='medium' onClick={ modal.toggle }>
      Annotation
      <IonIcon icon={ addOutline } slot="end"/>
    </Button>

    { modal.isOpen && createPortal(<CreateAnnotationPhaseModal onClose={ modal.close }/>, document.body) }
  </Fragment>
}

export const CreateAnnotationPhaseModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { campaign, isFetching: isFetchingCampaign, refetch } = useRetrieveCurrentCampaign()
  const [ postPhase, {
    isLoading: isPostingPhase,
    error: phaseError
  } ] = CampaignPhaseAPI.endpoints.postCampaignPhase.useMutation()
  const [ patchCampaign, {
    isLoading: isUpdatingCampaign,
    error: campaignError
  } ] = CampaignAPI.endpoints.patchCampaign.useMutation()
  const {
    data: allLabelSets,
    isFetching: isFetchingLabelSets,
    error: labelSetsError
  } = LabelSetAPI.endpoints.listLabelSet.useQuery();
  const {
    data: allConfidenceSets,
    isFetching: isFetchingConfidenceSets,
    error: confidenceSetsError
  } = ConfidenceSetAPI.endpoints.listConfidenceSet.useQuery();
  const navigate = useNavigate()

  const [ errors, setErrors ] = useState<Errors>({});
  const [ labelSet, setLabelSet ] = useState<LabelSet | null | undefined>(); // null stands for empty label set
  const [ labels_with_acoustic_features, setLabelsWithAcousticFeatures ] = useState<Array<string>>([]);
  const [ confidenceSet, setConfidenceSet ] = useState<ConfidenceIndicatorSet | undefined>();
  const [ allow_point_annotation, setAllowPointAnnotation ] = useState<boolean>(false);
  const onLabelSetChange = useCallback((value: number | string | undefined) => {
    if (value === 0) {
      setLabelSet(null)
    } else {
      setLabelSet(allLabelSets?.find(l => l.id === value))
    }
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
      label_set: labelSet === null ? 0 : labelSet?.id,
      confidence_indicator_set: confidenceSet?.id,
      labels_with_acoustic_features,
      allow_point_annotation,
    }).unwrap()
    const phase = await postPhase({ campaign, phase: 'Annotation' }).unwrap()
    await refetch().unwrap()
    navigate(`/annotation-campaign/${ campaign?.id }/phase/${ phase.id }`)
  }, [ campaign, labelSet, confidenceSet, labels_with_acoustic_features, allow_point_annotation ])

  if (campaign?.archive) return <Fragment/>
  return <Modal onClose={ onClose } className={ styles.modal }>
    <ModalHeader title='New annotation phase' onClose={ onClose }/>

    <div className={ styles.content }>
      <p>In an "Annotation" phase, you create new annotations.</p>


      <FormBloc>
        { (isFetchingLabelSets || isFetchingConfidenceSets) && <IonSpinner/> }

        {/*  /!* Label set */ }
        { labelSetsError &&
            <WarningText>Fail loading label sets:<br/>{ getErrorMessage(labelSetsError) }</WarningText> }
        { allLabelSets && <Select label="Label set" placeholder="Select a label set" error={ errors.label_set }
                                  options={ [ { value: 0, label: 'Empty' }, ...(allLabelSets?.map(s => ({
                                    value: s.id,
                                    label: s.name
                                  })) ?? []) ] }
                                  optionsContainer="alert"
                                  disabled={ !allLabelSets?.length }
                                  value={ labelSet === null ? 0 : labelSet?.id }
                                  onValueSelected={ onLabelSetChange }
                                  required>
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
      <Button color="medium" fill='clear' onClick={ onClose }>
        Cancel
      </Button>

      <div className={ styles.buttons }>
        { (isUpdatingCampaign || isPostingPhase || isFetchingCampaign) && <IonSpinner/> }
        <Button color="primary" fill='solid' onClick={ create }>
          Create
        </Button>
      </div>
    </div>
  </Modal>
}

export const CreateVerificationPhaseButton: React.FC = () => {
  const { campaign, isFetching: isFetchingCampaign, refetch } = useRetrieveCurrentCampaign()
  const { phases } = useListPhasesForCurrentCampaign()
  const [ post, { isLoading: isPostingPhase, error } ] = CampaignPhaseAPI.endpoints.postCampaignPhase.useMutation()
  const verificationModal = useModal();
  const annotationModal = useModal();
  const navigate = useNavigate()
  const alert = useAlert();

  const create = useCallback(async () => {
    if (!campaign) return;
    const phase = await post({ campaign, phase: 'Verification' }).unwrap()
    await refetch().unwrap()
    navigate(`/annotation-campaign/${ campaign?.id }/phase/${ phase.id }`)
  }, [ campaign ])

  const createAndImport = useCallback(async () => {
    if (!campaign) return;
    const phase = await post({ campaign, phase: 'Verification' }).unwrap()
    navigate(`/annotation-campaign/${ campaign?.id }/phase/${ phase.id }/import-annotations`)
  }, [ campaign ])

  const openModal = useCallback(() => {
    if (!phases) return;
    if (phases.find(p => p.phase === 'Annotation')) verificationModal.toggle()
    else {
      return alert.showAlert({
        type: 'Warning',
        message: 'A verification phase is made to check results from the "Annotation" phase. You should first create an "Annotation" phase, either to annotate the dataset or to import detectors annotations on it.',
        actions: [ {
          label: 'Create an "Annotation" campaign',
          callback: annotationModal.toggle
        } ]
      })
    }
  }, [ phases, verificationModal ])

  if (campaign?.archive || !phases) return <Fragment/>
  return <Fragment>
    <Button fill='clear' color='medium' onClick={ openModal }>
      Verification
      <IonIcon icon={ addOutline } slot="end"/>
    </Button>

    { verificationModal.isOpen && createPortal(<Modal onClose={ verificationModal.close } className={ styles.modal }>
      <ModalHeader title='New verification phase' onClose={ verificationModal.close }/>

      <div className={ styles.content }>
        <p>In a "Verification" phase, you can validate, invalidate, or add missing annotations.</p>
        <p>The annotations see come from the "Annotation" phase and are either made by your annotators or imported (for
          exemple the output of an automatic detector)</p>
        <p>Do you really want to create a "Verification" phase?</p>
        { error && <WarningText>{ getErrorMessage(error) }</WarningText> }
      </div>

      <div className={ styles.buttons }>
        <Button color="medium" fill='clear' onClick={ verificationModal.close }>
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

    { annotationModal.isOpen && createPortal(<CreateAnnotationPhaseModal
      onClose={ annotationModal.close }/>, document.body) }
  </Fragment>
}
