import React, { Fragment, useEffect, useState } from "react";
import { useToast } from "@/services/utils/toast.ts";
import { Select } from "@/components/form";
import { useListLabelSetQuery } from '@/service/campaign/label-set';
import { getErrorMessage } from '@/service/function.ts';
import { LabelSet } from '@/service/campaign/label-set';

export const LabelSetSelect: React.FC<{
  labelSet?: LabelSet,
  onLabelSetChange: (labelSet: LabelSet | undefined) => void;
  disabled: boolean;
  error?: string;
}> = ({ labelSet, onLabelSetChange, disabled, error }) => {
  // API
  const { data: allLabelSets, error: labelSetListError } = useListLabelSetQuery()

  const [ _error, set_error ] = useState<string | undefined>(error);

  // Services
  const { presentError, dismiss: dismissToast } = useToast();

  useEffect(() => {
    if (!!allLabelSets && allLabelSets.length === 0) set_error('You should create a label set');
  }, [allLabelSets]);

  useEffect(() => {
    if (labelSetListError) presentError(getErrorMessage(labelSetListError));
  }, [labelSetListError]);

  useEffect(() => {
    return () => {
      dismissToast()
    }
  }, [])

  const onSelect = (value: string | number | undefined) => {
    onLabelSetChange(allLabelSets?.find(l => l.id === value))
  }

  return <Select label="Label set" placeholder="Select a label set"
                 required={ true }
                 error={ error ?? _error }
                 options={ allLabelSets?.map(s => ({ value: s.id, label: s.name })) ?? [] }
                 optionsContainer="alert"
                 value={ labelSet?.id }
                 isLoading={ !allLabelSets }
                 disabled={ disabled || !allLabelSets?.length }
                 onValueSelected={ onSelect }>
    { !!labelSet && (
      <Fragment>
        { labelSet.desc }
        <p><span className="bold">Labels:</span> { labelSet.labels.join(', ') }</p>
      </Fragment>)
    }
  </Select>
}