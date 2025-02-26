import React, { Fragment, useMemo } from "react";
import { IonChip, IonIcon } from "@ionic/react";
import { closeCircle, swapHorizontal } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { setFileFilters } from "@/service/ui";
import { useParams } from "react-router-dom";
import { AnnotationCampaign } from "@/service/campaign";
import { useRetrieveConfidenceSetQuery } from "@/service/campaign/confidence-set";

export const ConfidenceFilter: React.FC<{
  onUpdate: () => void
  campaign?: AnnotationCampaign;
}> = ({ onUpdate, campaign }) => {
  const { id: campaignID } = useParams<{ id: string }>();
  const { data: confidenceSet } = useRetrieveConfidenceSetQuery(campaign!.confidence_indicator_set!, { skip: !campaign?.confidence_indicator_set });
  const indicators = useMemo(() => confidenceSet?.confidence_indicators.map(c => c.label), [ confidenceSet ])

  const { fileFilters: filters } = useAppSelector(state => state.ui);
  const dispatch = useAppDispatch();

  const state = useMemo(() => {
    if (!indicators || indicators.length === 0) return 'empty';
    if (!filters.confidence) return 'no confidence';
    if ([ ...indicators ].pop() === filters.confidence) return 'last';
    return 'confidence'
  }, [ filters.confidence, indicators ])

  function setState(newState: string | undefined) {
    dispatch(setFileFilters({
      ...filters,
      campaignID,
      confidence: newState,
      withUserAnnotations: newState ? true : undefined,
    }))
    onUpdate()
  }

  if (!campaign?.confidence_indicator_set) return <Fragment/>
  switch (state) {
    case 'empty':
      return <Fragment/>
    case 'confidence':
      return <IonChip outline={ false } color='primary'
                      onClick={ () => setState(indicators![indicators!.indexOf(filters.confidence!) + 1]) }>
        Confidence: { filters.confidence }
        <IonIcon icon={ swapHorizontal } color='primary'/>
      </IonChip>
    case 'last':
      return <IonChip outline={ false } color='primary' onClick={ () => setState(undefined) }>
        Confidence: { filters.confidence }
        <IonIcon icon={ closeCircle } color='primary'/>
      </IonChip>
    case 'no confidence':
      return <IonChip outline={ true } color='medium' onClick={ () => setState(indicators![0]) }>Confidence</IonChip>
  }
}