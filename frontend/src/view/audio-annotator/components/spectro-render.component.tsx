import React, {
  Fragment,
  MutableRefObject,
  PointerEvent,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  WheelEvent
} from "react";
import { Region } from "./region.component.tsx";
import { useAppDispatch, useAppSelector } from "@/slices/app";
import { ScaleMapping } from "@/services/spectrogram/scale/abstract.scale.ts";
import { useAudioService } from "@/services/annotator/audio.service.ts";
import { AnnotationResult, AnnotationResultBounds } from "@/services/api";
import { XAxis } from "@/view/audio-annotator/components/spectrogram/x-axis.component.tsx";
import { YAxis } from "@/view/audio-annotator/components/spectrogram/y-axis.component.tsx";
import { useSpectrogramService } from "@/services/annotator/spectrogram.service.ts";
import { getFileDuration } from "@/services/utils/annotator.ts";
import { SpectrogramActions } from "@/slices/annotator/spectro.ts";
import { usePointerService } from "@/services/annotator/pointer.service.ts";
import { AnnotatorActions } from "@/slices/annotator/global-annotator.ts";
import { AnnotationActions } from "@/slices/annotator/annotations.ts";

export const SPECTRO_HEIGHT: number = 512;
export const SPECTRO_WIDTH: number = 1813;
export const Y_WIDTH: number = 35;
export const X_HEIGHT: number = 30;
export const SCROLLBAR_RESERVED: number = 20;
export const CONTROLS_AREA_SIZE: number = 80;

interface Props {
  audioPlayer: MutableRefObject<HTMLAudioElement | null>;
}

export interface SpectrogramRender {
  getCanvasData: () => Promise<string>;
}

