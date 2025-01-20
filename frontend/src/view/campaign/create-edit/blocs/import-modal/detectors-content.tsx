import React, { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import { CheckboxChangeEventDetail, IonButton, IonCheckbox, IonIcon, IonNote, IonSpinner } from "@ionic/react";
import { alertOutline } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { FormBloc, Select } from "@/components/form";
import { Detector, useListDetectorQuery } from '@/service/campaign/detector';
import { useToast } from "@/service/ui";
import { getErrorMessage } from '@/service/function.ts';
import { DetectorSelection, setDetectors as saveDetectors } from '@/service/campaign';

interface Props {
  cancelButton: ReactNode;
}

export const DetectorsContent: React.FC<Props> = ({
                                                    cancelButton
                                                  }) => {
  // const [ csvDetectors, setCsvDetectors ] = useState<Array<string>>([]);
  const [ detectors, setDetectors ] = useState<Map<string, Detector | null | undefined>>(new Map());
  const [ canValidate, setCanValidate ] = useState<boolean>(false);
  const { data: allDetectors, error: detectorListError } = useListDetectorQuery();
  const toast = useToast();

  useEffect(() => {
    if (detectorListError) toast.presentError(getErrorMessage(detectorListError));
  }, [ detectorListError ])

  const updateCanValidate = () => {
    setCanValidate(detectors.size > 0 && [ ...detectors.values() ].some(v => v !== undefined))
  }

  // Form data
  const {
    draftCampaign,
    resultImport,
  } = useAppSelector(state => state.campaign);
  const dispatch = useAppDispatch();

  const availableDetectors = useMemo(() => {
    const data = resultImport.fileData;
    const filterDatasets = resultImport.filterDatasets;
    if (!data || !filterDatasets) return;
    const availableEntries = filterDatasets.flatMap(d => data.detectorsForDatasets[d])
    return [...new Set(availableEntries)]
  }, [])

  const _save = () => {
    const entries: DetectorSelection[] = [ ...detectors.entries() ].map(([ initialName, detector ]) => {
      const selection: DetectorSelection = {
        initialName,
        isNew: !detector,
        knownDetector: detector ?? undefined,
      };
      return selection
    })
    dispatch(saveDetectors(entries))
  }

  const onDetectorSelected = (detector: string) => {
    setDetectors(previous => {
      previous.set(detector, previous.get(detector));
      return previous;
    })
    updateCanValidate()
  }

  const onDetectorUnselected = (detector: string) => {
    setDetectors(previous => {
      previous.delete(detector);
      return previous;
    })
    updateCanValidate()
  }

  const onDetectorChoiceUpdated = (detector: string, choice: Detector | null) => {
    setDetectors(previous => {
      previous.set(detector, choice);
      return previous;
    })
    updateCanValidate()
  }

  if (!allDetectors) return <IonSpinner/>
  return (
    <Fragment>
      <div id="content">
        <div className="basic-info">
          <p>File: <span className="bold">{ resultImport.fileData?.filename }</span></p>
          <p>Dataset: <span className="bold">{ draftCampaign.datasets![0] }</span></p>
        </div>

        <FormBloc label="Detectors from CSV">
          { availableDetectors?.map(d => (
            <DetectorEntry csvDetector={ d }
                           allDetectors={ allDetectors }
                           key={ d }
                           onSelected={ () => onDetectorSelected(d) }
                           onUnselected={ () => onDetectorUnselected(d) }
                           onDetectorUpdated={ (choice) => onDetectorChoiceUpdated(d, choice) }/>)) }
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
  allDetectors: Array<Detector>,
  csvDetector: string;
  onSelected: () => void;
  onDetectorUpdated: (detector: Detector | null) => void;
  onUnselected: () => void;
}

const DetectorEntry: React.FC<DetectorEntryProps> = ({
                                                       allDetectors,
                                                       csvDetector,
                                                       onSelected,
                                                       onDetectorUpdated,
                                                       onUnselected
                                                     }) => {
  const doesExists = useMemo(() => allDetectors.some(d => d.name === csvDetector), [ allDetectors, csvDetector ])
  const [ isUpdated, setIsUpdated ] = useState<boolean>(false);

  const [ isSelected, setIsSelected ] = useState(doesExists);
  const [ selectedDetector, setSelectedDetector ] = useState<Detector | null | undefined>();

  useEffect(() => {
    if (doesExists) onDetectorUpdated(allDetectors.find(d => d.name === csvDetector)!)
  }, [ doesExists ]);

  const onChange = (e: CustomEvent<CheckboxChangeEventDetail>) => {
    if (e.detail.checked) {
      onSelected()
      setIsSelected(true)
    } else {
      onUnselected()
      setIsSelected(false)
    }
  }

  const onDetectorChange = (id: string | number | undefined) => {
    if (typeof id === 'undefined' || (typeof id === 'string' && isNaN(+id)) || (typeof id === 'number' && id === -1)) {
      onDetectorUpdated(null);
      setSelectedDetector(null);
    } else {
      const detector = allDetectors.find(d => d.id === +id)!;
      setSelectedDetector(detector);
      onDetectorUpdated(detector);
    }
    onSelected()
    setIsSelected(true)
    setIsUpdated(true)
  }

  return (
    <div className={ `detector-entry ${ !doesExists && 'unknown' }` }>
      <IonCheckbox labelPlacement="end" justify="start"
                   color={ !doesExists && !isUpdated ? 'danger' : undefined }
                   checked={ isSelected }
                   disabled={ !doesExists && !isUpdated }
                   onIonChange={ onChange }/>
      { !doesExists && !isUpdated && <IonIcon className="exclamation" icon={ alertOutline } color="danger"/> }

      { csvDetector }

      { doesExists && <IonNote color="medium">Already in database</IonNote> }

      { !doesExists && <div className="unknown">
          <IonNote color={ !doesExists && !isUpdated ? 'danger' : "medium" }>Unknown detector</IonNote>

          <Select value={ selectedDetector?.id }
                  onValueSelected={ onDetectorChange }
                  options={ allDetectors.map(d => ({ value: d.id, label: d.name })) }
                  optionsContainer="popover"
                  noneLabel={ `Create "${ csvDetector }"` }
                  placeholder="Assign to detector"/>
      </div> }

      <div className="line"/>
    </div>
  )
}
