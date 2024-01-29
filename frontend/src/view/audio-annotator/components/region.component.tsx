import React, { PointerEvent, RefObject } from 'react'

import { SPECTRO_CANVAS_HEIGHT } from "./workbench.component.tsx";
import { useAudioService } from "../../../services/annotator/audio";
import { Annotation } from "../../../interface/annotation.interface.tsx";
import { useAnnotatorService } from "../../../services/annotator/annotator.service.tsx";
import { DEFAULT_COLOR } from "../../../consts/colors.const.tsx";

// Component dimensions constants
const HEADER_HEIGHT: number = 18;
const HEADER_MARGIN: number = 3;

type RegionProps = {
  annotation: Annotation,
  timePxRatio: number,
  freqPxRatio: number,
  currentZoom: number,
  onAddAnotherAnnotation: (e: PointerEvent<HTMLElement>) => void,
  canvasWrapperRef: RefObject<HTMLDivElement>,
};


const Region: React.FC<RegionProps> = ({
                                         annotation,
                                         onAddAnotherAnnotation,
                                         canvasWrapperRef,
                                         freqPxRatio,
                                         timePxRatio,
                                         currentZoom,
                                       }) => {
  const { context, annotations } = useAnnotatorService();
  const service = useAudioService();

  const offsetLeft = annotation.startTime * timePxRatio;
  const freqOffset: number = (annotation.endFrequency - (context.task?.boundaries.startFrequency ?? 0)) * freqPxRatio;
  const offsetTop: number = SPECTRO_CANVAS_HEIGHT - freqOffset;

  const distanceToMarginLeft: number = (+(canvasWrapperRef.current?.style.width ?? 0) * currentZoom) - Math.floor(offsetLeft);

  const duration: number = annotation.endTime - annotation.startTime;
  const freqRange: number = annotation.endFrequency - annotation.startFrequency;

  const width: number = Math.floor(timePxRatio * duration);
  const height: number = Math.floor(freqPxRatio * freqRange) + HEADER_HEIGHT + HEADER_MARGIN;

  const headerPositionIsTop = offsetTop > HEADER_HEIGHT + HEADER_MARGIN;

  const color = context.tagColors.get(annotation.annotation) ?? DEFAULT_COLOR;
  const currentColor = annotation.id === context.annotations.focus?.id ? color : `${ color }88`;
  const styles = {
    header: {
      height: HEADER_HEIGHT,
      marginTop: (headerPositionIsTop ? 0 : HEADER_MARGIN),
      marginBottom: (headerPositionIsTop ? HEADER_MARGIN : 0),
      backgroundColor: currentColor,
      border: `2px solid ${ currentColor }`,
      marginLeft: distanceToMarginLeft > 150 ? '50%' : '-25%',
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
         style={ styles.body }
         onPointerDown={ onAddAnotherAnnotation }></div>
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
                onClick={ () => service.play(annotation) }></button>

        <span className="flex-fill text-center"
              onClick={ () => annotations.focus(annotation) }
              style={ styles.headerSpan }>
          { annotation.annotation }
        </span>

        { annotation.result_comments.length > 0 ?
          <i className="fas fa-comment mr-2"></i> :
          <i className="far fa-comment mr-2"></i> }

        <button className="btn-simple fa fa-times-circle"
                onClick={ () => annotations.remove(annotation) }></button>
      </p>

      { headerPositionIsTop && regionBody }

    </div>
  );
}

export default Region;
