import React, { RefObject } from 'react'
import { Annotation } from "@/types/annotations.ts";
import { DEFAULT_COLOR } from "@/consts/colors.const.tsx";
import { AudioPlayer } from "./audio-player.component.tsx";
import { SPECTRO_HEIGHT } from "./spectro-render.component.tsx";
import { useAppSelector, useAppDispatch } from "@/slices/app";
import { focusResult, removeResult } from "@/slices/annotator/annotations.ts";

// Component dimensions constants
const HEADER_HEIGHT: number = 18;
const HEADER_MARGIN: number = 3;

type RegionProps = {
  annotation: Annotation,
  timePxRatio: number,
  freqPxRatio: number,
  canvasWrapperRef: RefObject<HTMLDivElement>,
  audioPlayer: AudioPlayer | null;
};


export const Region: React.FC<RegionProps> = ({
                                                annotation,
                                                // canvasWrapperRef,
                                                freqPxRatio,
                                                timePxRatio,
                                                audioPlayer,
                                              }) => {

  const {
    mode,
  } = useAppSelector(state => state.annotator.global);
  const {
    wholeFileBoundaries,
    labelColors,
    focusedResult,
  } = useAppSelector(state => state.annotator.annotations);
  const dispatch = useAppDispatch()

  const offsetLeft = annotation.startTime * timePxRatio;
  const freqOffset: number = (annotation.endFrequency - (wholeFileBoundaries.startFrequency ?? 0)) * freqPxRatio;
  const offsetTop: number = SPECTRO_HEIGHT - freqOffset;

  // const distanceToMarginLeft: number = (+(canvasWrapperRef.current?.style.width ?? 0) * spectroContext.currentZoom) - Math.floor(offsetLeft);

  const duration: number = annotation.endTime - annotation.startTime;
  const freqRange: number = annotation.endFrequency - annotation.startFrequency;

  const width: number = Math.floor(timePxRatio * duration);
  const height: number = Math.floor(freqPxRatio * freqRange) + HEADER_HEIGHT + HEADER_MARGIN;

  const headerPositionIsTop = offsetTop > HEADER_HEIGHT + HEADER_MARGIN;

  const color = labelColors[annotation.label] ?? DEFAULT_COLOR;
  const isActive = annotation.id === focusedResult?.id && annotation.newId === focusedResult?.newId;
  const currentColor = isActive ? color : `${ color }88`;
  const styles = {
    header: {
      height: HEADER_HEIGHT,
      marginTop: (headerPositionIsTop ? 0 : HEADER_MARGIN),
      marginBottom: (headerPositionIsTop ? HEADER_MARGIN : 0),
      backgroundColor: currentColor,
      border: `2px solid ${ currentColor }`,
    },
    headerSpan: {
      height: `${ HEADER_HEIGHT }px`,
    },
    body: {
      border: `2px solid ${ currentColor }`,
      height: height - HEADER_HEIGHT - HEADER_MARGIN,
    },
  };

  const regionBody = (
    <div className="region-body"
         style={ styles.body }></div>
  )

  return (
    <div className="region"
         style={ {
           left: Math.floor(offsetLeft),
           top: Math.floor(offsetTop) - (headerPositionIsTop ? HEADER_HEIGHT : 0) - HEADER_MARGIN,
           width: width,
           height: height,
         } }>

      { !headerPositionIsTop && regionBody }

      <p className="d-flex region-header"
         style={ styles.header }>

        <button className="btn-simple fa fa-play-circle text-white"
                onClick={ () => audioPlayer?.play(annotation) }></button>

        <span className="flex-fill text-center"
              onClick={ () => dispatch(focusResult(annotation)) }
              style={ styles.headerSpan }>
          { annotation.label }
        </span>

        { annotation.result_comments.length > 0 ?
          <i className="fas fa-comment mr-2"></i> :
          <i className="far fa-comment mr-2"></i> }

        { mode === 'Create' && <button className="btn-simple fa fa-times-circle text-white"
                                       onClick={ () => dispatch(removeResult(annotation)) }></button> }
      </p>

      { headerPositionIsTop && regionBody }

    </div>
  );
}
