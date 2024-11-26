import React from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { helpCircle } from "ionicons/icons";
import { ANNOTATOR_GUIDE_URL } from "@/consts/links.ts";

export const UserGuideButton: React.FC = () => {

  const open = () => {
    window.open(ANNOTATOR_GUIDE_URL, "_blank", "noopener, noreferrer")
  }

  return <IonButton color="dark"
                    fill={ "outline" }
                    onClick={ open }
                    onAuxClick={ open }>
    <IonIcon icon={ helpCircle } slot="start"/>
    Annotator user guide
  </IonButton>
}