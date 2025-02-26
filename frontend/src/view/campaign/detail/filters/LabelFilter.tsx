import React, { Fragment, useMemo } from "react";
import { IonChip, IonIcon } from "@ionic/react";
import { closeCircle, swapHorizontal } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { setFileFilters } from "@/service/ui";
import { useParams } from "react-router-dom";
import { useRetrieveLabelSetQuery } from "@/service/campaign/label-set";
import { AnnotationCampaign } from "@/service/campaign";

export const LabelFilter: React.FC<{
  onUpdate: () => void
  campaign?: AnnotationCampaign;
}> = ({ onUpdate, campaign }) => {
  const { id: campaignID } = useParams<{ id: string }>();
  const { data: labelSet } = useRetrieveLabelSetQuery(campaign!.label_set, { skip: !campaign });

  const { fileFilters: filters } = useAppSelector(state => state.ui);
  const dispatch = useAppDispatch();

  const state = useMemo(() => {
    if (!labelSet || labelSet.labels.length === 0) return 'empty';
    if (!filters.label) return 'no label';
    if ([...labelSet.labels].pop() === filters.label) return 'last';
    return 'label'
  }, [filters.label, labelSet ])

  function setState(newState: string | undefined) {
    dispatch(setFileFilters({
      ...filters,
      campaignID,
      label: newState,
      withUserAnnotations: newState ? true : undefined,
    }))
    onUpdate()
  }

  switch (state) {
    case 'empty':
      return <Fragment/>
    case 'label':
      return <IonChip outline={ false } color='primary' onClick={ () => setState(labelSet!.labels[labelSet!.labels.indexOf(filters.label!) + 1]) }>
        Label: { filters.label }
        <IonIcon icon={ swapHorizontal } color='primary'/>
      </IonChip>
    case 'last':
      return <IonChip outline={ false } color='primary' onClick={ () => setState(undefined) }>
        Label: { filters.label }
        <IonIcon icon={ closeCircle } color='primary'/>
      </IonChip>
    case 'no label':
      return <IonChip outline={ true } color='medium' onClick={ () => setState(labelSet!.labels[0]) }>Label</IonChip>
  }
}