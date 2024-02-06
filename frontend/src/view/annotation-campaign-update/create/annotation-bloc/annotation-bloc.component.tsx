import React, { Fragment, useImperativeHandle, useRef, useState } from "react";
import { Usage } from "../../../../enum/annotation.enum.tsx";
import { Select } from "../../../../components/form/select/select.component.tsx";
import { InputRef } from "../../../../components/form/interface.tsx";
import {
  AnnotationSetList,
  AnnotationSetListItem,
  ConfidenceSetList,
  ConfidenceSetListItem
} from "../../../../services/api";
import { IonButton, IonIcon } from "@ionic/react";
import { cloudUploadOutline } from "ionicons/icons";

interface Props {
  allAnnotationSets: AnnotationSetList;
  allConfidenceSets: ConfidenceSetList;
}

export const AnnotationBloc = React.forwardRef<InputRef, Props>(({
                                                                   allAnnotationSets,
                                                                   allConfidenceSets
                                                                 }, ref) => {
  const [mode, setMode] = useState<Usage | undefined>();
  const modeSelectRef = useRef<InputRef | null>(null);

  const [annotationSet, setAnnotationSet] = useState<AnnotationSetListItem | undefined>();
  const annotationSelectRef = useRef<InputRef | null>(null);

  const [confidenceSet, setConfidenceSet] = useState<ConfidenceSetListItem | undefined>();
  const confidenceSelectRef = useRef<InputRef | null>(null);

  const _ref: InputRef = {
    blur: (e) => {
      modeSelectRef.current?.blur(e);
      annotationSelectRef.current?.blur(e);
      confidenceSelectRef.current?.blur(e);
    },
    get isValid() {
      return !!modeSelectRef.current?.isValid && !!annotationSelectRef.current?.isValid && !!confidenceSelectRef.current?.isValid;
    }
  }
  useImperativeHandle(ref, () => _ref);

  return (
    <div className="bloc annotation">
      <div className="separator">
        <div></div>
        Annotation
        <div></div>
      </div>


      <Select ref={ modeSelectRef }
              required={ true }
              label="Annotation mode" placeholder="Select an annotation mode"
              options={ [
                { id: Usage.create, label: 'Create annotations' },
                { id: Usage.check, label: 'Check annotations' },
              ] }
              optionsContainer="popover"
              value={ mode }
              onValueSelected={ value => setMode(value) }/>

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
                { confidenceSet?.confidenceIndicators.map(c => (
                  <p><span className="bold">{ c.level }:</span> { c.label }</p>
                )) }
              </Fragment>)
            }
          </Select>
        </Fragment>
      ) }

      {/* Check annotation mode*/ }
      { mode === Usage.check && (
        <Fragment>
          <IonButton color="secondary" className="item-button">
            Import annotations
            <IonIcon icon={ cloudUploadOutline } slot="end"/>
          </IonButton>
        </Fragment>
      ) }

      {/*<IonSelect placeholder="Select an annotation mode"*/ }
      {/*           value={ mode }*/ }
      {/*           onIonChange={ e => setMode(e.detail.value) }>*/ }
      {/*  <IonSelectOption value={ Usage.create }>Create annotations</IonSelectOption>*/ }
      {/*  <IonSelectOption value={ Usage.check }>Check annotations</IonSelectOption>*/ }
      {/*</IonSelect>*/ }
    </div>
  )
})
