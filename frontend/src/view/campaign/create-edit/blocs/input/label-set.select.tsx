import React, { FormEvent, Fragment, useEffect, useMemo } from "react";
import { useToast } from "@/services/utils/toast.ts";
import { Select } from "@/components/form";
import { useListLabelSetQuery } from '@/service/campaign/label-set';
import { getErrorMessage } from '@/service/function.ts';
import { useAppDispatch, useAppSelector } from '@/service/app';
import {
  selectCampaignSubmissionErrors,
  selectCurrentCampaign,
  selectDraftCampaign,
  updateCampaignSubmissionErrors,
  updateDraftCampaign,
  WriteCreateAnnotationCampaign
} from '@/service/campaign';
import { CampaignErrors } from '@/service/campaign/type.ts';
import { Table, TableContent, TableDivider, TableHead } from '@/components/table/table.tsx';
import { IonCheckbox } from '@ionic/react';

export const LabelSetSelect: React.FC = () => {

  // Services
  const dispatch = useAppDispatch();
  const { presentError, dismiss: dismissToast } = useToast();
  const { data: allLabelSets, error: labelSetListError } = useListLabelSetQuery()

  // State
  const draftCampaign = useAppSelector(selectDraftCampaign) as Partial<WriteCreateAnnotationCampaign>
  const createdCampaign = useAppSelector(selectCurrentCampaign)
  const errors: CampaignErrors = useAppSelector(selectCampaignSubmissionErrors);

  const selectedLabelSet = useMemo(() => {
    if (!draftCampaign.label_set) return undefined;
    return allLabelSets?.find(l => l.id === draftCampaign.label_set)
  }, [ draftCampaign.label_set ])

  useEffect(() => {
    if (!!allLabelSets && allLabelSets.length === 0) dispatch(updateCampaignSubmissionErrors({
      label_set: 'You should create a label set'
    }));
  }, [ allLabelSets ]);

  useEffect(() => {
    if (labelSetListError) presentError(getErrorMessage(labelSetListError));
  }, [ labelSetListError ]);

  useEffect(() => {
    return () => {
      dismissToast()
    }
  }, [])

  const onLabelChecked = (event: FormEvent<HTMLIonCheckboxElement>, label: string) => {
    event.stopPropagation()
    event.preventDefault()
    let labels = draftCampaign.labels_with_acoustic_features ?? [];
    if (event.currentTarget.checked) {
      labels = [ ...labels, label ]
    } else {
      labels = labels.filter(l => l !== label)
    }
    dispatch(updateDraftCampaign({ labels_with_acoustic_features: labels }))
  }

  return <Select label="Label set" placeholder="Select a label set"
                 required={ true }
                 error={ errors.label_set }
                 options={ allLabelSets?.map(s => ({ value: s.id, label: s.name })) ?? [] }
                 optionsContainer="alert"
                 value={ draftCampaign.label_set }
                 isLoading={ !allLabelSets }
                 disabled={ !!createdCampaign || !allLabelSets?.length }
                 onValueSelected={ value => dispatch(updateDraftCampaign({ label_set: value as number | undefined })) }>
    { !!selectedLabelSet && (
      <Fragment>
        { selectedLabelSet.desc }

        <Table columns={ 2 }>
          <TableHead isFirstColumn={ true }>Label</TableHead>
          <TableHead>Acoustic features</TableHead>
          <TableDivider/>

          { selectedLabelSet.labels.map(label => <Fragment key={ label }>
            <TableContent isFirstColumn={ true }>{ label }</TableContent>
            <TableContent><IonCheckbox value={ draftCampaign.labels_with_acoustic_features?.includes(label) }
                                       onClick={ event => onLabelChecked(event, label) }/></TableContent>
            <TableDivider/>
          </Fragment>) }
        </Table>
      </Fragment>)
    }
  </Select>
}