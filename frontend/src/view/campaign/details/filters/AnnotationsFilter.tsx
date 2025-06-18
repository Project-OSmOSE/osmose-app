import React, { Fragment, useCallback, useMemo, useState } from "react";
import { IonIcon } from "@ionic/react";
import { funnel, funnelOutline } from "ionicons/icons";
import { createPortal } from "react-dom";
import { Modal } from "@/components/ui";
import { Select, Switch } from "@/components/form";
import styles from './styles.module.scss'
import { useGetLabelSetForCurrentCampaign } from "@/service/api/label-set.ts";
import { useGetConfidenceSetForCurrentCampaign } from "@/service/api/confidence-set.ts";
import { useListDetectorForCurrentCampaign } from "@/service/api/detector.ts";
import { useFileFilters } from "@/service/slices/filter.ts";

const BOOLEAN_OPTIONS = [ 'Unset', 'With', 'Without' ]
type BooleanOption = typeof BOOLEAN_OPTIONS[number];

export const AnnotationsFilter: React.FC<{
  onUpdate: () => void
}> = ({ onUpdate }) => {
  const { params, updateParams } = useFileFilters()
  const { labelSet } = useGetLabelSetForCurrentCampaign();
  const { confidenceSet } = useGetConfidenceSetForCurrentCampaign();
  const { detectors } = useListDetectorForCurrentCampaign();

  const hasAnnotationsFilter = useMemo(() => params.with_user_annotations !== undefined, [ params ]);
  const isHasAnnotationsFilterDisabled = useMemo(() => {
    return !!params.label__name || !!params.confidence_indicator__label
      || !!params.detector_configuration__detector__name || params.acoustic_features__isnull !== undefined
  }, [ params ]);
  const [ filterModalOpen, setFilterModalOpen ] = useState<boolean>(false);

  const booleanOptionToValue = useCallback((option: BooleanOption, reverse: boolean = false): boolean | undefined => {
    switch (option) {
      case 'With':
        return !reverse;
      case 'Without':
        return reverse;
      case 'Unset':
        return undefined;
    }
  }, [])

  const valueToBooleanOption = useCallback((value: boolean | undefined, reverse: boolean = false): BooleanOption => {
    switch (value) {
      case true:
        return reverse ? 'Without' : 'With';
      case false:
        return reverse ? 'With' : 'Without';
      case undefined:
        return 'Unset';
    }
  }, [])

  const setHasAnnotations = useCallback((option: BooleanOption) => {
    updateParams({
      with_user_annotations: booleanOptionToValue(option),
      confidence_indicator__label: undefined,
      label__name: undefined,
      detector_configuration__detector__name: undefined,
      acoustic_features__isnull: undefined,
    })
    onUpdate()
  }, [ updateParams ])

  const setAcousticFeatures = useCallback((option: BooleanOption) => {
    updateParams({
      with_user_annotations: true,
      acoustic_features__isnull: booleanOptionToValue(option, true),
    })
    onUpdate()
  }, [ updateParams ])

  const setLabel = useCallback((label: number | string | undefined) => {
    updateParams({
      with_user_annotations: true,
      label__name: typeof label === 'number' ? label.toString() : label,
    })
    onUpdate()
  }, [ updateParams ])

  const setConfidence = useCallback((label: number | string | undefined) => {
    updateParams({
      with_user_annotations: true,
      confidence_indicator__label: typeof label === 'number' ? label.toString() : label,
    })
    onUpdate()
  }, [ updateParams ])

  const setDetector = useCallback((label: number | string | undefined) => {
    updateParams({
      with_user_annotations: true,
      detector_configuration__detector__name: typeof label === 'number' ? label.toString() : label,
    })
    onUpdate()
  }, [ updateParams ])

  return <Fragment>
    { hasAnnotationsFilter ?
      <IonIcon onClick={ () => setFilterModalOpen(true) } color='primary' icon={ funnel }/> :
      <IonIcon onClick={ () => setFilterModalOpen(true) } color='dark' icon={ funnelOutline }/> }

    { filterModalOpen && createPortal(<Modal className={ styles.filterModal }
                                             onClose={ () => setFilterModalOpen(false) }>

      <Switch label='Annotations' disabled={ isHasAnnotationsFilterDisabled } options={ BOOLEAN_OPTIONS }
              value={ valueToBooleanOption(params.with_user_annotations) }
              onValueSelected={ setHasAnnotations }/>

      { labelSet && <Select label='Label' placeholder='Filter by label' optionsContainer='popover'
                            options={ labelSet.labels.map(l => ({ label: l, value: l })) }
                            value={ params.label__name }
                            onValueSelected={ setLabel }/> }

      { confidenceSet?.confidence_indicators &&
          <Select label='Confidence' placeholder='Filter by confidence' optionsContainer='popover'
                  options={ confidenceSet.confidence_indicators.map(c => ({ label: c.label, value: c.label })) }
                  value={ params.confidence_indicator__label }
                  onValueSelected={ setConfidence }/> }

      { detectors &&
          <Select label='Detectors' placeholder='Filter by detector' optionsContainer='popover'
                  options={ detectors.map(d => ({ label: d.name, value: d.name })) }
                  value={ params.detector_configuration__detector__name }
                  onValueSelected={ setDetector }/> }

      <Switch label='Acoustic features' options={ BOOLEAN_OPTIONS }
              value={ valueToBooleanOption(params.acoustic_features__isnull, true) }
              onValueSelected={ setAcousticFeatures }/>

    </Modal>, document.body) }
  </Fragment>
}