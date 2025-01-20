import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { MOUSE_MOVE_EVENT, MOUSE_UP_EVENT } from "@/service/events";

export const useDraggable = () => {

  const isDragging = useRef<boolean>(false)

  const [ top, setTop ] = useState<number>(128);
  const [ right, setRight ] = useState<number>(64);

  useEffect(() => {
    MOUSE_MOVE_EVENT.add(onMouseMove)
    MOUSE_UP_EVENT.add(onMouseUp)
    return () => {
      MOUSE_MOVE_EVENT.remove(onMouseMove)
      MOUSE_UP_EVENT.remove(onMouseUp)
    }
  }, []);

  function onMouseMove(event: MouseEvent) {
    if (!isDragging.current) return;
    setTop(previous => previous + event.movementY);
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
    get right() {
      return Math.max(0, right)
    },
  }
}
