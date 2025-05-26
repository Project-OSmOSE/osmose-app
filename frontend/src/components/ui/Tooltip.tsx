import React, { CSSProperties, ReactElement, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { IonNote } from "@ionic/react";
import styles from './ui.module.scss'
import { createPortal } from "react-dom";
import { MOUSE_MOVE_EVENT, useEvent } from "@/service/events";
import { v4 as uuidv4 } from 'uuid';
import { usePopover } from "@/service/ui/popover.ts";

export const TooltipOverlay: React.FC<{
  children: ReactElement;
  tooltipContent: ReactNode;
  title?: string;
}> = ({ children, tooltipContent, title }) => {
  const { containerRef, top, left } = usePopover()
  const containerID: string = useMemo(() => uuidv4(), []);

  const [ isOpen, setIsOpen ] = useState<boolean>(false);
  const [ isShown, setIsShown ] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) setTimeout(() => setIsShown(true), 50);
  }, [ isOpen ]);
  useEffect(() => {
    if (!isShown) setTimeout(() => setIsOpen(false), 200);
  }, [ isShown ]);


  const position: CSSProperties = useMemo(() => ({
    position: 'absolute', top: top + 8, left,
    transition: 'opacity 150ms ease-in-out', opacity: isShown ? 1 : 0,
  }), [ containerRef.current, isShown, top, left ]);

  const onMouseMove = useCallback((event: MouseEvent) => {
    const elements: Element[] = document.elementsFromPoint(event.clientX, event.clientY);
    const isOverContainer = elements.some(e => e instanceof HTMLDivElement && e.id === containerID);
    if (isOverContainer) setIsOpen(true);
    else setIsShown(false)
  }, [ containerID ]);
  useEvent(MOUSE_MOVE_EVENT, onMouseMove);

  return <div ref={ containerRef } id={ containerID }>
    { children }

    { isOpen && createPortal(<div className={ styles.tooltip }
                                  style={ position }>
      { title && <IonNote className={ styles.title }>{ title }</IonNote> }
      <div className={ styles.content }>{ tooltipContent }</div>
    </div>, document.body) }
  </div>
}
