import React, { ReactNode } from "react";
import { IonIcon } from "@ionic/react";
import { warningOutline } from "ionicons/icons";
import './warning-message.component.css'

interface Props {
  children: ReactNode;
  className?: string;
}

export const WarningMessage: React.FC<Props> = ({ children, className }) => (
  <div id="warning-message" className={ className }>
    <IonIcon icon={ warningOutline }></IonIcon>
    { children }
  </div>
)
