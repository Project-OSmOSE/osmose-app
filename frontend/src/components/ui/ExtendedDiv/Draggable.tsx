import React, { MouseEvent, ReactNode, useEffect, useRef } from 'react';
import { MOUSE_MOVE_EVENT, MOUSE_UP_EVENT } from '@/service/events';
import style from './extended.module.scss';

export const Draggable: React.FC<{
  onXMove?(movement: number): void;
  onYMove?(movement: number): void;
  onUp?(): void;
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
}> = ({
        disabled = false,
        onXMove, onYMove, onUp,
        children, className
      }) => {
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    MOUSE_MOVE_EVENT.add(mouseMove)
    MOUSE_UP_EVENT.add(mouseUp)
    return () => {
      MOUSE_MOVE_EVENT.remove(mouseMove)
      MOUSE_UP_EVENT.remove(mouseUp)
    }
  }, []);

  function mouseDown(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    isDragging.current = true;
  }

  function mouseMove(event: MouseEvent) {
    if (disabled || !isDragging.current) return;
    event.stopPropagation();
    event.preventDefault();
    if (onXMove) onXMove(event.movementX);
    if (onYMove) onYMove(event.movementY);
  }

  function mouseUp() {
    if (isDragging.current) {
      isDragging.current = false;
      if (onUp && !disabled) onUp()
    }
  }

  return (
    <div onMouseDown={ mouseDown }
         children={ children }
         className={ [ disabled ? '' : style.draggable, className ].join(' ') }/>
  )
}