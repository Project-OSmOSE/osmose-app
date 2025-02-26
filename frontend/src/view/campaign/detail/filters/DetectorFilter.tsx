import React, { Fragment, useMemo } from "react";
import { IonChip, IonIcon } from "@ionic/react";
import { closeCircle, swapHorizontal } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { setFileFilters } from "@/service/ui";
import { useParams } from "react-router-dom";
import { AnnotationCampaign } from "@/service/campaign";
import { useListDetectorQuery } from "@/service/campaign/detector";

export const DetectorFilter: React.FC<{
  onUpdate: () => void
  campaign?: AnnotationCampaign;
}> = ({ onUpdate, campaign }) => {
  const { id: campaignID } = useParams<{ id: string }>();
  const { data: detectors } = useListDetectorQuery({ campaign: campaign!.id }, { skip: !campaign });
  const detectorNames = useMemo(() => detectors?.map(d => d.name), [ detectors ])

  const { fileFilters: filters } = useAppSelector(state => state.ui);
  const dispatch = useAppDispatch();

  const state = useMemo(() => {
    if (!detectorNames || detectorNames.length === 0) return 'empty';
    if (!filters.detector) return 'no detector';
    if ([...detectorNames].pop() === filters.detector) return 'last';
    return 'detector'
  }, [filters.label, detectorNames ])

  function setState(newState: string | undefined) {
    dispatch(setFileFilters({
      ...filters,
      campaignID,
      detector: newState,
      withUserAnnotations: newState ? true : undefined,
    }))
    onUpdate()
  }

  if (campaign?.usage !== 'Check') return <Fragment/>
  switch (state) {
    case 'empty':
      return <Fragment/>
    case 'detector':
      return <IonChip outline={ false } color='primary' onClick={ () => setState(detectorNames![detectorNames!.indexOf(filters.label!) + 1]) }>
        Detector: { filters.detector }
        <IonIcon icon={ swapHorizontal } color='primary'/>
      </IonChip>
    case 'last':
      return <IonChip outline={ false } color='primary' onClick={ () => setState(undefined) }>
        Detector: { filters.detector }
        <IonIcon icon={ closeCircle } color='primary'/>
      </IonChip>
    case 'no detector':
      return <IonChip outline={ true } color='medium' onClick={ () => setState(detectorNames![0]) }>Detector</IonChip>
  }
}