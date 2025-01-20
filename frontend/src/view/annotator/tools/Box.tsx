import React, { Fragment, MutableRefObject, useEffect, useMemo, useState } from 'react'
import { DEFAULT_COLOR } from "@/consts/colors.const.tsx";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { useAudioService } from "@/services/annotator/audio.service.ts";
import { AnnotationResult } from '@/service/campaign/result';
import { focusResult, getResultType, removeResult } from '@/service/annotator';
import { ScaleMapping } from '@/service/dataset/spectrogram-configuration/scale';
import { useParams } from "react-router-dom";
import styles from './annotator-tools.module.scss'
import { IoChatbubbleEllipses, IoChatbubbleOutline, IoPlayCircle, IoTrashBin } from "react-icons/io5";
import { useRetrieveCampaignQuery } from "@/service/campaign";

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
  const params = useParams<{ campaignID: string, fileID: string }>();
  const { data: campaign } = useRetrieveCampaignQuery(params.campaignID)

  const {
    labelColors,
    focusedResultID,
    userPreferences
  } = useAppSelector(state => state.annotator);
  const dispatch = useAppDispatch()

  const audioService = useAudioService(audioPlayer);

  const [ left, setLeft ] = useState<number>(0);
  const [ top, setTop ] = useState<number>(0);
  const [ width, setWidth ] = useState<number>(0);
  const [ height, setHeight ] = useState<number>(0);
  const [ headerIsOnTop, setHeaderIsOnTop ] = useState<boolean>(true);

  // Recalc time position
  useEffect(() => {
    if (annotation.start_time === null || annotation.end_time === null) return;
    setLeft(xAxis.current?.valueToPosition(Math.min(annotation.start_time, annotation.end_time)) ?? 0);
    setWidth(xAxis.current?.valuesToPositionRange(annotation.start_time, annotation.end_time) ?? 0);
  }, [ xAxis.current, annotation.start_time, annotation.end_time ])

  // Recalc frequency position
  useEffect(() => {
    if (annotation.start_frequency === null || annotation.end_frequency === null) return;
    const top = yAxis.current?.valueToPosition(Math.max(annotation.start_frequency, annotation.end_frequency)) ?? 0
    setTop(top);
    setHeight(yAxis.current?.valuesToPositionRange(annotation.start_frequency, annotation.end_frequency) ?? 0);
    setHeaderIsOnTop(top > HEADER_HEIGHT + HEADER_MARGIN)
  }, [ yAxis.current, annotation.start_frequency, annotation.end_frequency, userPreferences.spectrogramConfigurationID, ])

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
           } }>

        <IoPlayCircle className={ styles.button } onClick={ () => audioService.play(annotation) }/>

        <p onClick={ () => dispatch(focusResult(annotation.id)) }>
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
