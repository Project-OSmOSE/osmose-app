import React, { Fragment, useEffect, useState } from "react";
import { ConfidenceIndicatorSet, useConfidenceSetAPI } from "@/services/api";
import { useToast } from "@/services/utils/toast.ts";
import { Select } from "@/components/form";
import { IonNote } from '@ionic/react';

export const ConfidenceSetSelect: React.FC<{
  confidenceSet?: ConfidenceIndicatorSet,
  onConfidenceSetChange: (ConfidenceIndicatorSet: ConfidenceIndicatorSet | undefined) => void;
  disabled: boolean;
  error?: string;
}> = ({ confidenceSet, onConfidenceSetChange, disabled, error }) => {
  // API
  const confidenceSetAPI = useConfidenceSetAPI();
  const [ allConfidenceSets, setAllConfidenceSets ] = useState<Array<ConfidenceIndicatorSet> | undefined>();

  // Services
  const toast = useToast();

  useEffect(() => {
    let isCancelled = false;
    confidenceSetAPI.list().then(setAllConfidenceSets).catch(e => !isCancelled && toast.presentError(e));

    return () => {
      isCancelled = true;
      confidenceSetAPI.abort();
    }
  }, [])

  const onSelect = (value: string | number | undefined) => {
    onConfidenceSetChange(allConfidenceSets?.find(l => l.id === value))
  }

  return <Select label="Confidence indicator set" placeholder="Select a confidence set"
                 error={ error }
                 options={ allConfidenceSets?.map(s => ({ value: s.id, label: s.name })) ?? [] }
                 optionsContainer="alert"
                 value={ confidenceSet?.id }
                 disabled={ disabled || !allConfidenceSets?.length }
                 isLoading={ !allConfidenceSets }
                 onValueSelected={ onSelect }>
    { !!confidenceSet && (
      <Fragment>
        { confidenceSet?.desc }
        { confidenceSet?.confidence_indicators.map(c => (
          <p key={ c.level }><span className="bold">{ c.level }:</span> { c.label }</p>
        )) }
      </Fragment>)
    }
    { allConfidenceSets && allConfidenceSets.length === 0 &&
        <IonNote>You need to create a confidence set to use it in your campaign</IonNote> }
  </Select>
}