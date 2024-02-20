import React, { useImperativeHandle, useRef, useState } from "react";
import { IonBreadcrumb, IonBreadcrumbs, IonContent, IonIcon } from "@ionic/react";
import { DatasetListItem, DetectorList } from "../../../services/api";
import { chevronForwardOutline } from "ionicons/icons";
import { CSVData, CsvImport } from "./csv-import.tsx";
import { DetectorChoice } from "./detector-choice.tsx";
import { InputRef } from "../../../components/form/interface.tsx";
import './import-annotations-modal.component.css';


interface Props {
  searchedDataset: DatasetListItem;
  onDismiss: (data?: CSVData) => void;
  detectors: DetectorList;
}

enum State {
  csvImport = 'CSV Import',
  detectors = 'Detectors',
}

export const ImportAnnotationsModal = React.forwardRef<InputRef, Props>(({
                                                                           onDismiss,
                                                                           searchedDataset,
                                                                           detectors
                                                                         }, ref) => {
  const [currentState, setCurrentState] = useState<State>(State.csvImport);
  const [data, setData] = useState<CSVData | undefined>();

  const detectorChoiceRef = useRef<InputRef | null>(null);

  const _ref: InputRef = {
    blur: (e) => detectorChoiceRef.current?.blur(e),
    isValid: true
  }
  useImperativeHandle(ref, () => _ref);

  return (
    <IonContent id="import-annotations-modal">
      <div id="header">
        <h1>Import annotations</h1>

        <IonBreadcrumbs>
          { Object.values(State).filter(s => isNaN(Number(s))).map(s => (
            <IonBreadcrumb active={ s === currentState } key={ s }>
              { s }
              <IonIcon slot="separator" icon={ chevronForwardOutline }></IonIcon>
            </IonBreadcrumb>
          )) }
        </IonBreadcrumbs>
      </div>

      { currentState === State.csvImport && <CsvImport onDismiss={ onDismiss }
                                                       data={ data }
                                                       setData={ setData }
                                                       onValidated={ () => setCurrentState(State.detectors) }
                                                       searchedDataset={ searchedDataset }/> }

      { currentState === State.detectors && <DetectorChoice data={ data }
                                                            setData={ setData }
                                                            ref={ detectorChoiceRef }
                                                            onBack={ () => {
                                                              setData(undefined);
                                                              setCurrentState(State.csvImport);
                                                            } }
                                                            onValidated={ validData => onDismiss(validData) }
                                                            detectors={ detectors }/> }

    </IonContent>
  )
})
