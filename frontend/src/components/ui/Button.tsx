import React, { useCallback } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { TooltipOverlay } from "@/components/ui/Tooltip.tsx";
import { Link } from "@/components/ui/Link.tsx";
import { useNavigate } from "react-router-dom";
import { chevronBackOutline } from "ionicons/icons";

type Props = {
  disabledExplanation?: string;
} & React.ComponentProps<typeof IonButton>

export const Button: React.FC<Props> = ({ disabledExplanation, disabled, ...props }) => {

  if (disabled && disabledExplanation) return <TooltipOverlay tooltipContent={ <p>{ disabledExplanation }</p> }>
    <IonButton disabled={ disabled } { ...props }/>
  </TooltipOverlay>

  return <IonButton disabled={ disabled } { ...props }/>
}

export const DocumentationButton: React.FC<{
  size?: 'small' | 'default' | 'large';
}> = ({ size }) => (
  <Link color='medium' href='/doc/' size={ size } target='_blank'>Documentation</Link>
)

export const BackButton: React.FC = () => {
  const navigate = useNavigate()

  const onBack = useCallback(() => navigate(-1), [ navigate ])

  return <IonButton fill='clear'
                    color='medium'
                    style={ {
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    } }
                    onClick={ onBack }>
    <IonIcon icon={ chevronBackOutline } slot='start'/>
    Back
  </IonButton>
}