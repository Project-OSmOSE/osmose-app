import React, { Fragment, useEffect, useMemo } from "react";
import { useToast } from "@/services/utils/toast.ts";
import { Select } from "@/components/form";
import { useListLabelSetQuery } from '@/service/campaign/label-set';
import { getErrorMessage } from '@/service/function.ts';
import { useAppDispatch, useAppSelector } from '@/slices/app.ts';
import {
  AnnotationCampaign,
  selectCampaignSubmissionErrors,
  selectDraftCampaign,
  updateCampaignSubmissionErrors,
  updateDraftCampaign,
  WriteCreateAnnotationCampaign
} from '@/service/campaign';
import { CampaignErrors } from '@/service/campaign/type.ts';

export const LabelSetSelect: React.FC<{ createdCampaign?: AnnotationCampaign }> = ({ createdCampaign }) => {

  // Services
  const dispatch = useAppDispatch();
  const { presentError, dismiss: dismissToast } = useToast();
  const { data: allLabelSets, error: labelSetListError } = useListLabelSetQuery()
  const draftCampaign = useAppSelector(selectDraftCampaign) as Partial<WriteCreateAnnotationCampaign>
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
        <p><span className="bold">Labels:</span> { selectedLabelSet.labels.join(', ') }</p>
      </Fragment>)
    }
  </Select>
}