import { MouseEvent as ReactMouseEvent, useRef, useState } from "react";
import { MOUSE_MOVE_EVENT, MOUSE_UP_EVENT, useEvent } from "@/service/events";

export const useDraggable = (initialPosition: {top?: number, left?: number, right?: number, bottom?: number}) => {

  const isDragging = useRef<boolean>(false)

  const [ top, setTop ] = useState<number>(initialPosition.top ?? 0);
  const [ bottom, setBottom ] = useState<number>(initialPosition.bottom ?? 0);
  const [ left, setLeft ] = useState<number>(initialPosition.left ?? 0);
  const [ right, setRight ] = useState<number>(initialPosition.right ?? 0);

  useEvent(MOUSE_MOVE_EVENT, onMouseMove);
  useEvent(MOUSE_UP_EVENT, onMouseUp);

  function onMouseMove(event: MouseEvent) {
    if (!isDragging.current) return;
    setTop(previous => previous + event.movementY);
    setBottom(previous => previous - event.movementY);
    setLeft(previous => previous + event.movementX);
    setRight(previous => previous - event.movementX);
    event.stopPropagation();
    event.preventDefault();
  }

  function onMouseUp(event: MouseEvent) {
    isDragging.current = false;
    event.stopPropagation();
    event.preventDefault();
  }

  function onMouseDown(event: ReactMouseEvent) {
    isDragging.current = true;
    event.stopPropagation();
    event.preventDefault();
  }

  return {
    onMouseDown,
    get top() {
      return Math.max(0, top)
    },
    get bottom() {
      return Math.max(0, bottom)
    },
    get left() {
      return Math.max(0, left)
    },
    get right() {
      return Math.max(0, right)
    },
  }
}
