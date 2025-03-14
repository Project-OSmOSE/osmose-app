import React, { ChangeEvent, Fragment, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { FormBloc, Select, Textarea } from "@/components/form";
import { Detector, DetectorConfiguration, useListDetectorQuery } from "@/service/campaign/detector";
import styles from './importAnnotations.module.scss'
import { ResultImportSlice } from "@/service/campaign/result/import";

export const DetectorsConfigContent: React.FC<{ disabled?: boolean }> = ({ disabled }) => {
  const { data: allDetectors } = useListDetectorQuery({});

  const { file, detectors } = useAppSelector(state => state.resultImport);
  const dispatch = useAppDispatch();

  const [ distinctKnownDetectors, unknownDetectors ] = useMemo(() => {
    const known = new Map<Detector, string[]>();
    const unknown: string[] = [];
    for (const initialName of detectors.selection) {
      const detector = allDetectors?.find(d => d.name === initialName) ?? detectors.mapToKnown[initialName];
      if (!detector) {
        unknown.push(initialName);
        continue;
      }
      const existing = known.get(detector) ?? []
      known.set(detector, [ ...existing, initialName ]);
    }
    return [ [ ...known.entries() ], unknown ];
  }, [ detectors.selection, detectors.mapToKnown, allDetectors ]);

  const onSelectConfiguration = useCallback((id: string | number | undefined, name: string) => {
    if (typeof id === 'undefined' || (typeof id === 'string' && isNaN(+id)) || (typeof id === 'number' && id === -1)) {
      dispatch(ResultImportSlice.actions.mapConfiguration({ name, configuration: '' }));
    } else {
      const knownDetector = allDetectors?.find(d => d.name === name) ?? detectors.mapToKnown[name];
      dispatch(ResultImportSlice.actions.mapConfiguration({
        name, configuration: knownDetector?.configurations?.find(c => c.id === +id)
      }));
    }
  }, [ allDetectors, detectors.mapToKnown ])
  const onConfigurationTextUpdated = useCallback((e: ChangeEvent<HTMLTextAreaElement>, name: string) => {
    dispatch(ResultImportSlice.actions.mapConfiguration({ name, configuration: e.target.value }));
  }, [])

  if (file.state !== 'loaded' || detectors.selection.length === 0) return <Fragment/>
  return <FormBloc label="Detectors configurations">
    { distinctKnownDetectors.map(([ detector, names ]) => <ConfigEntry key={ detector.name }
                                                                       disabled={ disabled }
                                                                       displayName={ detector.name }
                                                                       originalNames={ names }
                                                                       availableConfigurations={ detector.configurations }
                                                                       onSelectConfiguration={ onSelectConfiguration }
                                                                       onConfigurationTextUpdated={ onConfigurationTextUpdated }/>) }
    { unknownDetectors.map(detector => <ConfigEntry key={ detector }
                                                    disabled={ disabled }
                                                    displayName={ detector }
                                                    onSelectConfiguration={ onSelectConfiguration }
                                                    onConfigurationTextUpdated={ onConfigurationTextUpdated }/>) }
  </FormBloc>
}

const ConfigEntry: React.FC<{
  displayName: string;
  disabled?: boolean;
  originalNames?: string[];
  availableConfigurations?: DetectorConfiguration[];
  onSelectConfiguration: (id: string | number | undefined, name: string) => void;
  onConfigurationTextUpdated: (e: ChangeEvent<HTMLTextAreaElement>, name: string) => void;
}> = ({
        displayName,
        originalNames = [ displayName ],
        disabled,
        availableConfigurations = [],
        onSelectConfiguration,
        onConfigurationTextUpdated
      }) => {

  const { detectors } = useAppSelector(state => state.resultImport);

  const displayOriginalNames: string | undefined = useMemo(() => {
    if (originalNames.length === 1 && originalNames[0] === displayName) return;
    return originalNames.join(', ')
  }, [ displayName, originalNames ])
  const configuration = useMemo(() => detectors.mapToConfiguration[displayName], [ detectors.mapToConfiguration ]);

  return <div className={ [ styles.configEntry, availableConfigurations.length > 0 ? '' : styles.unknown ].join(' ') }>

    <p><strong>{ displayName }</strong> { displayOriginalNames &&
        <Fragment>({ displayOriginalNames })</Fragment> } configuration</p>

    <Select value={ typeof configuration === 'string' ? undefined : configuration?.id }
            onValueSelected={ v => onSelectConfiguration(v, displayName) }
            options={ availableConfigurations?.map((c: DetectorConfiguration) => ({
              value: c.id,
              label: c.configuration
            })) ?? [] }
            disabled={ disabled }
            optionsContainer="popover"
            noneLabel="Create new" noneFirst
            placeholder="Select configuration"/>

    <Textarea placeholder="Enter new configuration"
              hidden={ configuration === undefined }
              disabled={ disabled || (configuration !== undefined && typeof configuration !== 'string') }
              value={ typeof configuration === 'string' ? configuration : configuration?.configuration }
              onChange={ e => onConfigurationTextUpdated(e, displayName) }/>

    <div className="line"/>
  </div>
}