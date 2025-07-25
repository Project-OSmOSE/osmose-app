import React, { Fragment, HTMLAttributeAnchorTarget, ReactNode, useCallback } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { Color } from "@ionic/core";
import { openOutline } from "ionicons/icons";
import { Button } from "./Button";
import { To, useNavigate } from "react-router-dom";

export const useAppLink = (appPath?: To | undefined, onClick?: () => void) => {
  const navigate = useNavigate();
  const open = useCallback(() => {
    if (appPath) navigate(appPath)
    if (onClick) onClick()
  }, [ appPath ])
  const openAux = useCallback(() => window.open(`/app${ appPath }`, "_blank"), [ appPath ])
  return { open, openAux }
}

export type LinkProps = {
  href?: string | undefined;
  appPath?: To | undefined;
  children: ReactNode;
  color?: Color;
  size?: 'small' | 'default' | 'large';
  fill?: 'clear' | 'outline' | 'solid' | 'default';
  className?: string;
  target?: HTMLAttributeAnchorTarget | undefined;
  onClick?: () => void;
} & React.ComponentProps<typeof IonButton>
export const Link: React.FC<LinkProps> = ({
                                                 children,
                                                 color = 'dark',
                                                 href,
                                                 size,
                                                 target,
                                                 fill = 'clear',
                                                 appPath,
                                                 className,
                                                 onClick,
                                                 ...props
                                               }) => {
  const { open, openAux } = useAppLink(appPath, onClick);

  if (href !== undefined) return <a style={ { textDecoration: 'none' } } className={ className }
                                    target={ target } rel="noopener, noreferrer"
                                    href={ href }
                                    onClick={ onClick }>
    <Button color={ color } fill={ fill } size={ size } { ...props }>
      { children }
      { target === '_blank' && <IonIcon icon={ openOutline } slot='end'/> }
    </Button>
  </a>
  if (appPath !== undefined) return <Button color={ color } fill={ fill } size={ size }
                                            className={ className }
                                            onClick={ target === '_blank' ? openAux : open }
                                            onAuxClick={ target === '_blank' ? undefined : openAux }
                                            { ...props }>
    { children }
    { target === '_blank' && <IonIcon icon={ openOutline } slot='end'/> }
  </Button>
  return <Fragment/>
}
