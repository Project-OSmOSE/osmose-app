import React from "react";
import { Link } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";
import './Back.css';

interface BackProps {
  path: string;
  pageName?: string;
}

export const Back: React.FC<BackProps> = ({ path, pageName }) => (
  <Link to={ path } id="back-component">
    <IonIcon icon={ chevronBackOutline }></IonIcon>
    Back { pageName && `to ${ pageName }` }
  </Link>
)