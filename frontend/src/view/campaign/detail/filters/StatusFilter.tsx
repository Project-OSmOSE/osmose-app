import React from "react";
import { IonChip, IonIcon } from "@ionic/react";
import { checkmarkCircle, closeCircle, ellipseOutline, swapHorizontal } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { setFileFilters } from "@/service/ui";
import { useParams } from "react-router-dom";

export const StatusFilter: React.FC<{
  onUpdate: () => void
}> = ({ onUpdate }) => {
  const { id: campaignID } = useParams<{ id: string }>();

  const { fileFilters: filters } = useAppSelector(state => state.ui);
  const dispatch = useAppDispatch();

  function setState(newState: boolean | undefined) {
    dispatch(setFileFilters({
      ...filters,
      campaignID,
      isSubmitted: newState
    }))
    onUpdate()
  }

  switch (filters.isSubmitted) {
    case true:
      return <IonChip outline={ false } color='primary' onClick={ () => setState(false) }>
        Status:&nbsp;&nbsp;<IonIcon icon={ checkmarkCircle } color='primary'/>
        <IonIcon icon={ swapHorizontal } color='primary'/>
      </IonChip>
    case false:
      return <IonChip outline={ false } color='primary' onClick={ () => setState(undefined) }>
        Status:&nbsp;&nbsp;<IonIcon icon={ ellipseOutline } color='medium'/>
        <IonIcon icon={ closeCircle } color='primary'/>
      </IonChip>
    case undefined:
      return <IonChip outline={ true } color='medium' onClick={ () => setState(true) }>Status</IonChip>
  }
}