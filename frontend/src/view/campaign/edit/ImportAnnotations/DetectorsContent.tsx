import React, { Fragment, useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { FormBloc, Select } from "@/components/form";
import styles from './importAnnotations.module.scss'
import { useListDetectorQuery } from "@/service/campaign/detector";
import { CheckboxChangeEventDetail, IonCheckbox, IonIcon, IonNote, IonSpinner } from "@ionic/react";
import { WarningMessage } from "@/components/warning/warning-message.component.tsx";
import { getErrorMessage } from "@/service/function.ts";
import { alertOutline } from "ionicons/icons";
import { ResultImportSlice } from "@/service/campaign/result/import";

export const DetectorsContent: React.FC = () => {
  const { data: allDetectors, isFetching: isLoadingDetectors, error: detectorsLoadError } = useListDetectorQuery({});

  const { file, upload } = useAppSelector(state => state.resultImport);
  const dispatch = useAppDispatch();

  const onChange = useCallback((e: CustomEvent<CheckboxChangeEventDetail>, detectorName: string) => {
    if (e.detail.checked) {
      dispatch(ResultImportSlice.actions.selectDetector(detectorName));
    } else {
      dispatch(ResultImportSlice.actions.unselectDetector(detectorName));
    }
  }, [])
  const onDetectorChange = useCallback((id: string | number | undefined, detectorName: string) => {
    if (typeof id === 'undefined' || (typeof id === 'string' && isNaN(+id)) || (typeof id === 'number' && id === -1)) {
      dispatch(ResultImportSlice.actions.mapDetector({ name: detectorName, detector: undefined }));
    } else {
      dispatch(ResultImportSlice.actions.mapDetector({
        name: detectorName,
        detector: allDetectors?.find(d => d.id === +id)
      }));
    }
    dispatch(ResultImportSlice.actions.selectDetector(detectorName));
  }, [ allDetectors ])

  if (file.state !== 'loaded') return <Fragment/>
  return <FormBloc label="Detectors">

    { isLoadingDetectors && <IonSpinner/> }
    { detectorsLoadError &&
        <WarningMessage>Fail loading known detectors:<br/>{ getErrorMessage(detectorsLoadError) }</WarningMessage> }

    { allDetectors && file.detectors.map(initialName => <DetectorEntry key={ initialName }
                                                                       disabled={ upload.state !== 'initial' }
                                                                       initialName={ initialName }
                                                                       onChange={ onChange }
                                                                       onDetectorChange={ onDetectorChange }/>) }
  </FormBloc>
}

const DetectorEntry: React.FC<{
  initialName: string;
  disabled?: boolean;
  onChange: (e: CustomEvent<CheckboxChangeEventDetail>, detectorName: string) => void;
  onDetectorChange: (id: string | number | undefined, detectorName: string) => void
}> = ({ initialName, onChange, onDetectorChange, disabled }) => {
  const { data: allDetectors } = useListDetectorQuery({});
  const { detectors } = useAppSelector(state => state.resultImport);
  const dispatch = useAppDispatch();

  const isKnown = useMemo(() => allDetectors?.some(d => d.name === initialName), [ allDetectors ]);
  const isSelected = useMemo(() => !!detectors.selection.find(s => s === initialName), [ detectors.selection ]);
  const isUpdated = useMemo(() => initialName in detectors.mapToKnown, [ detectors.mapToKnown ]);

  useEffect(() => {
    if (isKnown) // By default, select detector if it already matches to a known one
      dispatch(ResultImportSlice.actions.selectDetector(initialName));
  }, []);

  return <div key={ initialName }
              className={ [ styles.detectorEntry, isKnown ? '' : styles.unknown ].join(' ') }>
    <IonCheckbox labelPlacement="end" justify="start"
                 color={ !isKnown && !isUpdated ? 'danger' : undefined }
                 checked={ isSelected }
                 disabled={ disabled || (!isKnown && !isUpdated) }
                 onIonChange={ e => onChange(e, initialName) }/>
    { !isKnown && !isUpdated && <IonIcon className={ styles.exclamation } icon={ alertOutline } color="danger"/> }

    { initialName }

    { isKnown && <IonNote color="medium">Already in database</IonNote> }

    { !isKnown && <div className={ styles.unknown }>
        <IonNote color={ !isKnown && !isUpdated ? 'danger' : "medium" }>Unknown detector</IonNote>

        <Select value={ detectors.mapToKnown[initialName]?.id }
                onValueSelected={ v => onDetectorChange(v, initialName) }
                options={ allDetectors?.map(d => ({ value: d.id, label: d.name })) ?? [] }
                optionsContainer="popover"
                disabled={ disabled }
                noneLabel={ `Create "${ initialName }"` }
                placeholder="Assign to detector"/>
    </div> }

    <div className={ styles.line }/>
  </div>
}