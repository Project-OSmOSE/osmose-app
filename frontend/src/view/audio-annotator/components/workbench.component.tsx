import React, { useImperativeHandle, useRef } from 'react';
import { formatTimestamp } from "@/services/utils/format.tsx";
import { SpectrogramRender, SpectroRenderComponent } from "./spectro-render.component.tsx";
import { AudioPlayer } from "./audio-player.component.tsx";
import { useAppDispatch, useAppSelector } from "@/slices/app";
import { selectSpectro, zoom } from "@/slices/annotator/spectro.ts";
import { RetrieveSpectroURL } from "@/services/api/annotation-task-api.service.tsx";

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
    task
  } = useAppSelector(state => state.annotator.global);
  const {
    wholeFileBoundaries,
  } = useAppSelector(state => state.annotator.annotations);
  const {
    currentZoom,
    pointerPosition,
    selectedSpectroId
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
      if (!spectrogramRender.current) throw new Error('no renderer');
      return spectrogramRender.current.getCanvasData();
    }
  }), [spectrogramRender.current])

  const getScaleNameFor = (spectro: RetrieveSpectroURL) => {
    if (spectro.linear_frequency_scale) return spectro.linear_frequency_scale.name ?? 'Linear';
    if (spectro.multi_linear_frequency_scale) return spectro.multi_linear_frequency_scale.name ?? 'Multi-linear';
    return 'Default'
  }

  return (
    <div className="workbench rounded"
         style={ style.workbench }>
      <p className="workbench-controls">
        <select
          defaultValue={ selectedSpectroId }
          onChange={ e => dispatch(selectSpectro(+e.target.value)) }>
          { task.spectroUrls.map(spectro => (
            <option key={ spectro.id } value={ spectro.id }>
              nfft: { spectro.nfft } | winsize: { spectro.winsize } | overlap: { spectro.overlap } | scale: { getScaleNameFor(spectro) }
            </option>
          ))
          }
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
        Campaign: <strong>{ task.campaignName }</strong>
        <br/>
        File: <strong>{ task.audioUrl?.split('/').pop() ?? '' }</strong> -
        Sampling: <strong>{ task.audioRate ?? 0 } Hz</strong>
        <br/>
        Start date: <strong>{ new Date(wholeFileBoundaries.startTime).toUTCString() }</strong>
      </p>

      <SpectroRenderComponent audioPlayer={ audioPlayer } ref={ spectrogramRender }/>
    </div>
  );
})
