import React, { Fragment, useEffect, useState } from "react";
import { LabelSet, useLabelSetAPI } from "@/services/api";
import { useToast } from "@/services/utils/toast.ts";
import { Select } from "@/components/form";

export const LabelSetSelect: React.FC<{
  labelSet?: LabelSet,
  onLabelSetChange: (labelSet: LabelSet | undefined) => void;
  disabled: boolean;
  error?: string;
}> = ({ labelSet, onLabelSetChange, disabled, error }) => {
  // API
  const labelSetAPI = useLabelSetAPI();
  const [ allLabelSets, setAllLabelSets ] = useState<Array<LabelSet> | undefined>();

  const [ _error, set_error ] = useState<string | undefined>(error);

  // Services
  const toast = useToast();

  useEffect(() => {
    let isCancelled = false;
    labelSetAPI.list().then(l => {
      setAllLabelSets(l)
      if (l.length === 0) set_error('You should create a label set');
    }).catch(e => !isCancelled && toast.presentError(e));

    return () => {
      isCancelled = true;
      labelSetAPI.abort();
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