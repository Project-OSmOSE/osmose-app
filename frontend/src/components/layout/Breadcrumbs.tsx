import React, { HTMLProps } from "react";
import { IonBreadcrumb, IonBreadcrumbs, IonIcon } from "@ionic/react";
import { chevronForwardOutline } from "ionicons/icons";

export const Breadcrumbs: React.FC<{
  labels: string[];
  active: string;
} & Omit<HTMLProps<HTMLIonBreadcrumbsElement>, 'children' | 'ref'>> = ({ labels, active, ...props }) => (
  <IonBreadcrumbs { ...props }>
    { labels.map(label => (
      <IonBreadcrumb key={ label } active={ active === label } color={ active === label ? 'primary' : 'medium' }>
        { label }
        <IonIcon slot="separator" icon={ chevronForwardOutline }/>
      </IonBreadcrumb>
    )) }
  </IonBreadcrumbs>
)