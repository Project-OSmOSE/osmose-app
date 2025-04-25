import React from "react";
import { IonButton } from "@ionic/react";
import { TooltipOverlay } from "@/components/ui/Tooltip.tsx";
import { Link } from "@/components/ui/Link.tsx";

type Props = {
  disabledExplanation?: string;
} & React.ComponentProps<typeof IonButton>

export const Button: React.FC<Props> = ({ disabledExplanation, disabled,  ...props }) => {

  if ( disabled && disabledExplanation) return <TooltipOverlay tooltipContent={ <p>{ disabledExplanation }</p> }>
    <IonButton disabled={ disabled } { ...props }/>
  </TooltipOverlay>

  return <IonButton disabled={ disabled } { ...props }/>
}

export const DocumentationButton: React.FC<{
  size?: 'small' | 'default' | 'large';
}> = ({ size }) => (
  <Link color='medium' href='/doc/' size={ size } target='_blank'>Documentation</Link>
)
