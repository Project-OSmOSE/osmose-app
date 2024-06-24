import { formatTimestamp } from "@/services/utils/format.tsx";
import React, { useImperativeHandle, useRef } from 'react';
import { SpectrogramRender, SpectroRenderComponent } from "./spectro-render.component.tsx";
import { AudioPlayer } from "./audio-player.component.tsx";
import { useAppSelector, useAppDispatch } from "@/slices/app";
import { updateParams, zoom } from "@/slices/annotator/spectro.ts";

// Component dimensions constants
export const SPECTRO_CANVAS_HEIGHT: number = 512;
const SPECTRO_CANVAS_WIDTH: number = 1813;
const CONTROLS_AREA_SIZE: number = 80;
const TIME_AXIS_SIZE: number = 30;
const FREQ_AXIS_SIZE: number = 35;
const SCROLLBAR_RESERVED: number = 20;

type Props = {
  audioPlayer: AudioPlayer | null;
};

export const Workbench = React.forwardRef<SpectrogramRender, Props>(({ audioPlayer, }, ref) => {

  const {
    audioURL,
    audioRate,
  } = useAppSelector(state => state.annotator.global);
  const {
    wholeFileBoundaries,
  } = useAppSelector(state => state.annotator.annotations);
  const {
    currentParams,
    availableParams,
    currentZoom,
    pointerPosition
  } = useAppSelector(state => state.annotator.spectro);
  const dispatch = useAppDispatch()

  const style = {
    workbench: {
      height: `${ CONTROLS_AREA_SIZE + SPECTRO_CANVAS_HEIGHT + TIME_AXIS_SIZE + SCROLLBAR_RESERVED }px`,
      width: `${ FREQ_AXIS_SIZE + SPECTRO_CANVAS_WIDTH }px`,
    },
  };

  const spectrogramRender = useRef<SpectrogramRender | null>(null);
  useImperativeHandle(ref, () => ({
    getCanvasData: async () => {
      console.debug('[getCanvasData - workbench] init')
      if (!spectrogramRender.current) throw new Error('no renderer');
      return spectrogramRender.current.getCanvasData();
    }
  }))

  return (
    <div className="workbench rounded"
         style={ style.workbench }>
      <p className="workbench-controls">
        <select
          defaultValue={ currentParams ? availableParams.indexOf(currentParams) : 0 }
          onChange={ e => dispatch(updateParams({ ...availableParams[+e.target.value], zoom: 1 })) }>
          { availableParams.map((params, idx) => {
            return (
              <option key={ `params-${ idx }` } value={ idx }>
                { `nfft: ${ params.nfft } / winsize: ${ params.winsize } / overlap: ${ params.overlap }` }
              </option>
            );
          }) }
        </select>
        <button className="btn-simple fa fa-search-plus"
                onClick={ () => dispatch(zoom({ direction: 'in' })) }></button>
        <button className="btn-simple fa fa-search-minus"
                onClick={ () => dispatch(zoom({ direction: 'out' })) }></button>
        <span>{ currentZoom }x</span>
      </p>

      { pointerPosition && <p className="workbench-pointer">
        { pointerPosition.frequency.toFixed(2) }Hz / { formatTimestamp(pointerPosition.time, false) }
      </p> }

      <p className="workbench-info workbench-info--intro">
        File : <strong>{ audioURL?.split('/').pop() ?? '' }</strong> - Sampling
        : <strong>{ audioRate ?? 0 } Hz</strong><br/>
        Start date : <strong>{ new Date(wholeFileBoundaries.startTime).toUTCString() }</strong>
      </p>

      <SpectroRenderComponent audioPlayer={ audioPlayer } ref={ spectrogramRender }/>
    </div>
  );
})
