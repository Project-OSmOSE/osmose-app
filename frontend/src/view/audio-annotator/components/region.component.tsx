import React, { useMemo } from 'react'
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
  yAxis: ScaleMapping | null;
  xAxis: ScaleMapping | null;
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
  const dispatch = useAppDispatch()

  const left = useMemo(() => {
    return xAxis?.valueToPosition(Math.min(annotation.startTime, annotation.endTime)) ?? 0
  }, [xAxis, annotation.startTime, annotation.endTime]);
  const top = useMemo(() => {
    return yAxis?.valueToPosition(Math.max(annotation.startFrequency, annotation.endFrequency)) ?? 0
  }, [yAxis, annotation.startFrequency, annotation.endFrequency])
  const width = useMemo(() => {
    return xAxis?.valuesToPositionRange(annotation.startTime, annotation.endTime) ?? 0
  }, [xAxis, annotation.startTime, annotation.endTime])
  const height = useMemo(() => {
    return yAxis?.valuesToPositionRange(annotation.startFrequency, annotation.endFrequency) ?? 0
  }, [yAxis, annotation.startFrequency, annotation.endFrequency])
  const headerPositionIsTop = useMemo(() => top > HEADER_HEIGHT + HEADER_MARGIN, [top]);

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
           top: top - (headerPositionIsTop ? HEADER_HEIGHT - HEADER_MARGIN : 0),
           width,
           height: height + HEADER_HEIGHT + HEADER_MARGIN,
         } }>

      { !headerPositionIsTop && bodyRegion }

      <p className="d-flex region-header"
         style={ {
           borderColor: color,
           height: HEADER_HEIGHT,
           marginTop: (headerPositionIsTop ? 0 : HEADER_MARGIN),
           marginBottom: (headerPositionIsTop ? HEADER_MARGIN : 0),
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

      { headerPositionIsTop && bodyRegion }

    </div>
  );
}
