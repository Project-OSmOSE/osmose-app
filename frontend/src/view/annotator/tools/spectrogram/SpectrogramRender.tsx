import React, {
  MouseEvent,
  MutableRefObject,
  PointerEvent,
  UIEvent,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  WheelEvent
} from "react";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { useAudioService } from "@/service/ui/audio";
import { AnnotationResult, BoxBounds } from '@/service/types';
import { useToast } from "@/service/ui";
import styles from '../annotator-tools.module.scss'
import { YAxis } from "@/view/annotator/tools/spectrogram/YAxis.tsx";
import { AxisRef, XAxis } from "@/view/annotator/tools/spectrogram/XAxis.tsx";
import { AcousticFeatures } from "@/view/annotator/tools/bloc/AcousticFeatures.tsx";
import { MOUSE_DOWN_EVENT, MOUSE_MOVE_EVENT, MOUSE_UP_EVENT } from "@/service/events";
import { TimeBar } from "@/view/annotator/tools/spectrogram/TimeBar.tsx";
import { Annotation } from "@/view/annotator/tools/spectrogram/annotation/Annotation.tsx";
import { usePointerService } from '@/service/annotator/spectrogram/pointer';
import { useDisplaySpectrogram, useSpectrogramDimensions } from '@/service/annotator/spectrogram';
import { useAxis, Y_WIDTH } from '@/service/annotator/spectrogram/scale';
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useListSpectrogramForCurrentCampaign } from "@/service/api/spectrogram-configuration.ts";
import { useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";
import { useRetrieveAnnotator } from "@/service/api/annotator.ts";
import { AnnotatorSlice } from "@/service/slices/annotator.ts";

interface Props {
  audioPlayer: MutableRefObject<HTMLAudioElement | null>;
}

export interface SpectrogramRender {
  getCanvasData: () => Promise<string>;
  onResultSelected: (result: AnnotationResult) => void;
}

export const SpectrogramRender = React.forwardRef<SpectrogramRender, Props>(({ audioPlayer, }, ref) => {
  const { data } = useRetrieveAnnotator();
  const { campaign } = useRetrieveCurrentCampaign()
  const { phase } = useRetrieveCurrentPhase()
  const { configurations } = useListSpectrogramForCurrentCampaign();
  // Data
  const {
    focusedLabel,
    results,
    audio,
    userPreferences,
    ui,
    canAddAnnotations
  } = useAppSelector(state => state.annotator)
  const dispatch = useAppDispatch()
  const [ newResult, setNewResult ] = useState<BoxBounds | undefined>(undefined);
  const _newResult = useRef<BoxBounds | undefined>(undefined);
  useEffect(() => {
    setNewResult(_newResult.current)
  }, [ _newResult.current ]);

  // Ref
  const renderRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const yAxisCanvasRef = useRef<AxisRef | null>(null);
  const xAxisCanvasRef = useRef<AxisRef | null>(null);


  // Services
    const { containerWidth, height, width } = useSpectrogramDimensions()
  const { xAxis, yAxis } = useAxis()
  const { resetCanvas, drawSpectrogram, drawResult } = useDisplaySpectrogram(canvasRef);

  const audioService = useAudioService(audioPlayer);
  const pointerService = usePointerService();
  const toast = useToast();

  const [ _zoom, _setZoom ] = useState<number>(1);
  const currentTime = useRef<number>(0)


  // Is drawing enabled? (always in box mode, when a label is selected in presence mode)
  const isEditable: boolean = useMemo(() => !campaign?.archive && !phase?.ended_by && !!data?.is_assigned, [ campaign, phase, data ])
  const isDrawingEnabled = useMemo(() => !!canAddAnnotations && phase?.phase === 'Annotation' && !!focusedLabel && isEditable, [ canAddAnnotations, focusedLabel, phase, isEditable ]);
  const _isDrawingEnabled = useRef<boolean>(isDrawingEnabled)
  useEffect(() => {
    _isDrawingEnabled.current = isDrawingEnabled
  }, [ isDrawingEnabled ]);

  useEffect(() => {
    updateCanvas()
  }, [
    configurations,
    userPreferences.spectrogramConfigurationID,
    userPreferences.colormap,
    userPreferences.colormapInverted,
    userPreferences.brightness,
    userPreferences.contrast,
  ])


  // On zoom updated
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = containerRef.current;
    if (!canvas || !wrapper || !data) return;

    // If zoom factor has changed
    if (userPreferences.zoomLevel === _zoom) return;
    // New timePxRatio
    const newTimePxRatio: number = containerWidth * userPreferences.zoomLevel / data.file.duration;

    // Resize canvases and scroll
    canvas.width = containerWidth * userPreferences.zoomLevel;

    // Compute new center (before resizing)
    let newCenter: number;
    if (ui.zoomOrigin) {
      // x-coordinate has been given, center on it
      const bounds = canvas.getBoundingClientRect();
      newCenter = (ui.zoomOrigin.x - bounds.left) * userPreferences.zoomLevel / _zoom;
      const coords = {
        clientX: ui.zoomOrigin.x,
        clientY: ui.zoomOrigin.y
      }
      if (pointerService.isHoverCanvas(coords)) {
        const data = pointerService.getFreqTime(coords);
        if (data) dispatch(AnnotatorSlice.actions.setPointerPosition(data))
      }
    } else {
      // If no x-coordinate: center on currentTime
      newCenter = currentTime.current * newTimePxRatio;
    }
    wrapper.scrollLeft = Math.floor(newCenter - containerWidth / 2);
    _setZoom(userPreferences.zoomLevel);
    updateCanvas()
  }, [ userPreferences.zoomLevel ]);

  // On current params loaded/changed

  // On current audio time changed
  useEffect(() => {
    // Scroll if progress bar reach the right edge of the screen
    const wrapper = containerRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas || !data) return;
    const oldX: number = Math.floor(canvas.width * currentTime.current / data.file.duration);
    const newX: number = Math.floor(canvas.width * audio.time / data.file.duration);

    if ((oldX - wrapper.scrollLeft) < containerWidth && (newX - wrapper.scrollLeft) >= containerWidth) {
      wrapper.scrollLeft += containerWidth;
    }
    currentTime.current = audio.time;
  }, [ audio.time ])

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
      await updateCanvas()
      const spectroDataURL = canvasRef.current?.toDataURL('image/png');
      if (!spectroDataURL) throw new Error('Cannot recover spectro dataURL');
      updateCanvas();
      const spectroImg = new Image();

      // Get frequency scale
      if (!yAxisCanvasRef.current?.toDataURL) throw new Error('Cannot recover frequency dataURL');
      const freqDataURL = yAxisCanvasRef.current.toDataURL('image/png');
      if (!freqDataURL) throw new Error('Cannot recover frequency dataURL');
      const freqImg = new Image();

      // Get time scale
      if (!xAxisCanvasRef.current?.toDataURL) throw new Error('Cannot recover time dataURL');
      const timeDataURL = xAxisCanvasRef.current.toDataURL('image/png');
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
      context.drawImage(timeImg, Y_WIDTH, height, timeImg.width, timeImg.height);

      return canvas.toDataURL('image/png')
    },
    onResultSelected: (result: AnnotationResult) => {
      if (result.start_time === null) return;
      let time: number;
      if (result.end_time === null) time = result.start_time;
      else time = result.start_time! + Math.abs(result.end_time! - result.start_time!) / 2;
      const left = xAxis.valueToPosition(time) - containerWidth / 2;
      renderRef.current?.scrollTo({ left })
    }
  }), [ canvasRef.current, renderRef.current, width, xAxisCanvasRef.current, yAxisCanvasRef.current ])

  useEffect(() => {
    MOUSE_DOWN_EVENT.add(onStartNewAnnotation)
    MOUSE_MOVE_EVENT.add(onUpdateNewAnnotation)
    MOUSE_UP_EVENT.add(onEndNewAnnotation)

    return () => {
      MOUSE_DOWN_EVENT.remove(onStartNewAnnotation)
      MOUSE_MOVE_EVENT.remove(onUpdateNewAnnotation)
      MOUSE_UP_EVENT.remove(onEndNewAnnotation)
    }
  }, []);


  const updateCanvas = async (): Promise<void> => {
    resetCanvas();
    await drawSpectrogram();

    if (newResult) drawResult(newResult);
  }

  const onUpdateNewAnnotation = (e: PointerEvent<HTMLDivElement>) => {
    const isHover = pointerService.isHoverCanvas(e)
    const data = pointerService.getFreqTime(e);
    if (data) {
      if (isHover) dispatch(AnnotatorSlice.actions.setPointerPosition(data))
      if (_newResult.current) {
        _newResult.current.end_time = data.time;
        _newResult.current.end_frequency = data.frequency;
      }
    }
    if (!isHover || !data) dispatch(AnnotatorSlice.actions.leavePointerPosition())
  }

  const onStartNewAnnotation = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!_isDrawingEnabled.current) return;
    if (!pointerService.isHoverCanvas(e)) return;
    const data = pointerService.getFreqTime(e);
    if (!data) return;

    _newResult.current = {
      type: 'Box',
      start_time: data.time,
      end_time: data.time,
      start_frequency: data.frequency,
      end_frequency: data.frequency,
    };
  }

  const onEndNewAnnotation = (e: PointerEvent<HTMLDivElement>) => {
    if (_newResult.current) {
      const data = pointerService.getFreqTime(e);
      if (data) {
        _newResult.current.end_time = data.time;
        _newResult.current.end_frequency = data.frequency;
      }
      if (_newResult.current.type !== 'Box') return;
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
      if (!yAxis.isRangeContinuouslyOnScale(minFreq, maxFreq)) {
        toast.presentError(`Be careful, your annotation overlaps a void in the frequency scale.
         Are you sure your annotation goes from ${ minFreq.toFixed(0) }Hz to ${ maxFreq.toFixed(0) }Hz?`)
      }
      const width = xAxis.valuesToPositionRange(_newResult.current.start_time, _newResult.current.end_time);
      const height = yAxis.valuesToPositionRange(_newResult.current.start_frequency, _newResult.current.end_frequency);
      if (width > 2 && height > 2) {
        dispatch(AnnotatorSlice.actions.addResult(_newResult.current))
      } else if (campaign?.allow_point_annotation) {
        dispatch(AnnotatorSlice.actions.addResult({
          type: 'Point',
          start_time: _newResult.current.start_time,
          start_frequency: _newResult.current.start_frequency,
          end_time: null,
          end_frequency: null
        }))
      }
    }
    _newResult.current = undefined;
    if (!pointerService.isHoverCanvas(e)) dispatch(AnnotatorSlice.actions.leavePointerPosition())
  }

  function onClick(e: MouseEvent<HTMLCanvasElement>) {
    audioService.seek(pointerService.getFreqTime(e)?.time ?? 0)
  }

  const onWheel = (event: WheelEvent) => {
    // Disable zoom if the user wants horizontal scroll
    if (event.shiftKey) return;

    // Prevent page scrolling
    event.stopPropagation();

    const origin = pointerService.getCoords(event);

    if (!origin) return;
    if (event.deltaY < 0) dispatch(AnnotatorSlice.actions.zoom({ direction: 'in', origin }))
    else if (event.deltaY > 0) dispatch(AnnotatorSlice.actions.zoom({ direction: 'out', origin }))
  }

  const onContainerScrolled = (event: UIEvent<HTMLDivElement>) => {
    if (event.type !== 'scroll') return;
    const div = event.currentTarget;
    const left = div.scrollWidth - div.scrollLeft - div.clientWidth;
    if (left === 0) dispatch(AnnotatorSlice.actions.setFileIsSeen())
  }

  return (
    <div className={ styles.spectrogramRender }
         ref={ renderRef }
         onScroll={ onContainerScrolled }
         style={ { width: `${ Y_WIDTH + containerWidth }px` } }>

      <YAxis className={ styles.yAxis } ref={ yAxisCanvasRef }/>

      <div ref={ containerRef } onMouseDown={ e => e.stopPropagation() }
           className={ styles.spectrogram }
           onPointerLeave={ () => dispatch(AnnotatorSlice.actions.leavePointerPosition()) }>

        {/* 'drawable' class is for playwright tests */ }
        <canvas className={ isDrawingEnabled ? `drawable ${ styles.drawable }` : '' }
                ref={ canvasRef }
                height={ height }
                width={ width }
                onMouseDown={ onStartNewAnnotation }
                onClick={ onClick }
                onWheel={ onWheel }/>

        <TimeBar/>

        { results?.map((annotation: AnnotationResult, key: number) => (
          <Annotation key={ key } annotation={ annotation } audioPlayer={ audioPlayer }/>
        )) }
      </div>

      <XAxis className={ styles.xAxis } ref={ xAxisCanvasRef }/>

      <AcousticFeatures/>
    </div>)
})
