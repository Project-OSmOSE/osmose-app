import React, { RefObject, useContext } from 'react'
import { Annotation } from "../../../interface/annotation.interface.tsx";
import { DEFAULT_COLOR } from "../../../consts/colors.const.tsx";
import { AudioPlayer } from "./audio-player.component.tsx";
import { SPECTRO_HEIGHT } from "./spectro-render.component.tsx";
import {
  AnnotationsContext, AnnotationsContextDispatch,
} from "../../../services/annotator/annotations/annotations.context.tsx";
import { AnnotatorContext } from "../../../services/annotator/annotator.context.tsx";

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


const Region: React.FC<RegionProps> = ({
                                         annotation,
                                         // canvasWrapperRef,
                                         freqPxRatio,
                                         timePxRatio,
                                         audioPlayer,
                                       }) => {
  // const spectroContext = useContext(SpectroContext);

  const annotatorContext = useContext(AnnotatorContext);
  const resultContext = useContext(AnnotationsContext);
  const resultDispatch = useContext(AnnotationsContextDispatch);

  const offsetLeft = annotation.startTime * timePxRatio;
  const freqOffset: number = (annotation.endFrequency - (resultContext.wholeFileBoundaries.startFrequency ?? 0)) * freqPxRatio;
  const offsetTop: number = SPECTRO_HEIGHT - freqOffset;

  // const distanceToMarginLeft: number = (+(canvasWrapperRef.current?.style.width ?? 0) * spectroContext.currentZoom) - Math.floor(offsetLeft);

  const duration: number = annotation.endTime - annotation.startTime;
  const freqRange: number = annotation.endFrequency - annotation.startFrequency;

  const width: number = Math.floor(timePxRatio * duration);
  const height: number = Math.floor(freqPxRatio * freqRange) + HEADER_HEIGHT + HEADER_MARGIN;

  const headerPositionIsTop = offsetTop > HEADER_HEIGHT + HEADER_MARGIN;

  const color = resultContext.tagColors.get(annotation.annotation) ?? DEFAULT_COLOR;
  const isActive = annotation.id === resultContext.focusedResult?.id && annotation.newId === resultContext.focusedResult?.newId;
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

        <button className="btn-simple fa fa-play-circle"
                onClick={ () => audioPlayer?.play(annotation) }></button>

        <span className="flex-fill text-center"
              onClick={ () => resultDispatch!({ type: 'focusResult', result: annotation }) }
              style={ styles.headerSpan }>
          { annotation.annotation }
        </span>

        { annotation.result_comments.length > 0 ?
          <i className="fas fa-comment mr-2"></i> :
          <i className="far fa-comment mr-2"></i> }

        { annotatorContext.mode === 'Create' && <button className="btn-simple fa fa-times-circle"
                                                        onClick={ () => resultDispatch!({ type: 'removeResult', result: annotation }) }></button> }
      </p>

      { headerPositionIsTop && regionBody }

    </div>
  );
}

export default Region;
