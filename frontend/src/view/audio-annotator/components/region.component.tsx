import React, { MutableRefObject, useEffect, useMemo, useState } from 'react'
import { Annotation } from "@/types/annotations.ts";
import { DEFAULT_COLOR } from "@/consts/colors.const.tsx";
import { AudioPlayer } from "./audio-player.component.tsx";
import { useAppDispatch, useAppSelector } from "@/slices/app";
import { focusResult, removeResult } from "@/slices/annotator/annotations.ts";
import { ScaleMapping } from "@/services/spectrogram/scale/abstract.scale.ts";

// Component dimensions constants
const HEADER_HEIGHT: number = 18;
const HEADER_MARGIN: number = 3;

type RegionProps = {
  annotation: Annotation,
  audioPlayer: AudioPlayer | null;
  yAxis: MutableRefObject<ScaleMapping | null>;
  xAxis: MutableRefObject<ScaleMapping | null>;
};


export const Region: React.FC<RegionProps> = ({
                                                annotation,
                                                audioPlayer,
                                                yAxis, xAxis
                                              }) => {

  const {
    task,
  } = useAppSelector(state => state.annotator.global);
  const {
    labelColors,
    focusedResult,
  } = useAppSelector(state => state.annotator.annotations);
  const {
    selectedSpectroId
  } = useAppSelector(state => state.annotator.spectro);
  const dispatch = useAppDispatch()

  const [left, setLeft] = useState<number>(0);
  const [top, setTop] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [headerIsOnTop, setHeaderIsOnTop] = useState<boolean>(true);

  // Recalc time position
  useEffect(() => {
    setLeft(xAxis.current?.valueToPosition(Math.min(annotation.startTime, annotation.endTime)) ?? 0);
    setWidth(xAxis.current?.valuesToPositionRange(annotation.startTime, annotation.endTime) ?? 0);
  }, [xAxis.current, annotation.startTime, annotation.endTime])

  // Recalc frequency position
  useEffect(() => {
    const top =yAxis.current?.valueToPosition(Math.max(annotation.startFrequency, annotation.endFrequency)) ?? 0
    setTop(top);
    setHeight(yAxis.current?.valuesToPositionRange(annotation.startFrequency, annotation.endFrequency) ?? 0);
    setHeaderIsOnTop(top > HEADER_HEIGHT + HEADER_MARGIN)
  }, [yAxis.current, annotation.startFrequency, annotation.endFrequency, selectedSpectroId,])

  const color = useMemo(() => labelColors[annotation.label] ?? DEFAULT_COLOR, [labelColors, annotation.label])
  const isActive = useMemo(() => annotation.id === focusedResult?.id && annotation.newId === focusedResult?.newId, [annotation.id, focusedResult?.id, annotation.newId, focusedResult?.newId])


  const bodyRegion = useMemo(() => <div className="region-body"
                                        style={ {
                                          borderColor: color,
                                          height
                                        } }></div>, [color, height])

  return (
    <div className={ "region " + (isActive ? 'active' : '') }
         style={ {
           left,
           top: top - (headerIsOnTop ? (HEADER_HEIGHT + HEADER_MARGIN) : 0),
           width,
           height: height + HEADER_HEIGHT + HEADER_MARGIN,
         } }>

      { !headerIsOnTop && bodyRegion }

      <p className="d-flex region-header"
         style={ {
           borderColor: color,
           height: HEADER_HEIGHT,
           marginTop: (headerIsOnTop ? 0 : HEADER_MARGIN),
           marginBottom: (headerIsOnTop ? HEADER_MARGIN : 0),
           backgroundColor: color,
         } }>

        <button className="btn-simple fa fa-play-circle text-white"
                onClick={ () => audioPlayer?.play(annotation) }></button>

        <span className="flex-fill text-center"
              onClick={ () => dispatch(focusResult(annotation)) }
              style={ { height: HEADER_HEIGHT } }>
          { annotation.label }
        </span>

        { annotation.result_comments.length > 0 ?
          <i className="fas fa-comment mr-2"></i> :
          <i className="far fa-comment mr-2"></i> }

        { task.mode === 'Create' && <button className="btn-simple fa fa-times-circle text-white"
                                            onClick={ () => dispatch(removeResult(annotation)) }></button> }
      </p>

      { headerIsOnTop && bodyRegion }

    </div>
  );
}
