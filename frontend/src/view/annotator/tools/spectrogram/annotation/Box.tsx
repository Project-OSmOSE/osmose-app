import React, { Fragment, MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/service/app';
import { useAudioService } from "@/services/annotator/audio.service.ts";
import { AnnotationResult } from '@/service/campaign/result';
import { focusResult, removeResult, updateFocusResultBounds } from '@/service/annotator';
import { IoChatbubbleEllipses, IoChatbubbleOutline, IoPlayCircle, IoTrashBin } from "react-icons/io5";
import { useAnnotator } from "@/service/annotator/hook.ts";
import styles from '../../annotator-tools.module.scss'
import { ExtendedDiv } from '@/components/ui/ExtendedDiv';
import { useAxis } from '@/service/annotator/spectrogram/scale';

type RegionProps = {
  annotation: AnnotationResult,
  audioPlayer: MutableRefObject<HTMLAudioElement | null>;
};


export const Box: React.FC<RegionProps> = ({
                                             annotation,
                                             audioPlayer
                                           }) => {
  // Data
  const { label_set, campaign } = useAnnotator();
  const { focusedResultID } = useAppSelector(state => state.annotator);
  const dispatch = useAppDispatch();

  // Scales
  const { xAxis, yAxis } = useAxis()

  // State
  const [ left, setLeft ] = useState<number>(0);
  useEffect(() => {
    if (!annotation.start_time) return;
    const left = xAxis.valueToPosition(annotation.start_time);
    setLeft(left);
    _left.current = left;
  }, [ xAxis, annotation.start_time ]);

  const [ width, setWidth ] = useState<number>(0);
  useEffect(() => {
    if (!annotation.start_time || !annotation.end_time) return;
    const width = xAxis.valuesToPositionRange(annotation.start_time, annotation.end_time);
    setWidth(width);
    _width.current = width;
  }, [ xAxis, annotation.start_time, annotation.end_time ]);

  const [ top, setTop ] = useState<number>(0);
  useEffect(() => {
    if (!annotation.end_frequency) return;
    const top = yAxis.valueToPosition(annotation.end_frequency);
    setTop(top);
    _top.current = top;
  }, [ yAxis, annotation.end_frequency ]);

  const [ height, setHeight ] = useState<number>(0);
  useEffect(() => {
    if (!annotation.start_frequency || !annotation.end_frequency) return;
    const height = yAxis.valuesToPositionRange(annotation.start_frequency, annotation.end_frequency);
    setHeight(height);
    _height.current = height;
  }, [ yAxis, annotation.start_frequency, annotation.end_frequency ]);

  // Ref
  const _left = useRef<number>(left);
  const _width = useRef<number>(width);
  const _top = useRef<number>(top);
  const _height = useRef<number>(height);

  // Memo
  const colorClassName: string = useMemo(() => label_set ? `ion-color-${ label_set.labels.indexOf(annotation.label) }` : '', [ label_set, annotation.label ]);
  const isActive = useMemo(() => annotation.id === focusedResultID, [ annotation.id, focusedResultID ]);

  // Service
  const audioService = useAudioService(audioPlayer);

  function onTopMove(movement: number) {
    setTop(prev => {
      _top.current = prev + movement;
      return prev + movement
    });
  }

  function onHeightMove(movement: number) {
    setHeight(prev => {
      _height.current = prev + movement;
      return prev + movement
    });
  }

  function onLeftMove(movement: number) {
    setLeft(prev => {
      _left.current = prev + movement;
      return prev + movement;
    });
  }

  function onWidthMove(movement: number) {
    setWidth(prev => {
      _width.current = prev + movement;
      return prev + movement;
    });
  }

  function onValidateMove() {
    console.log(_top.current, top, yAxis.positionToValue(_top.current))
    dispatch(updateFocusResultBounds({
      end_frequency: yAxis.positionToValue(_top.current),
      start_frequency: yAxis.positionToValue(_top.current + _height.current),
      start_time: xAxis.positionToValue(_left.current),
      end_time: xAxis.positionToValue(_left.current + _width.current),
    }))
  }

  if (!top || !left || !height || !width) return <Fragment/>
  return <ExtendedDiv resizable={ isActive }
                      top={ top } height={ height }
                      left={ left } width={ width }
                      onUp={ onValidateMove }
                      onTopMove={ onTopMove } onHeightMove={ onHeightMove }
                      onLeftMove={ onLeftMove } onWidthMove={ onWidthMove }
                      className={ [ colorClassName, isActive ? '' : 'disabled' ].join(' ') }>

    <ExtendedDiv draggable={ isActive }
                 onTopMove={ onTopMove } onLeftMove={ onLeftMove }
                 onUp={ onValidateMove }
                 className={ [ styles.boxTitle, colorClassName, campaign?.usage === 'Create' ? styles.canBeRemoved : '' ].join(' ') }
                 innerClassName={ styles.inner }
                 onClick={ () => dispatch(focusResult(annotation.id)) }>

      <IoPlayCircle className={ styles.button } onClick={ () => audioService.play(annotation) }/>

      <p>{ annotation.label }</p>

      { annotation.comments.length > 0 ?
        <IoChatbubbleEllipses/> :
        <IoChatbubbleOutline className={ styles.outlineIcon }/> }

      { campaign?.usage === 'Create' && (
        <IoTrashBin className={ [ styles.button, styles.delete ].join(' ') }
                    onClick={ () => dispatch(removeResult(annotation.id)) }/>
      ) }

    </ExtendedDiv>

  </ExtendedDiv>
}
