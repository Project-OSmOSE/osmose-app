import React, { Fragment, MutableRefObject, useEffect, useMemo, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/service/app';
import { useAudioService } from "@/services/annotator/audio.service.ts";
import { AnnotationResult } from '@/service/campaign/result';
import { focusResult, removeResult, updateFocusResultBounds } from '@/service/annotator';
import { ScaleMapping } from '@/service/dataset/spectrogram-configuration/scale';
import { IoChatbubbleEllipses, IoChatbubbleOutline, IoPlayCircle, IoTrashBin } from "react-icons/io5";
import { useAnnotator } from "@/service/annotator/hook.ts";
import styles from '../../annotator-tools.module.scss'
import { ExtendedDiv } from '@/components/ui/ExtendedDiv';

type RegionProps = {
  annotation: AnnotationResult,
  yAxis: MutableRefObject<ScaleMapping | null>;
  xAxis: MutableRefObject<ScaleMapping | null>;
  audioPlayer: MutableRefObject<HTMLAudioElement | null>;
};


export const Box: React.FC<RegionProps> = ({
                                             annotation,
                                             yAxis, xAxis,
                                             audioPlayer
                                           }) => {
  // Data
  const { label_set, campaign } = useAnnotator();
  const { focusedResultID } = useAppSelector(state => state.annotator);
  const dispatch = useAppDispatch();

  const left = useRef<number>(0);
  useEffect(() => {
    if (!xAxis.current || !annotation.start_time) return;
    left.current = xAxis.current.valueToPosition(annotation.start_time)
  }, [ xAxis.current, annotation.start_time ]);

  const width = useRef<number>(0);
  useEffect(() => {
    if (!xAxis.current || !annotation.start_time || !annotation.end_time) return;
    width.current = xAxis.current.valuesToPositionRange(annotation.start_time, annotation.end_time);
  }, [ xAxis.current, annotation.start_time, annotation.end_time ]);

  const top = useRef<number>(0);
  useEffect(() => {
    if (!yAxis.current || !annotation.end_frequency) return;
    top.current = yAxis.current.valueToPosition(annotation.end_frequency)
  }, [ yAxis.current, annotation.end_frequency ]);

  const height = useRef<number>(0);
  useEffect(() => {
    if (!yAxis.current || !annotation.start_frequency || !annotation.end_frequency) return;
    height.current = yAxis.current.valuesToPositionRange(annotation.start_frequency, annotation.end_frequency);
  }, [ yAxis.current, annotation.start_frequency, annotation.end_frequency ]);

  // Memo
  const colorClassName: string = useMemo(() => label_set ? `ion-color-${ label_set.labels.indexOf(annotation.label) }` : '', [ label_set, annotation.label ]);
  const isActive = useMemo(() => annotation.id === focusedResultID, [ annotation.id, focusedResultID ]);

  // Service
  const audioService = useAudioService(audioPlayer);

  function onTopMove(movement: number) {
    top.current += movement;
  }

  function onHeightMove(movement: number) {
    height.current += movement
  }

  function onLeftMove(movement: number) {
    left.current += movement;
  }

  function onWidthMove(movement: number) {
    width.current += movement;
  }

  function onValidateMove() {
    if (!xAxis.current || !yAxis.current) return;

    dispatch(updateFocusResultBounds({
      end_frequency: yAxis.current.positionToValue(top.current),
      start_frequency: yAxis.current.positionToValue(top.current + height.current),
      start_time: xAxis.current.positionToValue(left.current),
      end_time: xAxis.current.positionToValue(left.current + width.current),
    }))
  }

  console.log(campaign?.usage)
  if (!top || !left || !height || !width) return <Fragment/>
  return <ExtendedDiv resizable={ isActive }
                      top={ top.current } height={ height.current }
                      left={ left.current } width={ width.current }
                      onUp={ onValidateMove }
                      onTopMove={ onTopMove } onHeightMove={ onHeightMove }
                      onLeftMove={ onLeftMove } onWidthMove={ onWidthMove }
                      className={ [ colorClassName, isActive ? '' : 'disabled' ].join(' ') }>

    <ExtendedDiv draggable={ isActive }
                 onTopMove={ onTopMove } onLeftMove={ onLeftMove }
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
