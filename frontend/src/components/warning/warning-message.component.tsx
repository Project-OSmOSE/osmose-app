import React, { ReactNode } from "react";
import { IonIcon } from "@ionic/react";
import { warningOutline } from "ionicons/icons";
import './warning-message.component.css'

interface Props {
  children: ReactNode;
}

export const WarningMessage: React.FC<Props> = ({ children }) => (
  <div id="warning-message">
    <IonIcon icon={ warningOutline }></IonIcon>
    { children }
  </div>
)
