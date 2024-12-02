import React, { Fragment, useEffect, useMemo } from "react";
import { useToast } from "@/services/utils/toast.ts";
import { Select } from "@/components/form";
import { IonNote } from '@ionic/react';
import { useListConfidenceSetQuery } from '@/service/campaign/confidence-set';
import { getErrorMessage } from '@/service/function.ts';
import { useAppDispatch, useAppSelector } from '@/slices/app.ts';
import {
  AnnotationCampaign,
  selectCampaignSubmissionErrors,
  selectDraftCampaign,
  updateDraftCampaign,
  WriteCreateAnnotationCampaign
} from '@/service/campaign';
import { CampaignErrors } from '@/service/campaign/type.ts';

export const ConfidenceSetSelect: React.FC<{ createdCampaign?: AnnotationCampaign }> = ({ createdCampaign }) => {
  // Services
  const dispatch = useAppDispatch();
  const { presentError, dismiss: dismissToast } = useToast();
  const { data: allConfidenceSets, error: confidenceSetError } = useListConfidenceSetQuery()
  const draftCampaign = useAppSelector(selectDraftCampaign) as Partial<WriteCreateAnnotationCampaign>
  const errors: CampaignErrors = useAppSelector(selectCampaignSubmissionErrors);

  const selectedConfidenceSet = useMemo(() => {
    if (!draftCampaign.label_set) return undefined;
    return allConfidenceSets?.find(l => l.id === draftCampaign.label_set)
  }, [ draftCampaign.label_set ])

  useEffect(() => {
    return () => {
      dismissToast()
    }
  }, [])

  useEffect(() => {
    if (confidenceSetError) presentError(getErrorMessage(confidenceSetError))
  }, [ confidenceSetError ]);

  return <Select label="Confidence indicator set" placeholder="Select a confidence set"
                 error={ errors.confidence_indicator_set }
                 options={ allConfidenceSets?.map(s => ({ value: s.id, label: s.name })) ?? [] }
                 optionsContainer="alert"
                 value={ draftCampaign.confidence_indicator_set ?? undefined }
                 disabled={ !!createdCampaign || !allConfidenceSets?.length }
                 isLoading={ !allConfidenceSets }
                 onValueSelected={ value => dispatch(updateDraftCampaign({ confidence_indicator_set: value as number })) }>
    { !!selectedConfidenceSet && (
      <Fragment>
        { selectedConfidenceSet?.desc }
        { selectedConfidenceSet?.confidence_indicators.map(c => (
          <p key={ c.level }><span className="bold">{ c.level }:</span> { c.label }</p>
        )) }
      </Fragment>)
    }
    { allConfidenceSets && allConfidenceSets.length === 0 &&
        <IonNote>You need to create a confidence set to use it in your campaign</IonNote> }
  </Select>
}