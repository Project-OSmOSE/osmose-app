import React, { useMemo } from "react";
import { AnnotationCampaign } from "@/service/campaign";
import { useCampaignState } from "./hook.ts";
import { IonBadge } from "@ionic/react";

export const CampaignBadge: React.FC<{ campaign: AnnotationCampaign }> = ({ campaign }) => {
  const { state, color, deadline } = useCampaignState(campaign);
  const label = useMemo(() => {
    switch (state) {
      case 'open':
        return 'Open';
      case 'due date':
        return `Due date: ${ deadline?.toLocaleDateString() }`
      case 'archived':
        return 'Archived'
    }
  }, [ campaign ])

  return <IonBadge color={ color } children={ label }/>
}