export const SpectroRenderComponent = React.forwardRef<SpectrogramRender, Props>(({ audioPlayer, }, ref) => {

  // Data
  const {
    focusedLabel,
    results,
  } = useAppSelector(state => state.annotator.annotations);
  const {
    time,
  } = useAppSelector(state => state.annotator.audio);
  const {
    campaign,
    file,
  } = useAppSelector(state => state.annotator.global);
  const {
    currentZoom,
    currentZoomOrigin,
    configurations,
    selectedID
  } = useAppSelector(state => state.annotator.spectro);
  const dispatch = useAppDispatch()
  const duration = useMemo(() => getFileDuration(file), [ file ])

  // Ref
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const xAxis = useRef<ScaleMapping | null>(null);
  const yAxis = useRef<ScaleMapping | null>(null);

  // Services
  const audioService = useAudioService(audioPlayer);
  const spectrogramService = useSpectrogramService(canvasRef, xAxis, yAxis)
  const pointerService = usePointerService(canvasRef, xAxis, yAxis);

  const [ _zoom, _setZoom ] = useState<number>(1);
  const currentTime = useRef<number>(0)
  const [ newResult, setNewResult ] = useState<AnnotationResultBounds | undefined>(undefined);
  const _newResult = useRef<AnnotationResultBounds | undefined>(undefined);
  useEffect(() => {
    setNewResult(_newResult.current)
  }, [ _newResult.current ]);


  // Is drawing enabled? (always in box mode, when a label is selected in presence mode)
  const isDrawingEnabled = useMemo(() => campaign?.usage === 'Create' && !!focusedLabel, [ focusedLabel, campaign?.usage ]);
  const _isDrawingEnabled = useRef<boolean>(isDrawingEnabled)
  useEffect(() => {
    _isDrawingEnabled.current = isDrawingEnabled
  }, [ isDrawingEnabled ]);

  const timeWidth = useMemo(() => SPECTRO_WIDTH * currentZoom, [ currentZoom ]);
  const currentConfiguration = useMemo(() => configurations.find(c => c.id === selectedID), [ configurations, selectedID ]);

  useEffect(() => {
    updateCanvas()
  }, [ configurations, selectedID ])


  // On zoom updated
  useEffect(() => {
    const canvas = canvasRef.current;
    const timeAxis = xAxis.current;
    const wrapper = containerRef.current;
    if (!canvas || !timeAxis || !wrapper) return;

    // If zoom factor has changed
    if (currentZoom === _zoom) return;
    // New timePxRatio
    const newTimePxRatio: number = SPECTRO_WIDTH * currentZoom / duration;

    // Resize canvases and scroll
    canvas.width = SPECTRO_WIDTH * currentZoom;

    // Compute new center (before resizing)
    let newCenter: number;
    if (currentZoomOrigin) {
      // x-coordinate has been given, center on it
      const bounds = canvas.getBoundingClientRect();
      newCenter = (currentZoomOrigin.x - bounds.left) * currentZoom / _zoom;
    } else {
      // If no x-coordinate: center on currentTime
      newCenter = currentTime.current * newTimePxRatio;
    }
    wrapper.scrollLeft = Math.floor(newCenter - SPECTRO_WIDTH / 2);
    _setZoom(currentZoom);
    updateCanvas()
  }, [ currentZoom ]);

  // On current params loaded/changed

  // On current audio time changed
  useEffect(() => {
    // Scroll if progress bar reach the right edge of the screen
    const wrapper = containerRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const oldX: number = Math.floor(canvas.width * currentTime.current / duration);
    const newX: number = Math.floor(canvas.width * time / duration);

    if ((oldX - wrapper.scrollLeft) < SPECTRO_WIDTH && (newX - wrapper.scrollLeft) >= SPECTRO_WIDTH) {
      wrapper.scrollLeft += SPECTRO_WIDTH;
    }
    currentTime.current = time;

    updateCanvas();
  }, [ time ])

  // On current newAnnotation changed
  useEffect(() => {
    updateCanvas();
  }, [ newResult?.end_time, newResult?.end_frequency, newResult ])

  useImperativeHandle(ref, () => ({
    getCanvasData: async () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Cannot get fake canvas 2D context');

      // Get spectro images
      await updateCanvas(false)
      const spectroDataURL = canvasRef.current?.toDataURL('image/png');
      if (!spectroDataURL) throw new Error('Cannot recover spectro dataURL');
      updateCanvas();
      const spectroImg = new Image();

      // Get frequency scale
      const freqDataURL = yAxis.current?.canvas?.toDataURL('image/png');
      if (!freqDataURL) throw new Error('Cannot recover frequency dataURL');
      const freqImg = new Image();

      // Get time scale
      const timeDataURL = xAxis.current?.canvas?.toDataURL('image/png');
      if (!timeDataURL) throw new Error('Cannot recover time dataURL');
      const timeImg = new Image();

      // Compute global canvas
      /// Load images
      await new Promise((resolve, reject) => {
        let isSpectroLoaded = false;
        let isFreqLoaded = false;
        let isTimeLoaded = false;
        spectroImg.onerror = e => reject(e)
        freqImg.onerror = e => reject(e)
        timeImg.onerror = e => reject(e)

        spectroImg.onload = () => {
          isSpectroLoaded = true;
          if (isFreqLoaded && isTimeLoaded) resolve(true);
        }
        freqImg.onload = () => {
          isFreqLoaded = true;
          if (isSpectroLoaded && isTimeLoaded) resolve(true);
        }
        timeImg.onload = () => {
          isTimeLoaded = true;
          if (isSpectroLoaded && isFreqLoaded) resolve(true);
        }

        spectroImg.src = spectroDataURL;
        freqImg.src = freqDataURL;
        timeImg.src = timeDataURL;
      });
      canvas.height = timeImg.height + spectroImg.height;
      canvas.width = freqImg.width + spectroImg.width;

      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height)

      context.drawImage(spectroImg, Y_WIDTH, 0, spectroImg.width, spectroImg.height);
      context.drawImage(freqImg, 0, 0, freqImg.width, freqImg.height);
      context.drawImage(timeImg, Y_WIDTH, SPECTRO_HEIGHT, timeImg.width, timeImg.height);

      return canvas.toDataURL('image/png')
    }
  }), [ canvasRef.current, xAxis.current, yAxis.current ])

  useEffect(() => {
    document.addEventListener('mousedown', e => onStartNewAnnotation(e as any))
    document.addEventListener('mousemove', e => onUpdateNewAnnotation(e as any))
    document.addEventListener('mouseup', e => onEndNewAnnotation(e as any))
  }, []);


  const updateCanvas = async (withProgressBar: boolean = true): Promise<void> => {
    spectrogramService.resetCanvas();
    await spectrogramService.drawSpectrogram();

    if (withProgressBar) spectrogramService.drawProgressBar()
    if (newResult) spectrogramService.drawResult(newResult);
  }


  const onUpdateNewAnnotation = (e: PointerEvent<HTMLDivElement>) => {
    const data = pointerService.getFreqTime(e);
    if (data) {
      dispatch(SpectrogramActions.updatePointerPosition(data))
      if (_newResult.current) {
        _newResult.current.end_time = data.time;
        _newResult.current.end_frequency = data.frequency;
      }
    } else dispatch(SpectrogramActions.leavePointer())
  }

  const onStartNewAnnotation = (e: PointerEvent<HTMLDivElement>) => {
    if (!_isDrawingEnabled.current) return;
    const data = pointerService.getFreqTime(e);
    console.log('start', e.clientX, e.clientY, JSON.stringify(data), JSON.stringify(canvasRef.current?.getBoundingClientRect()));
    if (!data) return;

    _newResult.current = {
      start_time: data.time,
      end_time: data.time,
      start_frequency: data.frequency,
      end_frequency: data.frequency,
    };
  }

  const onEndNewAnnotation = (e: PointerEvent<HTMLDivElement>) => {
    if (!yAxis.current || !xAxis.current) return;
    if (_newResult.current) {
      const data = pointerService.getFreqTime(e);
      console.log('end', e.clientX, e.clientY, JSON.stringify(data))
      if (data) {
        _newResult.current.end_time = data.time;
        _newResult.current.end_frequency = data.frequency;
      }
      if (_newResult.current.start_frequency === null || _newResult.current.end_frequency === null || _newResult.current.start_time === null || _newResult.current.end_time === null) return;
      const start_time = Math.min(_newResult.current.start_time, _newResult.current.end_time);
      const end_time = Math.max(_newResult.current.start_time, _newResult.current.end_time);
      const start_frequency = Math.min(_newResult.current.start_frequency, _newResult.current.end_frequency);
      const end_frequency = Math.max(_newResult.current.start_frequency, _newResult.current.end_frequency);
      _newResult.current.start_time = start_time;
      _newResult.current.end_time = end_time;
      _newResult.current.start_frequency = start_frequency;
      _newResult.current.end_frequency = end_frequency;

      const minFreq = Math.min(_newResult.current.start_frequency, _newResult.current.end_frequency);
      const maxFreq = Math.max(_newResult.current.start_frequency, _newResult.current.end_frequency);
      if (!yAxis.current.isRangeContinuouslyOnScale(minFreq, maxFreq)) {
        dispatch(AnnotatorActions.setDangerToast(`Be careful, your annotation overlaps a void in the frequency scale.
         Are you sure your annotation goes from ${ minFreq.toFixed(0) }Hz to ${ maxFreq.toFixed(0) }Hz?`))
      }
      const width = xAxis.current?.valuesToPositionRange(_newResult.current.start_time, _newResult.current.end_time);
      const height = yAxis.current?.valuesToPositionRange(_newResult.current.start_frequency, _newResult.current.end_frequency);
      if (width > 2 && height > 2) {
        dispatch(AnnotationActions.addResult(_newResult.current))
      }
    }
    _newResult.current = undefined;
  }

  const onWheel = (event: WheelEvent) => {
    // Prevent page scrolling
    event.stopPropagation(); // TODO: make it work!

    const origin = pointerService.getCoords(event);

    if (!origin) return;
    if (event.deltaY < 0) dispatch(SpectrogramActions.zoom({ direction: 'in', origin }))
    else if (event.deltaY > 0) dispatch(SpectrogramActions.zoom({ direction: 'out', origin }))
  }

  return (
    <Fragment>

      <YAxis width={ Y_WIDTH }
             height={ SPECTRO_HEIGHT }
             ref={ yAxis }
             linear_scale={ currentConfiguration?.linear_frequency_scale }
             multi_linear_scale={ currentConfiguration?.multi_linear_frequency_scale }
             max_value={ (file?.dataset_sr ?? 0) / 2 }
             style={ { position: 'absolute', top: `${ CONTROLS_AREA_SIZE }px` } }/>


      <div className="canvas-wrapper"
           ref={ containerRef }
        // onPointerDown={ onStartNewAnnotation }
        // onPointerMove={ onUpdateNewAnnotation }
           onPointerLeave={ () => dispatch(SpectrogramActions.leavePointer()) }
        // onPointerUp={ onEndNewAnnotation }
           style={ {
             width: `${ SPECTRO_WIDTH }px`,
             height: `${ SPECTRO_HEIGHT + X_HEIGHT + SCROLLBAR_RESERVED }px`,
             top: `${ CONTROLS_AREA_SIZE }px`,
           } }>

        <canvas className={ `canvas ${ isDrawingEnabled && 'drawable' }` }
                ref={ canvasRef }
                height={ SPECTRO_HEIGHT }
                width={ SPECTRO_WIDTH }
                onClick={ e => audioService.seek(pointerService.getFreqTime(e)?.time ?? 0) }
                onWheel={ onWheel }/>

        <XAxis width={ timeWidth }
               height={ X_HEIGHT }
               ref={ xAxis }
               max_value={ duration }
               style={ { position: 'absolute', top: `${ SPECTRO_HEIGHT }px` } }/>

        { results.map((annotation: AnnotationResult, key: number) => (
          <Region key={ key }
                  annotation={ annotation }
                  yAxis={ yAxis }
                  xAxis={ xAxis }
                  audioPlayer={ audioPlayer }/>
        )) }
      </div>
    </Fragment>)
})
