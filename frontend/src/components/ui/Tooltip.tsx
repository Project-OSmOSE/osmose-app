import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { IonNote } from "@ionic/react";
import styles from './ui.module.scss'
import { createPortal } from "react-dom";
import { MOUSE_MOVE_EVENT, useEvent } from "@/service/events";
import { v4 as uuidv4 } from 'uuid';

export const TooltipOverlay: React.FC<{
  children: ReactElement;
  tooltipContent: ReactNode;
  title?: string;
}> = ({ children, tooltipContent, title }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerID: string = useMemo(() => uuidv4(), []);

  const [ isOpen, setIsOpen ] = useState<boolean>(false);
  const [ isShown, setIsShown ] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) setTimeout(() => setIsShown(true), 50);
  }, [ isOpen ]);
  useEffect(() => {
    if (!isShown) setTimeout(() => setIsOpen(false), 200);
  }, [ isShown ]);


  const position: CSSProperties = useMemo(() => {
    let top = 0, left = 0;
    if (containerRef.current) {
      top = containerRef.current.offsetTop + containerRef.current.offsetHeight + 8;

      const bounds = containerRef.current.getBoundingClientRect()
      top = document.getElementsByTagName('html')[0].scrollTop + bounds.top + bounds.height + 8;
      left = bounds.left;
    }
    return {
      position: 'absolute', top, left, transition: 'opacity 150ms ease-in-out', opacity: isShown ? 1 : 0,
    }
  }, [ containerRef.current, isShown ]);

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
