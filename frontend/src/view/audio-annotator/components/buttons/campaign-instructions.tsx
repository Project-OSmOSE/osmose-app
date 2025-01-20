import React, { Fragment } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { informationCircle } from "ionicons/icons";
import { useParams } from "react-router-dom";
import { useRetrieveCampaignQuery } from "@/service/campaign";

export const CampaignInstructionsButton: React.FC = () => {
  const { campaignID } = useParams<{ campaignID: string, fileID: string }>();
  const { data: campaign } = useRetrieveCampaignQuery(campaignID)

  const open = () => {
    if (!campaign?.instructions_url) return;
    window.open(campaign?.instructions_url, "_blank", "noopener, noreferrer")
  }

  if (!campaign?.instructions_url) return <Fragment/>;
  return <IonButton color="dark"
                    fill={ "outline" }
                    onClick={ open }
                    onAuxClick={ open }>
    <IonIcon icon={ informationCircle } slot="start"/>
    Campaign instructions
  </IonButton>
}