import React, { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import { IonButton, IonCheckbox, IonIcon, IonNote } from "@ionic/react";
import { alertOutline } from "ionicons/icons";
import { useAppSelector } from "@/slices/app";
import { DetectorList } from "@/services/api";
import { CSVDetectorItem } from "@/types/csv-import-annotations.ts";
import { FormBloc, Select } from "@/components/form";
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
  const canValidate = useMemo(() => detectors.some(d => d.selected), [detectors]);


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

  const _save = () => {
    service.keepDetectors(detectors.filter(d => d.selected))
    save();
  }

  return (
    <Fragment>
      <div id="content">
        <div className="basic-info">
          <p>File: <span className="bold">{ filename }</span></p>
          <p>Dataset: <span className="bold">{ datasetName }</span></p>
        </div>

        <FormBloc label="Detectors from CSV">
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
          Confirm
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
  const doesExists = useMemo(() => allDetectors.some(d => d.name === detector.initialName), [allDetectors, detector])
  const [isUpdated, setIsUpdated] = useState<boolean>(false);

  return (
    <div className={ `detector-entry ${ !doesExists && 'unknown' }` }>
      <IonCheckbox labelPlacement="end" justify="start"
                   color={ !doesExists && !isUpdated ? 'danger' : undefined }
                   checked={ detector.selected }
                   disabled={ !doesExists && !isUpdated }
                   onIonChange={ event => onUpdate({
                     ...detector,
                     selected: event.detail.checked,
                     existingDetector: detector.existingDetector ?? allDetectors.find(d => d.name === detector.initialName)
                   }) }/>
      { !doesExists && !isUpdated && <IonIcon className="exclamation" icon={ alertOutline } color="danger"/> }

      { detector.initialName }

      { doesExists && <IonNote color="medium">Already in database</IonNote> }

      { !doesExists && <div className="unknown">
          <IonNote color={ !doesExists && !isUpdated ? 'danger' : "medium" }>Unknown detector</IonNote>

          <Select value={ detector.existingDetector?.id }
                  onValueSelected={ value => {
                    onUpdate({
                      ...detector,
                      existingDetector: allDetectors.find(d => d.id == value),
                      selected: true
                    })
                    setIsUpdated(true);
                  } }
                  options={ allDetectors.map(d => ({ value: d.id, label: d.name })) }
                  optionsContainer="popover"
                  noneLabel={ `Create "${ detector.initialName }"` }
                  placeholder="Assign to detector"/>
      </div> }

      <div className="line"/>
    </div>
  )
}
