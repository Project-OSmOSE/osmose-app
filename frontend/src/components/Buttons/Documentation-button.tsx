import React from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { openOutline } from "ionicons/icons";

export const DocumentationButton: React.FC = () => (
  <a href='/doc/' target='_blank'>
    <IonButton color='medium' fill='clear'>
      Documentation
      <IonIcon icon={ openOutline } slot='end'/>
    </IonButton>
  </a>
)