import React, { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { checkmarkOutline } from "ionicons/icons";
import { useAppSelector } from "@/slices/app";
import { DetectorList } from "@/services/api";
import { CSVDetectorItem } from "@/types/csv-import-annotations.ts";
import { FormBloc, Select, Textarea } from "@/components/form";
import { useImportAnnotations } from "@/services/create-campaign/import-annotations.ts";

interface Props {
  allDetectors: DetectorList,
  save: () => void;
  cancelButton: ReactNode;
}

export const DetectorsConfigContent: React.FC<Props> = ({
                                                          allDetectors,
                                                          save,
                                                          cancelButton
                                                        }) => {
  const [detectors, setDetectors] = useState<Array<CSVDetectorItem>>([]);

  const [canValidate, setCanValidate] = useState<boolean>(false);
  useEffect(() => {
    setCanValidate(detectors.every(d => {
      if (d.existingDetector && d.existingConfiguration) return true
      return d.editConfiguration?.length ?? 0 > 0;
    }))
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
        <p>Detectors: <span className="bold">{ detectors.map(d => d.initialName).join(', ') }</span></p>
        </div>


        <FormBloc label="Detectors configurations">
          { detectors.map(d => (
            <DetectorConfigEntry detector={ d }
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

const DetectorConfigEntry: React.FC<DetectorEntryProps> = ({
                                                             allDetectors,
                                                             detector,
                                                             onUpdate
                                                           }) => {
  const doesExists = useMemo(() => allDetectors.some(d => d.name === detector.initialName), [allDetectors, detector.initialName])
  const [isUpdated, setIsUpdated] = useState<boolean>(false);

  return (
    <div className={ `detector-config-entry ${ !doesExists && 'unknown' }` }>

      <p>
        <strong>{ detector.existingDetector?.name ?? detector.initialName }</strong>
        { detector.existingDetector && detector.existingDetector.name !== detector.initialName ? ` (${ detector.initialName })`: '' } configuration
      </p>

      <Select className="config-select"
              value={ detector.existingConfiguration?.id }
              onValueSelected={ value => {
                onUpdate({
                  ...detector,
                  existingConfiguration: detector.existingDetector?.configurations.find(c => c.id == value)
                });
                setIsUpdated(true);
              } }
              options={ detector.existingDetector?.configurations.map(c => ({
                value: c.id,
                label: c.configuration
              })) ?? [] }
              optionsContainer="popover"
              noneLabel="Create new" noneFirst
              placeholder="Select configuration"/>

      <Textarea placeholder="Enter new configuration"
                hidden={!isUpdated}
                disabled={ !!detector.existingDetector && (!isUpdated || !!detector.existingConfiguration) }
                value={ detector.existingConfiguration?.configuration ?? detector.editConfiguration }
                onChange={ e => {
                  onUpdate({
                    ...detector,
                    editConfiguration: e.target.value
                  })
                } }/>

      <div className="line"/>
    </div>
  )
}
