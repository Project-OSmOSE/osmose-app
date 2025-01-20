import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { useMouseEvents } from "@/service/events";

export const useDraggable = () => {
  const mouse = useMouseEvents();

  const isDragging = useRef<boolean>(false)

  const [ top, setTop ] = useState<number>(128);
  const [ right, setRight ] = useState<number>(64);

  useEffect(() => {
    mouse.move.add(onMouseMove)
    mouse.up.add(onMouseUp)
    // mouse.leave.add(onMouseUp)

    return () => {
      mouse.move.remove(onMouseMove)
      mouse.up.remove(onMouseUp)
      // mouse.leave.remove(onMouseUp)
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
