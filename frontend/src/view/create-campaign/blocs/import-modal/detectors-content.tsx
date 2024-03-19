import React, { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import { IonButton, IonCheckbox, IonIcon } from "@ionic/react";
import { checkmarkOutline } from "ionicons/icons";
import { useAppSelector } from "@/slices/app";
import { DetectorList } from "@/services/api";
import { CSVDetectorItem } from "@/types/csv-import-annotations.ts";
import { Select, Input, Textarea, FormBloc } from "@/components/form";
import { useImportAnnotations } from "@/services/create-campaign/import-annotations.ts";

interface Props {
  allDetectors: DetectorList,
  save: () => void;
  cancelButton: ReactNode;
}

export const DetectorsContent: React.FC<Props> = ({
                                                    allDetectors,
                                                    save,
                                                    cancelButton
                                                  }) => {
  const [detectors, setDetectors] = useState<Array<CSVDetectorItem>>([]);
  const canValidate = useMemo(() => {
    const selectedDetectors = detectors.filter(d => d.selected)
    if (!selectedDetectors.length) return false;
    return selectedDetectors.reduce((isValid, d) =>
      isValid && (!!d.existingConfiguration || !!d.editConfiguration), true)
  }, [detectors]);


  // Form data
  const {
    datasetName,
    filename,
    rows
  } = useAppSelector(state => state.createCampaignForm.importAnnotations);

  // Services
  const service = useImportAnnotations();
  useEffect(() => {
    setDetectors(service.distinctDetectors)
  }, [rows])

  const updateDetector = (detector: CSVDetectorItem) => {
    setDetectors(detectors.map(d => d.initialName !== detector.initialName ? d : detector))
  }

  const checkAll = (selected: boolean) => {
    setDetectors(detectors.map(d => ({ ...d, selected })))
  }

  const _save = () => {
    service.keepDetectors(detectors)
    save();
  }

  return (
    <Fragment>
      <div id="content">
        <p>File: <span className="bold">{ filename }</span></p>
        <p>Dataset: <span className="bold">{ datasetName }</span></p>


        <FormBloc label="Detectors found">
          { detectors.length > 1 && <div className="detector-entry all">
              <IonCheckbox labelPlacement="end" justify="start"
                           checked={ detectors.reduce((a, b) => a || b.selected, false) }
                           onIonChange={ event => checkAll(event.detail.checked) }>
                  <p>{ detectors.reduce((a, b) => a || b.selected, false) ? 'Unselect all' : 'Select all' }</p>
              </IonCheckbox>
          </div> }


          { detectors.map(d => (
            <DetectorEntry detector={ d }
                           allDetectors={ allDetectors }
                           key={ d.initialName }
                           onUpdate={ updateDetector }/>)) }
        </FormBloc>
      </div>

      <div id="buttons">
        { cancelButton }

        <IonButton disabled={ !canValidate }
                   aria-disabled={ !canValidate }
                   onClick={ _save }>
          Import
          <IonIcon icon={ checkmarkOutline } slot="end"/>
        </IonButton>
      </div>
    </Fragment>
  )
}

interface DetectorEntryProps {
  allDetectors: DetectorList,
  detector: CSVDetectorItem;
  onUpdate: (detector: CSVDetectorItem) => void;
}

const DetectorEntry: React.FC<DetectorEntryProps> = ({
                                                       allDetectors,
                                                       detector,
                                                       onUpdate
                                                     }) => {

  return (
    <div className="detector-entry">
      <IonCheckbox labelPlacement="end" justify="start"
                   checked={ detector.selected }
                   onIonChange={ event => onUpdate({
                     ...detector,
                     selected: event.detail.checked
                   }) }/>

      { detector.initialName } as

      <Select value={ detector.existingDetector?.id }
              onValueSelected={ value => onUpdate({
                ...detector,
                existingDetector: allDetectors.find(d => d.id == value)
              }) }
              options={ allDetectors.map(d => ({ value: d.id, label: d.name })) }
              optionsContainer="popover"
              noneLabel="unknown"
              placeholder="unknown"></Select>

      { !detector.existingDetector && <Input placeholder={ detector.initialName }
                                             value={ detector.editName }
                                             onChange={ e => onUpdate({
                                               ...detector,
                                               editName: e.target.value
                                             }) }/> }

      {/* TODO: hide select instead of disable it but keep the label*/}
      <Select className="config-select"
              disabled={ !detector.existingDetector }
              value={ detector.existingConfiguration?.id }
              onValueSelected={ value => onUpdate({
                ...detector,
                existingConfiguration: detector.existingDetector?.configurations.find(c => c.id == value)
              }) }
              label="with configuration"
              options={ detector.existingDetector?.configurations.map(c => ({
                value: c.id,
                label: c.configuration
              })) ?? [] }
              optionsContainer="popover"
              noneLabel="Create new"
              placeholder="Select known configuration"></Select>

      <Textarea placeholder="Enter new configuration"
                value={ detector.editConfiguration }
                onChange={ e => onUpdate({
                  ...detector,
                  editConfiguration: e.target.value
                }) }/>

      <div className="line"/>
    </div>
  )
}
