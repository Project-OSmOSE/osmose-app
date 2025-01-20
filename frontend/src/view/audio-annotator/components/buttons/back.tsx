import React from "react";
import { IonButton } from "@ionic/react";
import { useParams } from "react-router-dom";

export const BackButton: React.FC = () => {
  const { campaignID } = useParams<{ campaignID: string, fileID: string }>();

  const open = () => {
    window.open(`/app/annotation-campaign/${ campaignID }`, "_self")
  }

  const openAux = () => {
    window.open(`/app/annotation-campaign/${ campaignID }`, "_blank")
  }

  return <IonButton color="danger"
                    onClick={ open }
                    onAuxClick={ openAux }
                    title="Go back to annotation campaign tasks">
    Back to campaign
  </IonButton>
}