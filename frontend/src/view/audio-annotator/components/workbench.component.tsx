import React, { useEffect } from 'react';

import { useAnnotatorService } from "../../../services/annotator/annotator.service.tsx";

import { formatTimestamp } from "../../../services/annotator/format/format.util.tsx";
import { Annotation } from "../../../interface/annotation.interface.tsx";
import { SpectroRenderComponent } from "./spectro-render.component.tsx";
import { AudioPlayer } from "./audio-player.component.tsx";
import { useSpectroContext, useSpectroDispatch } from "../../../services/annotator/spectro/spectro.context.tsx";

// Component dimensions constants
export const SPECTRO_CANVAS_HEIGHT: number = 512;
const SPECTRO_CANVAS_WIDTH: number = 1813;
const CONTROLS_AREA_SIZE: number = 80;
const TIME_AXIS_SIZE: number = 30;
const FREQ_AXIS_SIZE: number = 35;
const SCROLLBAR_RESERVED: number = 20;

type Props = {
  onAnnotationCreated: (a: Annotation) => void,
  audioPlayer: AudioPlayer | null;
};

const Workbench: React.FC<Props> = ({
                                               onAnnotationCreated,
                                               audioPlayer,
                                             }) => {
  const spectroContext = useSpectroContext();
  const spectroDispatch = useSpectroDispatch();

  const { context } = useAnnotatorService();

  useEffect(() => { // buildSpectrogramsDetails
    if (!context.task) return;
    spectroDispatch!({ type: 'init', task: context.task, zoom: 1 })
  }, [context.task]);

  const style = {
    workbench: {
      height: `${ CONTROLS_AREA_SIZE + SPECTRO_CANVAS_HEIGHT + TIME_AXIS_SIZE + SCROLLBAR_RESERVED }px`,
      width: `${ FREQ_AXIS_SIZE + SPECTRO_CANVAS_WIDTH }px`,
    },
  };

  return (
    <div className="workbench rounded"
         style={ style.workbench }>
      <p className="workbench-controls">
        <select
          defaultValue={ spectroContext.currentParams ? spectroContext.availableParams.indexOf(spectroContext.currentParams) : 0 }
          onChange={ e => spectroDispatch!({
            type: 'updateParams',
            params: spectroContext.availableParams[+e.target.value],
            zoom: 1
          }) }>
          { spectroContext.availableParams.map((params, idx) => {
            return (
              <option key={ `params-${ idx }` } value={ idx }>
                { `nfft: ${ params.nfft } / winsize: ${ params.winsize } / overlap: ${ params.overlap }` }
              </option>
            );
          }) }
        </select>
        <button className="btn-simple fa fa-search-plus"
                onClick={ () => spectroDispatch!({ type: 'zoom', direction: 'in' }) }></button>
        <button className="btn-simple fa fa-search-minus"
                onClick={ () => spectroDispatch!({ type: 'zoom', direction: 'out' }) }></button>
        <span>{ spectroContext.currentZoom }x</span>
      </p>

      { spectroContext.pointerPosition && <p className="workbench-pointer">
        { spectroContext.pointerPosition.frequency }Hz / { formatTimestamp(spectroContext.pointerPosition.time, false) }
      </p> }

      <p className="workbench-info workbench-info--intro">
        File : <strong>{ context.task?.audioUrl.split('/').pop() ?? '' }</strong> - Sampling
        : <strong>{ context.task?.audioRate } Hz</strong><br/>
        Start date : <strong>{ context.task?.boundaries.startTime.toUTCString() }</strong>
      </p>

      <SpectroRenderComponent onAnnotationCreated={ onAnnotationCreated }
                              audioPlayer={ audioPlayer }/>
    </div>
  );
}

export default Workbench;
