import React, { ChangeEvent, Fragment, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { FormBloc, Select, Textarea } from "@/components/form";
import { Detector, DetectorConfiguration } from "@/service/campaign/detector";
import styles from './importAnnotations.module.scss'
import { ResultImportSlice } from "@/service/campaign/result/import";

export const DetectorsConfigContent: React.FC = () => {

  const { file, detectors } = useAppSelector(state => state.resultImport);
  const dispatch = useAppDispatch();

  const distinctKnownDetectors = useMemo(() => {
    const map = new Map<Detector, string[]>();
    for (const [ initialName, detector ] of Object.entries(detectors.mapToKnown)) {
      if (!detector) continue;
      const existing = map.get(detector) ?? []
      map.set(detector, [ ...existing, initialName ]);
    }
    return [ ...map.entries() ];
  }, [ detectors.mapToKnown ]);
  const unknownDetectors = useMemo(() => {
    return Object.entries(detectors.mapToKnown).filter(([ _, d ]) => !d).map(([ name ]) => name)
  }, [ detectors.mapToKnown ]);

  const onSelectConfiguration = useCallback((id: string | number | undefined, detectorNames: string[]) => {
    if (typeof id === 'undefined' || (typeof id === 'string' && isNaN(+id)) || (typeof id === 'number' && id === -1)) {
      for (const name of detectorNames) {
        dispatch(ResultImportSlice.actions.mapConfiguration({ name, configuration: '' }));
      }
    } else {
      for (const name of detectorNames) {
        const knownDetector = detectors.mapToKnown[name];
        dispatch(ResultImportSlice.actions.mapConfiguration({
          name, configuration: knownDetector?.configurations?.find(c => c.id === +id)
        }));
      }
    }
  }, [])
  const onConfigurationTextUpdated = useCallback((e: ChangeEvent<HTMLTextAreaElement>, detectorNames: string) => {
    for (const name of detectorNames) {
      dispatch(ResultImportSlice.actions.mapConfiguration({ name, configuration: e.target.value }));
    }
  }, [])

  if (file.state !== 'loaded' || detectors.selection.length === 0) return <Fragment/>
  return <FormBloc label="Detectors configurations">
    { distinctKnownDetectors.map(([ detector, names ]) => {
      const configuration = detectors.mapToConfiguration[names[0]];
      return <div className={ styles.configEntry }>

        <p><strong>{ detector?.name }</strong>({ names.join(', ') }) configuration</p>

        <Select value={ typeof configuration === 'string' ? undefined : configuration?.id }
                onValueSelected={ v => onSelectConfiguration(v, names) }
                options={ detector.configurations.map((c: DetectorConfiguration) => ({
                  value: c.id,
                  label: c.configuration
                })) ?? [] }
                optionsContainer="popover"
                noneLabel="Create new" noneFirst
                placeholder="Select configuration"/>

        <Textarea placeholder="Enter new configuration"
                  hidden={ !configuration }
                  disabled={ !configuration || typeof configuration === 'string' }
                  value={ typeof configuration === 'string' ? configuration : configuration?.configuration }
                  onChange={ e => onConfigurationTextUpdated(e, names) }/>

        <div className="line"/>
      </div>
    }) }
    { detectors.selection.map(detector => {
      const knownDetector = detectors.mapToKnown[detector];
      const configuration = detectors.mapToConfiguration[detector];
      return <div className={ [ styles.configEntry, !knownDetector && styles.unknown ].join(' ') }>

        <p><strong>{ detector }</strong> configuration</p>

        <Select value={ typeof configuration === 'string' ? undefined : configuration?.id }
                onValueSelected={ v => onSelectConfiguration(v, detector) }
                options={ knownDetector?.configurations.map((c: DetectorConfiguration) => ({
                  value: c.id,
                  label: c.configuration
                })) ?? [] }
                optionsContainer="popover"
                noneLabel="Create new" noneFirst
                placeholder="Select configuration"/>

        <Textarea placeholder="Enter new configuration"
                  hidden={ !configuration }
                  disabled={ knownDetector && (!configuration || typeof configuration === 'string') }
                  value={ typeof configuration === 'string' ? configuration : configuration?.configuration }
                  onChange={ e => onConfigurationTextUpdated(e, detector) }/>

        <div className="line"/>
      </div>
    }) }
  </FormBloc>
}

