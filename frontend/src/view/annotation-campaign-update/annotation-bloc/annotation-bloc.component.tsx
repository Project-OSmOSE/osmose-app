import React, { Fragment, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Usage } from "../../../enum/annotation.enum.tsx";
import { Select } from "../../../components/form/select/select.component.tsx";
import { InputRef } from "../../../components/form/interface.tsx";
import {
  AnnotationSetList,
  AnnotationSetListItem,
  ConfidenceSetList,
  ConfidenceSetListItem,
  DatasetListItem, DetectorList
} from "../../../services/api";
import { IonButton, IonChip, IonIcon, IonLabel, IonModal, IonNote } from "@ionic/react";
import { closeCircle, cloudUploadOutline, trashOutline } from "ionicons/icons";
import { ImportAnnotationsModal } from "../import-annotations-modal/import-annotations-modal.component.tsx";
import { FormBloc } from "../../../components/form/bloc/form-bloc.component.tsx";
import { CSVData } from "../import-annotations-modal/csv-import.tsx";

interface Props {
  allAnnotationSets: AnnotationSetList;
  allConfidenceSets: ConfidenceSetList;
  dataset?: DatasetListItem;
  detectors: DetectorList;

  mode?: Usage;
  setMode: (mode?: Usage) => void;

  annotationSet?: AnnotationSetListItem;
  setAnnotationSet: (annotationSet?: AnnotationSetListItem) => void;
  confidenceSet?: ConfidenceSetListItem;
  setConfidenceSet: (confidenceSet?: ConfidenceSetListItem) => void;
  setData: (data?: CSVData) => void;
}

export const AnnotationBloc = React.forwardRef<InputRef, Props>(({
                                                                   allAnnotationSets,
                                                                   allConfidenceSets,
                                                                   dataset,
                                                                   detectors,
                                                                   mode, setMode,
                                                                   annotationSet, setAnnotationSet,
                                                                   confidenceSet, setConfidenceSet,
                                                                   setData: setParentData
                                                                 }, ref) => {
  const modeSelectRef = useRef<InputRef | null>(null);

  const annotationSelectRef = useRef<InputRef | null>(null);

  const confidenceSelectRef = useRef<InputRef | null>(null);

  const modal = useRef<HTMLIonModalElement>(null);
  const modalInputRef = useRef<InputRef>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [data, setData] = useState<CSVData | undefined>();
  const [useDetectors, setUseDetectors] = useState<Array<string>>([]);
  useEffect(() => setUseDetectors(data?.detectorNames ?? []), [data]);
  useEffect(() => {
    setParentData(data?.filterDetectors(useDetectors))
  }, [data, useDetectors])


  const _ref: InputRef = {
    blur: (e) => {
      modeSelectRef.current?.blur(e);
      annotationSelectRef.current?.blur(e);
      confidenceSelectRef.current?.blur(e);
      modalInputRef.current?.blur(e);
    },
    get isValid() {
      return !!modeSelectRef.current?.isValid && !!annotationSelectRef.current?.isValid && !!confidenceSelectRef.current?.isValid;
    }
  }
  useImperativeHandle(ref, () => _ref);

  return (
    <FormBloc label="Annotation">
      <Select ref={ modeSelectRef }
              required={ true }
              label="Annotation mode" placeholder="Select an annotation mode"
              options={ [
                { id: Usage.create, label: 'Create annotations' },
                { id: Usage.check, label: 'Check annotations' },
              ] }
              optionsContainer="popover"
              value={ mode }
              onValueSelected={ value => {
                console.info('select', value)
                setMode(value as Usage);
              }
              }/>

      {/* Create annotation mode*/ }
      { mode === Usage.create && (
        <Fragment>
          <Select ref={ annotationSelectRef }
                  label="Annotation set" placeholder="Select an annotation set"
                  required={ true }
                  options={ allAnnotationSets.map(s => ({ id: s.id, label: s.name })) }
                  optionsContainer="alert"
                  value={ annotationSet?.id }
                  onValueSelected={ value => setAnnotationSet(allAnnotationSets.find(s => s.id === value)) }>
            { !!annotationSet && (
              <Fragment>
                { annotationSet.desc }
                <p><span className="bold">Tags:</span> { annotationSet.tags.join(', ') }</p>
              </Fragment>)
            }
          </Select>

          <Select ref={ confidenceSelectRef }
                  label="Confidence indicator set" placeholder="Select a confidence set"
                  options={ allConfidenceSets.map(s => ({ id: s.id, label: s.name })) }
                  optionsContainer="alert"
                  value={ confidenceSet?.id }
                  onValueSelected={ value => setConfidenceSet(allConfidenceSets.find(s => s.id === value)) }>
            { !!confidenceSet && (
              <Fragment>
                { confidenceSet?.desc }
                { confidenceSet?.confidence_indicators.map(c => (
                  <p><span className="bold" key={ c.level }>{ c.level }:</span> { c.label }</p>
                )) }
              </Fragment>)
            }
          </Select>
        </Fragment>
      ) }

      {/* Check annotation mode*/ }
      { mode === Usage.check && (
        <Fragment>
          { !data?.detectorNames.length && <Fragment>
              <IonButton color="secondary" className="center"
                         onClick={ () => setIsModalOpen(true) }
                         disabled={ !dataset } aria-disabled={ !dataset }>
                  Import annotations
                  <IonIcon icon={ cloudUploadOutline } slot="end"/>
              </IonButton>
            { !dataset &&
                <IonNote color="danger" className="center" aria-disabled>You must select a dataset to import
                    annotations </IonNote> }
          </Fragment> }
          { !!dataset && <IonModal ref={ modal } isOpen={ isModalOpen }>
              <ImportAnnotationsModal searchedDataset={ dataset }
                                      ref={ modalInputRef }
                                      detectors={ detectors }
                                      onDismiss={ modalData => {
                                        setIsModalOpen(false)
                                        if (modalData) setData(CSVData.merge(data, modalData, dataset))
                                      } }/>
          </IonModal> }


          { data?.detectors.length && <div id="detector-import-results">
              <IonLabel className="mandatory">Detectors*</IonLabel>
              <div className="chips-container">
                { data?.detectors.map(detector => {
                  const isActive = useDetectors.includes(detector.detectorName);
                  return (
                    <IonChip color="secondary" outline={ !isActive } key={ detector.detectorName }
                             onClick={ () => {
                               if (isActive) setUseDetectors(useDetectors.filter(d => d !== detector.detectorName));
                               else setUseDetectors([...useDetectors, detector.detectorName]);
                             } }>
                      { detector.detectorName }
                      { isActive && <IonIcon icon={ closeCircle }/> }
                    </IonChip>
                  )
                }) }
              </div>
            { data?.detectorNames.length && <IonButton color="danger" onClick={ () => setData(undefined) }>
                <IonIcon icon={ trashOutline } slot="icon-only"/>
            </IonButton> }
            { !useDetectors.length &&
                <IonNote color="danger">You must select at least one detector to check its annotations</IonNote> }
          </div> }
        </Fragment>
      ) }
    </FormBloc>
  )
})
