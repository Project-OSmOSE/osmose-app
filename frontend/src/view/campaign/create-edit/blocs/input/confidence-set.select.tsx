import React, { Fragment, useEffect } from "react";
import { useToast } from "@/services/utils/toast.ts";
import { Select } from "@/components/form";
import { IonNote } from '@ionic/react';
import { ConfidenceIndicatorSet, useListConfidenceSetQuery } from '@/service/campaign/confidence-set';
import { getErrorMessage } from '@/service/function.ts';

export const ConfidenceSetSelect: React.FC<{
  confidenceSet?: ConfidenceIndicatorSet,
  onConfidenceSetChange: (ConfidenceIndicatorSet: ConfidenceIndicatorSet | undefined) => void;
  disabled: boolean;
  error?: string;
}> = ({ confidenceSet, onConfidenceSetChange, disabled, error }) => {
  // Services
  const { presentError, dismiss: dismissToast } = useToast();
  const { data: allConfidenceSets, error: confidenceSetError } = useListConfidenceSetQuery()

  useEffect(() => {
    return () => {
      dismissToast()
    }
  }, [])

  useEffect(() => {
    if (confidenceSetError) presentError(getErrorMessage(confidenceSetError))
  }, [confidenceSetError]);

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