import React, { Fragment, MouseEvent, ReactNode, useEffect, useMemo, useRef } from "react";
import styles from './ui-tools.module.scss';
import { MOUSE_MOVE_EVENT, MOUSE_UP_EVENT } from "@/service/events";

type Props = {
  children?: ReactNode;
  disabled?: boolean;
  onResize?: (newCoords: Coords) => void;
  className?: string;

  x1: number;
  x2: number;
  y1: number;
  y2: number;

  minX?: number;
  minY?: number;
  maxX?: number;
  maxY?: number;
}

export type Coords = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export const ResizableDiv: React.FC<Props> = ({
                                                children,
                                                className,
                                                disabled = false,
                                                onResize,
                                                x1, x2,
                                                y1, y2,
                                                minX, minY,
                                                maxX, maxY
                                              }) => {

  // Positions
  const coords = useRef<Coords | undefined>();

  useEffect(() => {
    coords.current = fixCoords({ x1, x2, y1, y2 })
  }, []);

  // Side handle
  const isTopDragging = useRef<boolean>(false);
  const isLeftDragging = useRef<boolean>(false);
  const isBottomDragging = useRef<boolean>(false);
  const isRightDragging = useRef<boolean>(false);

  function onTopMouseDown(event: MouseEvent) {
    isTopDragging.current = true;
    event.stopPropagation();
    event.preventDefault();
  }

  function onBottomMouseDown(event: MouseEvent) {
    isBottomDragging.current = true;
    event.stopPropagation();
    event.preventDefault();
  }

  function onLeftMouseDown(event: MouseEvent) {
    isLeftDragging.current = true;
    event.stopPropagation();
    event.preventDefault();
  }

  function onRightMouseDown(event: MouseEvent) {
    isRightDragging.current = true;
    event.stopPropagation();
    event.preventDefault();
  }

  // Corner handle
  const isTopLeftDragging = useRef<boolean>(false);
  const isTopRightDragging = useRef<boolean>(false);
  const isBottomLeftDragging = useRef<boolean>(false);
  const isBottomRightDragging = useRef<boolean>(false);

  function onTopLeftMouseDown(event: MouseEvent) {
    isTopLeftDragging.current = true;
    event.stopPropagation();
    event.preventDefault();
  }

  function onTopRightMouseDown(event: MouseEvent) {
    isTopRightDragging.current = true;
    event.stopPropagation();
    event.preventDefault();
  }

  function onBottomLeftMouseDown(event: MouseEvent) {
    isBottomLeftDragging.current = true;
    event.stopPropagation();
    event.preventDefault();
  }

  function onBottomRightMouseDown(event: MouseEvent) {
    isBottomRightDragging.current = true;
    event.stopPropagation();
    event.preventDefault();
  }

  // Mouse move

  useEffect(() => {
    MOUSE_MOVE_EVENT.add(onMouseMove)
    MOUSE_UP_EVENT.add(onMouseUp)
    return () => {
      MOUSE_MOVE_EVENT.remove(onMouseMove)
      MOUSE_UP_EVENT.remove(onMouseUp)
    }
  }, []);

  function onMouseMove(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    if (!coords.current) return;
    if (isTopDragging.current) {
      coords.current = { ...coords.current, y1: coords.current.y1 + event.movementY }
    } else if (isBottomDragging.current) {
      coords.current = { ...coords.current, y2: coords.current.y2 + event.movementY }
    } else if (isLeftDragging.current) {
      coords.current = { ...coords.current, x1: coords.current.x1 + event.movementX }
    } else if (isRightDragging.current) {
      coords.current = { ...coords.current, x2: coords.current.x2 + event.movementX }
    } else if (isTopLeftDragging.current) {
      coords.current = {
        ...coords.current,
        y1: coords.current.y1 + event.movementY,
        x1: coords.current.x1 + event.movementX
      }
    } else if (isTopRightDragging.current) {
      coords.current = {
        ...coords.current,
        y1: coords.current.y1 + event.movementY,
        x2: coords.current.x2 + event.movementX
      }
    } else if (isBottomLeftDragging.current) {
      coords.current = {
        ...coords.current,
        y2: coords.current.y2 + event.movementY,
        x1: coords.current.x1 + event.movementX
      }
    } else if (isBottomRightDragging.current) {
      coords.current = {
        ...coords.current,
        y2: coords.current.y2 + event.movementY,
        x2: coords.current.x2 + event.movementX
      }
    }
  }

  function onMouseUp(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    isTopDragging.current = false;
    isLeftDragging.current = false;
    isBottomDragging.current = false;
    isRightDragging.current = false;
    isTopLeftDragging.current = false;
    isTopRightDragging.current = false;
    isBottomLeftDragging.current = false;
    isBottomRightDragging.current = false;

    if (!coords.current) return;
    coords.current = fixCoords(coords.current!);
  }

  // Final coords
  const style: { top?: number, left?: number, width?: number, height?: number } = useMemo(() => {
    if (!coords.current) return {};
    const c = fixCoords(coords.current!)
    if (onResize) onResize(c)
    return {
      top: c.y1,
      left: c.x1,
      height: c.y2 - c.y1,
      width: c.x2 - c.x1,
    };
  }, [ coords.current ])

  function fixCoords(coords: Coords): Coords {
    let c = { ...coords };
    if (minX) c = { ...c, x1: Math.max(minX, c.x1), x2: Math.max(minX, c.x2) };
    if (maxX) c = { ...c, x1: Math.min(maxX, c.x1), x2: Math.min(maxX, c.x2) };
    if (minY) c = { ...c, y1: Math.max(minY, c.y1), y2: Math.max(minY, c.y2) };
    if (maxY) c = { ...c, y1: Math.min(maxY, c.y1), y2: Math.min(maxY, c.y2) };
    return {
      x1: Math.min(c.x1, c.x2),
      x2: Math.max(c.x1, c.x2),
      y1: Math.min(c.y1, c.y2),
      y2: Math.max(c.y1, c.y2),
    };
  }

  if (!coords.current) return <Fragment/>
  return <div className={ [ styles.resizable, className ].join(' ') }
              style={ style }>
    <div className={ styles.inner }>

      { children }

      { !disabled && <Fragment>

          <div className={ styles.top } onMouseDown={ onTopMouseDown }/>

          <div className={ styles.bottom } onMouseDown={ onBottomMouseDown }/>

          <div className={ styles.left } onMouseDown={ onLeftMouseDown }/>

          <div className={ styles.right } onMouseDown={ onRightMouseDown }/>

          <div className={ styles.topLeft } onMouseDown={ onTopLeftMouseDown }/>

          <div className={ styles.topRight } onMouseDown={ onTopRightMouseDown }/>

          <div className={ styles.bottomLeft } onMouseDown={ onBottomLeftMouseDown }/>

          <div className={ styles.bottomRight } onMouseDown={ onBottomRightMouseDown }/>

      </Fragment> }

    </div>
  </div>
}
