import React, { Fragment, useEffect, useState } from "react";
import { IonButton, IonIcon, IonNote } from "@ionic/react";
import { cloudUploadOutline, trashOutline } from "ionicons/icons";
import { createCampaignActions, } from "@/slices/create-campaign";
import { useBlur } from "@/services/utils/clic";
import {
  AnnotationSetList,
  ConfidenceSetList,
  DetectorList,
  useAnnotationSetAPI,
  useConfidenceSetAPI,
  useDetectorsAPI
} from '@/services/api';
import { ChipsInput, FormBloc, Select } from "@/components/form";
import { Usage } from "@/types/annotations.ts";
import { ImportModal } from "./import-modal/import-modal.component.tsx";
import { useAppDispatch, useAppSelector } from "@/slices/app";
import { importAnnotationsActions } from "@/slices/create-campaign/import-annotations.ts";
import { useToast } from "@/services/utils/toast.ts";


export const AnnotationsBloc: React.FC = () => {
  // API Data
  const [allAnnotationSets, setAllAnnotationSets] = useState<AnnotationSetList>([]);
  const annotationSetAPI = useAnnotationSetAPI();
  const [allConfidenceSets, setAllConfidenceSets] = useState<ConfidenceSetList>([]);
  const confidenceSetAPI = useConfidenceSetAPI();
  const [allDetectors, setAllDetectors] = useState<DetectorList>([]);
  const detectorsAPI = useDetectorsAPI();

  // Services
  const blurUtil = useBlur();
  const toast = useToast();

  useEffect(() => {
    blurUtil.addListener(blur)
    let isCancelled = false;
    Promise.all([
      annotationSetAPI.list().then(setAllAnnotationSets),
      confidenceSetAPI.list().then(setAllConfidenceSets),
      detectorsAPI.list().then(setAllDetectors),
    ]).catch(e => !isCancelled && toast.presentError(e));

    return () => {
      isCancelled = true;
      annotationSetAPI.abort();
      confidenceSetAPI.abort();
      detectorsAPI.abort();
    }
  }, [])

  // Form data
  const dispatch = useAppDispatch();
  const usage = useAppSelector(state => state.createCampaignForm.global.usage);

  const onUsageChange = (value: string | number | undefined) => {
    dispatch(createCampaignActions.updateUsage(value as Usage));
  }


  return (
    <FormBloc label="Annotation">
      <Select required={ true }
              label="Annotation mode" placeholder="Select an annotation mode"
              options={ [
                { value: Usage.create, label: 'Create annotations' },
                { value: Usage.check, label: 'Check annotations' },
              ] }
              optionsContainer="popover"
              value={ usage }
              onValueSelected={ onUsageChange }/>

      {/* Create annotation mode*/ }
      { usage === Usage.create && <CreateAnnotationsInputs allAnnotationSets={ allAnnotationSets }
                                                           allConfidenceSets={ allConfidenceSets }/> }

      {/* Check annotation mode*/ }
      { usage === Usage.check && <CheckAnnotationsInputs allDetectors={ allDetectors }/> }
    </FormBloc>
  )
}

interface CreateAnnotationsProps {
  allAnnotationSets: AnnotationSetList,
  allConfidenceSets: ConfidenceSetList
}

const CreateAnnotationsInputs: React.FC<CreateAnnotationsProps> = ({
                                                                     allAnnotationSets,
                                                                     allConfidenceSets
                                                                   }) => {

  // Form data
  const dispatch = useAppDispatch();
  const {
    annotationSet,
    confidenceSet
  } = useAppSelector(state => state.createCampaignForm.global);

  const onAnnotatorSetChange = (value: string | number | undefined) => {
    dispatch(createCampaignActions.updateAnnotationSet(allAnnotationSets.find(s => s.id === value)));
  }

  const onConfidenceSetChange = (value: string | number | undefined) => {
    dispatch(createCampaignActions.updateConfidenceSet(allConfidenceSets.find(s => s.id === value)));
  }

  return (
    <Fragment>
      <Select label="Annotation set" placeholder="Select an annotation set"
              required={ true }
              options={ allAnnotationSets.map(s => ({ value: s.id, label: s.name })) }
              optionsContainer="alert"
              value={ annotationSet?.id }
              onValueSelected={ onAnnotatorSetChange }>
        { !!annotationSet && (
          <Fragment>
            { annotationSet.desc }
            <p><span className="bold">Tags:</span> { annotationSet.tags.join(', ') }</p>
          </Fragment>)
        }
      </Select>

      <Select label="Confidence indicator set" placeholder="Select a confidence set"
              options={ allConfidenceSets.map(s => ({ value: s.id, label: s.name })) }
              optionsContainer="alert"
              value={ confidenceSet?.id }
              onValueSelected={ onConfidenceSetChange }>
        { !!confidenceSet && (
          <Fragment>
            { confidenceSet?.desc }
            { confidenceSet?.confidence_indicators.map(c => (
              <p key={ c.level }><span className="bold">{ c.level }:</span> { c.label }</p>
            )) }
          </Fragment>)
        }
      </Select>
    </Fragment>
  )
}

interface CheckAnnotationsProps {
  allDetectors: DetectorList,
}

const CheckAnnotationsInputs: React.FC<CheckAnnotationsProps> = ({
                                                                   allDetectors,
                                                                 }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form data
  const dispatch = useAppDispatch();
  const {
    dataset,
    detectors,
  } = useAppSelector(state => state.createCampaignForm.global);

  const onDetectorsChange = (array: Array<string | number>) => {
    dispatch(createCampaignActions.updateDetectors(detectors.filter(d => array.includes(d.initialName))));
  }

  const openImportModal = () => {
    setIsModalOpen(true)
  }

  const deleteDetectors = () => {
    dispatch(createCampaignActions.setDetectors([]))
    dispatch(importAnnotationsActions.clear());
  }


  return (
    <Fragment>
      { !detectors.length && <Fragment>
          <div id="import-button" className="d-flex justify-content-center">
              <IonButton color="secondary" className="center"
                         onClick={ openImportModal }
                         disabled={ !dataset } aria-disabled={ !dataset }>
                  Import annotations
                  <IonIcon icon={ cloudUploadOutline } slot="end"/>
              </IonButton>
              <input required={ true } className="hide-real-input"
                     value={ detectors.length ? "ok" : undefined }
                     onChange={ () => {
                     } }/>
          </div>
        { !dataset &&
            <IonNote color="danger" className="center" aria-disabled>
                You must select a dataset to import annotations
            </IonNote> }
      </Fragment> }

      { !!dataset && <ImportModal isOpen={ isModalOpen }
                                  setIsOpen={ setIsModalOpen }
                                  allDetectors={ allDetectors }/> }


      { detectors.length > 0 && <div id="detector-import-results">
          <ChipsInput label="Detectors"
                      required={ true }
                      items={ detectors.map(d => {
                        const name = d.existingDetector?.name ?? d.initialName;
                        const oldName = d.existingDetector && d.existingDetector.name !== d.initialName ? ` (${d.initialName})` : '';
                        return {
                          value: d.initialName,
                          label: name + oldName
                        }
                      }) }
                      activeItemsValues={ detectors.map(d => d.initialName) }
                      setActiveItemsValues={ onDetectorsChange }/>

          <IonButton color="danger" onClick={ deleteDetectors }>
              <IonIcon icon={ trashOutline } slot="icon-only"/>
          </IonButton>
      </div> }
    </Fragment>
  )
}
