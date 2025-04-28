import React, { Fragment, MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/service/app';
import { BoxResult } from '@/service/campaign/result';
import { updateFocusResultBounds } from '@/service/annotator';
import { ExtendedDiv } from '@/components/ui/ExtendedDiv';
import { useAxis } from '@/service/annotator/spectrogram/scale';
import { AbstractScale, formatTime } from "@/service/dataset/spectrogram-configuration/scale";
import { AnnotationHeader } from '@/view/annotator/tools/spectrogram/annotation/Headers.tsx';
import styles from './annotation.module.scss'
import { MOUSE_DOWN_EVENT } from "@/service/events";
import { usePagePhase } from "@/service/routing";
import { useRetrieveLabelSetQuery } from "@/service/campaign/label-set";

type RegionProps = {
  annotation: BoxResult,
  audioPlayer: MutableRefObject<HTMLAudioElement | null>;
};


export const Box: React.FC<RegionProps> = ({
                                             annotation,
                                             audioPlayer
                                           }) => {
  const phase = usePagePhase()
  // Data
  const { data: label_set } = useRetrieveLabelSetQuery();
  const { focusedResultID } = useAppSelector(state => state.annotator);
  const dispatch = useAppDispatch();

  // Scales
  const { xAxis, yAxis } = useAxis()
  const _xAxis = useRef<AbstractScale>(xAxis);
  const _yAxis = useRef<AbstractScale>(yAxis);
  useEffect(() => {
    _xAxis.current = xAxis;
  }, [ xAxis ]);
  useEffect(() => {
    _yAxis.current = yAxis;
  }, [ yAxis ]);

  // Annotation time/freq bounds
  const _start_time = useRef<number | null>(annotation.start_time);
  const _end_time = useRef<number | null>(annotation.end_time);
  const _start_frequency = useRef<number | null>(annotation.start_frequency);
  const _end_frequency = useRef<number | null>(annotation.end_frequency);
  useEffect(() => {
    _start_time.current = annotation.start_time;
    _end_time.current = annotation.end_time;
    _start_frequency.current = annotation.start_frequency;
    _end_frequency.current = annotation.end_frequency;
    if (annotation.updated_to.length > 0) {
      _start_time.current = annotation.updated_to[0].start_time;
      _end_time.current = annotation.updated_to[0].end_time;
      _start_frequency.current = annotation.updated_to[0].start_frequency;
      _end_frequency.current = annotation.updated_to[0].end_frequency;
    }
  }, [ annotation ]);

  // Coords bounds
  const _left = useRef<number>(0);
  const _width = useRef<number>(0);
  const _top = useRef<number>(0);
  const _height = useRef<number>(0);

  // State
  const [ left, setLeft ] = useState<number>(0);
  const [ width, setWidth ] = useState<number>(0);
  const [ top, setTop ] = useState<number>(0);
  const [ height, setHeight ] = useState<number>(0);
  const [ isMouseHover, setIsMouseHover ] = useState<boolean>(false);

  // Updates
  useEffect(() => {
    updateLeft()
    updateWidth()
    updateTop()
    updateHeight()
  }, []);
  useEffect(() => updateLeft, [ _xAxis.current, _start_time.current ]);
  useEffect(() => updateWidth, [ _xAxis.current, _start_time.current, _end_time.current ]);
  useEffect(() => updateTop, [ _yAxis.current, _end_frequency.current ]);
  useEffect(() => updateHeight, [ _yAxis.current, _start_frequency.current, _end_frequency.current ]);

  // Memo
  const colorClassName: string = useMemo(() => {
    if (!label_set) return '';
    let label = annotation.label
    if (annotation.updated_to.length > 0) label = annotation.updated_to[0].label;
    return `ion-color-${ label_set.labels.indexOf(label) % 10 }`
  }, [ label_set, annotation ]);
  const isActive = useMemo(() => annotation.id === focusedResultID, [ annotation.id, focusedResultID ]);

  function updateLeft() {
    if (_start_time.current === null) return;
    _left.current = _xAxis.current.valueToPosition(_start_time.current);
    setLeft(_left.current)
  }

  function updateTop() {
    if (_end_frequency.current === null) return;
    _top.current = _yAxis.current.valueToPosition(_end_frequency.current);
    setTop(_top.current)
  }

  function updateWidth() {
    if (_start_time.current === null || _end_time.current === null) return;
    _width.current = _xAxis.current.valuesToPositionRange(_start_time.current, _end_time.current);
    setWidth(_width.current)
  }

  function updateHeight() {
    if (_start_frequency.current === null || _end_frequency.current === null) return;
    _height.current = _yAxis.current.valuesToPositionRange(_start_frequency.current, _end_frequency.current);
    setHeight(_height.current)
  }

  function onTopMove(movement: number) {
    _top.current += movement;
    setTop(_top.current)
  }

  function onHeightMove(movement: number) {
    _height.current += movement;
    setHeight(_height.current)
  }

  function onLeftMove(movement: number) {
    _left.current += movement;
    setLeft(_left.current)
  }

  function onWidthMove(movement: number) {
    _width.current += movement;
    setWidth(_width.current)
  }

  function onValidateMove() {
    if (!phase) return;
    let end_frequency = _yAxis.current.positionToValue(_top.current);
    let start_frequency = _yAxis.current.positionToValue(_top.current + _height.current);
    let start_time = _xAxis.current.positionToValue(_left.current);
    let end_time = _xAxis.current.positionToValue(_left.current + _width.current);
    if (_start_time.current && formatTime(start_time, true) === formatTime(_start_time.current, true)) start_time = _start_time.current;
    if (_end_time.current && formatTime(end_time, true) === formatTime(_end_time.current, true)) end_time = _end_time.current;
    if (_start_frequency.current && _start_frequency.current.toFixed(2) === start_frequency.toFixed(2)) start_frequency = _start_frequency.current;
    if (_end_frequency.current && _end_frequency.current.toFixed(2) === end_frequency.toFixed(2)) end_frequency = _end_frequency.current;
    dispatch(updateFocusResultBounds({
      newBounds: { type: 'Box', end_frequency, start_frequency, start_time, end_time },
      phase: phase.phase
    }))
  }

  if (top === null || left === null || height === null || width === null) return <Fragment/>
  return <ExtendedDiv resizable={ isActive }
                      top={ top } height={ height }
                      left={ left } width={ width }
                      onUp={ onValidateMove }
                      onTopMove={ onTopMove } onHeightMove={ onHeightMove }
                      onLeftMove={ onLeftMove } onWidthMove={ onWidthMove }
                      onMouseEnter={ () => setIsMouseHover(true) }
                      onMouseMove={ () => setIsMouseHover(true) }
                      onMouseLeave={ () => setIsMouseHover(false) }
                      innerClassName={ styles.inner }
                      onInnerMouseDown={ MOUSE_DOWN_EVENT.emit.bind(MOUSE_DOWN_EVENT) }
                      className={ [ styles.annotation, colorClassName, isActive ? '' : styles.disabled ].join(' ') }>

    { (isMouseHover || isActive) &&
        <AnnotationHeader active={ isActive }
                          onTopMove={ onTopMove }
                          onLeftMove={ onLeftMove }
                          onValidateMove={ onValidateMove }
                          top={ top }
                          setIsMouseHover={ setIsMouseHover }
                          className={ colorClassName }
                          annotation={ annotation }
                          audioPlayer={ audioPlayer }/> }

  </ExtendedDiv>
}
