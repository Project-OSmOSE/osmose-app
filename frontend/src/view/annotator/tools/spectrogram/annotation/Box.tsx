import React, { Fragment, MutableRefObject, useEffect, useMemo, useState } from 'react'
import { DEFAULT_COLOR } from "@/consts/colors.const.tsx";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { useAudioService } from "@/services/annotator/audio.service.ts";
import { AnnotationResult } from '@/service/campaign/result';
import { focusResult, getResultType, removeResult, updateFocusResultBounds } from '@/service/annotator';
import { ScaleMapping } from '@/service/dataset/spectrogram-configuration/scale';
import { IoChatbubbleEllipses, IoChatbubbleOutline, IoPlayCircle, IoTrashBin } from "react-icons/io5";
import { useAnnotator } from "@/service/annotator/hook.ts";
import { useDraggable } from "@/service/ui";
import styles from '../../annotator-tools.module.scss'
import { SPECTRO_HEIGHT, SPECTRO_WIDTH } from "@/view/annotator/tools/spectrogram/SpectrogramRender.tsx";

// Component dimensions constants
const HEADER_HEIGHT: number = 18;
const HEADER_MARGIN: number = 3;

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
  const {
    campaign,
  } = useAnnotator();
  const {
    labelColors,
    focusedResultID,
    userPreferences
  } = useAppSelector(state => state.annotator);
  const dispatch = useAppDispatch()

  // Memo
  const minTimex = useMemo(() => {
    if (!annotation.start_time || !annotation.end_time) return 0;
    if (!xAxis.current) return 0;
    return xAxis.current.valueToPosition(Math.min(annotation.start_time, annotation.end_time))
  }, [xAxis.current]);
  const maxFrequencyY = useMemo(() => {
    if (!annotation.start_frequency || !annotation.end_frequency) return 0;
    if (!yAxis.current) return 0;
    return yAxis.current.valueToPosition(Math.max(annotation.start_frequency, annotation.end_frequency))
  }, [yAxis.current ])

  // Service
  const audioService = useAudioService(audioPlayer);
  const {
    onMouseDown,
    top: _top,
    left: _left,
  } = useDraggable({ top: maxFrequencyY, left: minTimex })

  const [ width, setWidth ] = useState<number>(0);
  const [ height, setHeight ] = useState<number>(0);

  // Avoid frame exit
  const top = useMemo(() => Math.min(_top, SPECTRO_HEIGHT - height), [_top])
  const left = useMemo(() => Math.min(_left, SPECTRO_WIDTH - width), [_left])

  // Recalc time position
  useEffect(() => {
    if (annotation.start_time === null || annotation.end_time === null) return;
    setWidth(xAxis.current?.valuesToPositionRange(annotation.start_time, annotation.end_time) ?? 0);
  }, [ xAxis.current, annotation.start_time, annotation.end_time ])

  // Recalc frequency position
  useEffect(() => {
    if (annotation.start_frequency === null || annotation.end_frequency === null) return;
    setHeight(yAxis.current?.valuesToPositionRange(annotation.start_frequency, annotation.end_frequency) ?? 0);
  }, [ yAxis.current, annotation.start_frequency, annotation.end_frequency, userPreferences.spectrogramConfigurationID, ])

  // Update box coords
  useEffect(() => {
    if (!yAxis.current || !xAxis.current) return;
    if (!width || !height) return;
    dispatch(updateFocusResultBounds({
      start_frequency: yAxis.current.positionToValue(top),
      end_frequency: yAxis.current.positionToValue(top + height),
      start_time: xAxis.current.positionToValue(left),
      end_time: xAxis.current.positionToValue(left + width),
    }))
  }, [top, left, width, height]);

  const headerIsOnTop = useMemo(() => top > HEADER_HEIGHT + HEADER_MARGIN, [ top ])

  const color = useMemo(() => labelColors[annotation.label] ?? DEFAULT_COLOR, [ labelColors, annotation.label ])
  const isActive = useMemo(() => annotation.id === focusedResultID, [ annotation.id, focusedResultID ])
  const type = useMemo(() => getResultType(annotation), [ annotation ]);


  const bodyRegion = useMemo(() => <div className={ styles.body }
                                        style={ {
                                          borderColor: color,
                                          height
                                        } }></div>, [ color, height ])

  if (type !== 'box') return <Fragment/>
  return (
    <div className={ [
      styles.box,
      isActive ? styles.active : '',
      campaign?.usage === 'Create' ? styles.canBeRemoved : ''
    ].join(' ') }
         style={ {
           left,
           top: top - (headerIsOnTop ? (HEADER_HEIGHT + HEADER_MARGIN) : 0),
           width,
           height: height + HEADER_HEIGHT + HEADER_MARGIN,
         } }>

      { !headerIsOnTop && bodyRegion }

      <div className={ styles.header }
           style={ {
             borderColor: color,
             height: HEADER_HEIGHT,
             marginTop: (headerIsOnTop ? 0 : HEADER_MARGIN),
             marginBottom: (headerIsOnTop ? HEADER_MARGIN : 0),
             backgroundColor: color,
           } }
           onClick={ () => dispatch(focusResult(annotation.id)) }
           onMouseDown={ isActive ? onMouseDown : undefined }>

        <IoPlayCircle className={ styles.button } onClick={ () => audioService.play(annotation) }/>

        <p>
          { annotation.label }
        </p>

        { annotation.comments.length > 0 ?
          <IoChatbubbleEllipses/> :
          <IoChatbubbleOutline className={ styles.outlineIcon }/> }

        <IoTrashBin className={ [ styles.button, styles.delete ].join(' ') }
                    onClick={ () => dispatch(removeResult(annotation.id)) }/>
      </div>

      { headerIsOnTop && bodyRegion }

    </div>
  );
}
