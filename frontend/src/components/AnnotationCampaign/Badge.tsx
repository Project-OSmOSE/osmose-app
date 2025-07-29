import React, { useMemo } from "react";
import { AnnotationCampaign } from "@/service/types";
import { useCampaignState } from "./hook.ts";
import { IonBadge } from "@ionic/react";
import { dateToString } from "@/service/function.ts";

export const CampaignBadge: React.FC<{ campaign: AnnotationCampaign }> = ({ campaign }) => {
  const { state, color, deadline } = useCampaignState(campaign);
  const label = useMemo(() => {
    switch (state) {
      case 'open':
        return 'Open';
      case 'due date':
        return `Due date: ${ dateToString(deadline) }`
      case 'archived':
        return 'Archived'
    }
  }, [ campaign ])

  return <IonBadge color={ color } children={ label }/>
}