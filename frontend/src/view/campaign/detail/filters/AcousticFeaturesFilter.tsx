import React from "react";
import { IonChip, IonIcon } from "@ionic/react";
import { closeCircle, swapHorizontal } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { setFileFilters } from "@/service/ui";
import { useParams } from "react-router-dom";

export const AcousticFeaturesFilter: React.FC<{
  onUpdate: () => void
}> = ({ onUpdate }) => {
  const { id: campaignID } = useParams<{ id: string }>();

  const { fileFilters: filters } = useAppSelector(state => state.ui);
  const dispatch = useAppDispatch();

  function setState(newState: boolean | undefined) {
    dispatch(setFileFilters({
      ...filters,
      campaignID,
      hasAcousticFeatures: newState,
      withUserAnnotations: newState !== undefined ? true : undefined,
    }))
    onUpdate()
  }

  switch (filters.hasAcousticFeatures) {
    case true:
      return <IonChip outline={ false } color='primary' onClick={ () => setState(false) }>
        With acoustic features
        <IonIcon icon={ swapHorizontal } color='primary'/>
      </IonChip>
    case false:
      return <IonChip outline={ false } color='primary' onClick={ () => setState(undefined) }>
        Without acoustic features
        <IonIcon icon={ closeCircle } color='primary'/>
      </IonChip>
    case undefined:
      return <IonChip outline={ true } color='medium' onClick={ () => setState(true) }>Acoustic features</IonChip>
  }
}