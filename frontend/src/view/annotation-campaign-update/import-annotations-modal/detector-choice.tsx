import React, {
  createRef,
  Fragment,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import { CSVData, Detector } from "./csv-import.tsx";
import { DetectorList, DetectorListItemConfiguration } from "../../../services/api";
import { IonButton, IonCheckbox, IonIcon, IonInput, IonTextarea } from "@ionic/react";
import { FormBloc } from "../../../components/form/bloc/form-bloc.component.tsx";
import { Select } from "../../../components/form/select/select.component.tsx";
import { InputRef } from "../../../components/form/interface.tsx";
import { checkmarkOutline, chevronBackOutline } from "ionicons/icons";

interface Props {
  data?: CSVData;
  setData: (data?: CSVData) => void;
  onValidated: (data: CSVData) => void;
  detectors: DetectorList,
  onBack: () => void;
}

interface DetectorProperty extends Detector {
  isChecked: boolean;
  editName?: string;
}

export const DetectorChoice = React.forwardRef<InputRef, Props>(({
                                                                   data,
                                                                   detectors: allDetectors,
                                                                   onValidated,
                                                                   onBack
                                                                 }, ref) => {
  const [detectors, setDetectors] = useState<Map<string, DetectorProperty>>(new Map());
  const [checkedDetectors, setCheckedDetectors] = useState<Map<string, DetectorProperty>>(new Map());
  const [canValidate, setCanValidate] = useState<boolean>(false);
  const [isAllChecked, setIsAllChecked] = useState<boolean>(false);

  useEffect(() => {
    setDetectors(new Map(
      data?.detectorNames.map(d => {
        const found = allDetectors.find(_d => _d.name === d);
        const configuration = found?.configurations && found.configurations.length > 0 ? found?.configurations[0] : undefined;
        return [
          d, {
            isChecked: true,
            id: found?.id,
            detectorName: d,
            detectorId: found?.id,
            configurationId: configuration?.id,
            configuration: configuration?.configuration ?? '',
          }
        ]
      })
    ))
  }, [data])
  useEffect(() => {
    const checkedOnly = new Map();
    for (const [detector, config] of detectors.entries()) {
      if (config.isChecked) checkedOnly.set(detector, config)
    }
    setCheckedDetectors(checkedOnly)
    setCanValidate(checkedOnly.size > 0 && [...checkedOnly.values()].reduce((a, b) => a && !!b.configuration, true))

    setIsAllChecked([...detectors.values()].reduce((a, b) => a || b.isChecked, false))
  }, [detectors])

  const detectorSelectRefs = useRef<Array<RefObject<InputRef> | undefined>>([]);
  detectorSelectRefs.current = [...detectors.entries()].map((_, i) => detectorSelectRefs.current[i] ?? createRef<InputRef>());
  const detectorConfigSelectRefs = useRef<Array<RefObject<InputRef> | undefined>>([]);
  detectorConfigSelectRefs.current = [...detectors.entries()].map((_, i) => detectorConfigSelectRefs.current[i] ?? createRef<InputRef>());

  const _ref: InputRef = {
    blur: (e) => {
      detectorSelectRefs.current.forEach(r => r?.current?.blur(e))
      detectorConfigSelectRefs.current.forEach(r => r?.current?.blur(e))
    },
    isValid: true
  }
  useImperativeHandle(ref, () => _ref);

  const getConfigurations = (detectorId?: number): Array<DetectorListItemConfiguration> => {
    return allDetectors.find(d => d.id === detectorId)?.configurations ?? []
  }

  const selectDetector = (csvDetector: string, csvProperties: DetectorProperty, detectorId?: number, name?: string) => {
    csvProperties.detectorId = detectorId;
    csvProperties.detectorName = name ?? csvDetector;
    const firstConfig = [...getConfigurations(detectorId)].shift();
    csvProperties.configurationId = firstConfig?.id;
    csvProperties.configuration = firstConfig?.configuration ?? '';
    detectors.set(csvDetector, csvProperties);
    setDetectors(new Map(detectors));
  }

  const updateDetectorName = (csvDetector: string, csvProperties: DetectorProperty, name?: string | null) => {
    csvProperties.detectorId = undefined;
    csvProperties.detectorName = name ?? csvDetector;
    detectors.set(csvDetector, csvProperties);
    setDetectors(new Map(detectors));
  }

  const selectConfiguration = (csvDetector: string, csvProperties: DetectorProperty, configurationId?: number) => {
    csvProperties.configurationId = configurationId;
    csvProperties.configuration = getConfigurations(csvProperties.detectorId).find(c => c.id === configurationId)?.configuration ?? '';
    detectors.set(csvDetector, csvProperties);
    setDetectors(new Map(detectors));
  }

  const updateConfiguration = (csvDetector: string, csvProperties: DetectorProperty, configuration?: string | null) => {
    csvProperties.configurationId = undefined;
    csvProperties.configuration = configuration ?? '';
    detectors.set(csvDetector, csvProperties);
    setDetectors(new Map(detectors));
  }

  return <Fragment>
    <div id="content">
      <p>Dataset: <span className="bold">{ data?.datasetNames[0] }</span></p>

      <FormBloc label="Detectors found">
        { detectors.size > 1 && <div className="detector-entry all">
            <IonCheckbox labelPlacement="end" justify="start"
                         checked={ isAllChecked }
                         onIonChange={ event => {
                           const map = detectors;
                           for (const [detector, config] of map.entries()) {
                             map.set(detector, {
                               ...config,
                               isChecked: event.detail.checked
                             })
                           }
                           setDetectors(new Map(map));
                         } }>
                <p>{ isAllChecked ? 'Unselect all' : 'Select all' }</p>
            </IonCheckbox>
        </div> }
        { [...detectors.entries()].map(([detector, properties], i) => (
          <div className="detector-entry" key={ detector }>
            <IonCheckbox labelPlacement="end" justify="start"
                         checked={ properties.isChecked }
                         onIonChange={ event => {
                           const map = detectors;
                           map.set(detector, {
                             ...properties,
                             isChecked: event.detail.checked
                           })
                           setDetectors(new Map(map));
                         } }></IonCheckbox>
            { detector } as
            <Select value={ properties.detectorId }
                    onValueSelected={ value => {
                      value = value ? +value : undefined;
                      selectDetector(
                        detector,
                        properties,
                        value,
                        allDetectors.find(d => d.id === value)?.name
                      );
                    } }
                    ref={ detectorSelectRefs.current[i] }
                    options={ allDetectors.map(d => ({ id: d.id, label: d.name })) }
                    optionsContainer="popover"
                    noneLabel="unknown"
                    placeholder="unknown"></Select>

            { !properties.detectorId && <IonInput placeholder={ detector }
                                                  value={ properties.detectorName }
                                                  onIonChange={ e => updateDetectorName(detector, properties, e.detail.value) }/> }

            <Select className="config-select"
                    disabled={ !properties.detectorId }
                    value={ properties.configurationId }
                    onValueSelected={ value => selectConfiguration(detector, properties, value ? +value : undefined) }
                    label="with configuration"
                    ref={ detectorConfigSelectRefs.current[i] }
                    options={ getConfigurations(properties.detectorId).map(c => ({
                      id: c.id,
                      label: c.configuration
                    })) }
                    optionsContainer="popover"
                    noneLabel="Create new"
                    placeholder="Select known configuration"></Select>

            <IonTextarea placeholder="Enter new configuration"
                         autoGrow={ true }
                         value={ properties.configuration }
                         onIonInput={ e => updateConfiguration(detector, properties, e.detail.value) }></IonTextarea>

            <div className="line"/>
          </div>
        )) }
      </FormBloc>

    </div>
    <div id="buttons">
      <IonButton color="medium" onClick={ () => onBack() }>
        <IonIcon icon={ chevronBackOutline } slot="start"/>
        Back
      </IonButton>

      <IonButton disabled={ !canValidate }
                 aria-disabled={ !canValidate }
                 onClick={ () => {
                   onValidated(data!.confirmDetectors(checkedDetectors));
                 } }>
        Import
        <IonIcon icon={ checkmarkOutline } slot="end"/>
      </IonButton>
    </div>
  </Fragment>
})
