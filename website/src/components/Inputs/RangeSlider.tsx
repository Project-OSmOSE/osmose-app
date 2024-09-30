import React, { DragEvent, useEffect, useRef } from "react";
import styles from './RangeSlider.module.scss';

interface Props {
  min: number;
  max: number;
  setMin: (min: number) => void;
  setMax: (max: number) => void;
  children: React.ReactNode
}

export const RangeSlider: React.FC<Props> = ({ min, max, setMin, setMax, children }) => {
  const slide = useRef<HTMLDivElement | null>(null);

  const onMinDrag = (event: DragEvent<HTMLDivElement>) => {
    const map = slide.current?.parentElement?.parentElement?.parentElement?.parentElement;
    if (!slide.current || !map || !event.pageX) return;
    const thumb = event.target as HTMLDivElement;
    const slideInnerLeft = event.pageX - slide.current.offsetLeft - map.offsetLeft - thumb.offsetWidth;
    setMin(Math.min(max, keepInRange(100 * slideInnerLeft / slide.current.offsetWidth)));
  }

  const onMaxDrag = (event: DragEvent<HTMLDivElement>) => {
    const map = slide.current?.parentElement?.parentElement?.parentElement?.parentElement;
    if (!slide.current || !map || !event.pageX) return;
    const thumb = event.target as HTMLDivElement;
    const slideInnerLeft = event.pageX - slide.current.offsetLeft - map.offsetLeft - thumb.offsetWidth;
    setMax(Math.max(min, keepInRange(100 * slideInnerLeft / slide.current.offsetWidth)));
  }

  const keepInRange = (value: number): number => Math.min(100, Math.max(0, value));

  return <div className={ styles.slider }>
    <div ref={ slide } className={ styles.slide }>
      <div className={ styles.selected }
           style={ {
             left: `${ min }%`,
             right: `${ 100 - max }%`
           } }/>
      <div className={ styles.thumb }
           style={ {
             left: `${ min }%`,
           } }
           onDrag={ onMinDrag }/>
      <div className={ styles.thumb }
           style={ {
             left: `${ max }%`,
           } }
           onDrag={ onMaxDrag }/>
    </div>
    <div className={ styles.content }>
      { children }
    </div>
  </div>
}