import React, {
  Fragment,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  WheelEvent
} from "react";
import { Annotation, AnnotationMode, AnnotationType } from "@/types/annotations.ts";
import { Region } from "./region.component.tsx";
import { formatTimestamp } from "@/services/utils/format.tsx";
import { AudioPlayer } from "./audio-player.component.tsx";
import { useAppSelector, useAppDispatch } from "@/slices/app";
import { setDangerToast } from "@/slices/annotator/global-annotator.ts";
import { addResult } from "@/slices/annotator/annotations.ts";
import { leavePointer, updatePointerPosition, zoom } from "@/slices/annotator/spectro.ts";
import { SpectrogramImage } from "@/types/spectro.ts";

export const SPECTRO_HEIGHT: number = 512;
export const SPECTRO_WIDTH: number = 1813;
export const Y_WIDTH: number = 35;
export const X_HEIGHT: number = 30;
export const SCROLLBAR_RESERVED: number = 20;
export const CONTROLS_AREA_SIZE: number = 80;

interface Props {
  audioPlayer: AudioPlayer | null;
}


class EditAnnotation {
  initTime: number;
  currentTime: number;
  initFrequency: number;
  currentFrequency: number;

  get startTime(): number {
    return Math.min(this.initTime, this.currentTime);
  }

  get endTime(): number {
    return Math.max(this.initTime, this.currentTime);
  }

  get startFrequency(): number {
    return Math.min(this.initFrequency, this.currentFrequency);
  }

  get endFrequency(): number {
    return Math.max(this.initFrequency, this.currentFrequency);
  }

  constructor(initTime: number, initFrequency: number) {
    this.initTime = initTime;
    this.initFrequency = initFrequency;
    this.currentTime = initTime;
    this.currentFrequency = initFrequency;
  }

  update(time: number, frequency: number): void {
    this.currentTime = time;
    this.currentFrequency = frequency;
  }

  copy(): EditAnnotation {
    const a = new EditAnnotation(this.initTime, this.initFrequency);
    a.update(this.currentTime, this.currentFrequency);
    return a;
  }
}

export const SpectroRenderComponent: React.FC<Props> = ({ audioPlayer, }) => {

  const {
    currentMode,
    focusedTag,
    wholeFileBoundaries,
    focusedConfidence,
    results,
  } = useAppSelector(state => state.annotator.annotations);
  const {
    time,
  } = useAppSelector(state => state.annotator.audio);
  const {
    currentZoom,
    currentZoomOrigin,
    currentImages
  } = useAppSelector(state => state.annotator.spectro);
  const dispatch = useAppDispatch()

  const [_zoom, _setZoom] = useState<number>(1);
  const [currenTime, setCurrenTime] = useState<number>(0);
  const [newAnnotation, setNewAnnotation] = useState<EditAnnotation | undefined>(undefined);
  const [images, setImages] = useState<Map<SpectrogramImage, HTMLImageElement>>(new Map());

  /**
   * Ref to canvas wrapper is used to modify its scrollLeft property.
   * @property { RefObject<HTMLDivElement>} wrapperRef React reference to the wrapper
   */
  const wrapperRef = useRef<HTMLDivElement>(null)

  /**
   * Ref to canvases are used to get their context.
   * @property { RefObject<HTMLCanvasElement>} spectroRef React reference to the canvas
   */
  const spectroRef = useRef<HTMLCanvasElement>(null);
  const yAxisRef = useRef<HTMLCanvasElement>(null);
  const xAxisRef = useRef<HTMLCanvasElement>(null);

  // Is drawing enabled? (always in box mode, when a tag is selected in presence mode)
  const isDrawingEnabled = useMemo(() => currentMode === AnnotationMode.boxes || (
    currentMode === AnnotationMode.wholeFile && !!focusedTag
  ), [focusedTag, currentMode]);

  const frequencyRange = useMemo(
    () => wholeFileBoundaries.endFrequency - wholeFileBoundaries.startFrequency,
    [wholeFileBoundaries.endFrequency, wholeFileBoundaries.startFrequency]
  );

  const timePixelRatio = useMemo(() => SPECTRO_WIDTH * currentZoom / wholeFileBoundaries.duration, [wholeFileBoundaries.duration, currentZoom]);
  const frequencyPixelRatio = useMemo(() => SPECTRO_HEIGHT / frequencyRange, [wholeFileBoundaries]);

  const isInCanvas = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = spectroRef.current?.getBoundingClientRect();
    if (!bounds) return false;
    if (event.clientX < bounds.x) return false;
    if (event.clientY < bounds.y) return false;
    if (event.clientX > bounds.x + bounds.width) return false;
    return event.clientY <= bounds.y + bounds.height;
  }

  // Component loads
  useEffect(() => {
    loadY();
    loadX();
  }, [])

  // On zoom updated
  useEffect(() => {
    const canvas = spectroRef.current;
    const timeAxis = xAxisRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !timeAxis || !wrapper) return;

    // If zoom factor has changed
    if (currentZoom === _zoom) return;
    // New timePxRatio
    const newTimePxRatio: number = SPECTRO_WIDTH * currentZoom / wholeFileBoundaries.duration;

    // Resize canvases and scroll
    canvas.width = SPECTRO_WIDTH * currentZoom;
    timeAxis.width = SPECTRO_WIDTH * currentZoom;

    // Compute new center (before resizing)
    let newCenter: number;
    if (currentZoomOrigin) {
      // x-coordinate has been given, center on it
      const bounds = canvas.getBoundingClientRect();
      newCenter = (currentZoomOrigin.x - bounds.left) * currentZoom / _zoom;
    } else {
      // If no x-coordinate: center on currentTime
      newCenter = time * newTimePxRatio;
    }
    wrapper.scrollLeft = Math.floor(newCenter - SPECTRO_WIDTH / 2);
    _setZoom(currentZoom);
  }, [currentZoom]);

  // On current params loaded/changed
  useEffect(() => {
    loadX();
    loadSpectro();
  }, [currentImages])

  // On current audio time changed
  useEffect(() => {
    loadSpectro();

    // Scroll if progress bar reach the right edge of the screen
    const wrapper = wrapperRef.current;
    const canvas = spectroRef.current;
    if (!wrapper || !canvas) return;
    const oldX: number = Math.floor(canvas.width * currenTime / wholeFileBoundaries.duration);
    const newX: number = Math.floor(canvas.width * time / wholeFileBoundaries.duration);

    if ((oldX - wrapper.scrollLeft) < SPECTRO_WIDTH && (newX - wrapper.scrollLeft) >= SPECTRO_WIDTH) {
      wrapper.scrollLeft += SPECTRO_WIDTH;
    }
    setCurrenTime(time);
  }, [time])

  // On current newAnnotation changed
  useEffect(() => {
    loadSpectro();
  }, [newAnnotation?.currentTime, newAnnotation?.currentFrequency])

  const getTimeFromClientX = (clientX: number): number => {
    const canvas = spectroRef.current;
    if (!canvas) return 0;
    const bounds = canvas.getBoundingClientRect();

    const pixel = Math.min(Math.max(clientX, bounds.left), bounds.right) - bounds.left;
    return pixel / timePixelRatio;
  }

  const getFrequencyFromClientY = (clientY: number): number => {
    const canvas = spectroRef.current;
    if (!canvas) return 0;
    const bounds = canvas.getBoundingClientRect();

    const pixel = Math.min(Math.max(clientY, bounds.top), bounds.bottom);
    return (wholeFileBoundaries.startFrequency + bounds.bottom - pixel) / frequencyPixelRatio;
  }

  const getXSteps = (duration: number) => {
    if (duration <= 60) return { step: 1, bigStep: 5 }
    else if (duration > 60 && duration <= 120) return { step: 2, bigStep: 5 }
    else if (duration > 120 && duration <= 500) return { step: 4, bigStep: 5 }
    else if (duration > 500 && duration <= 1000) return { step: 10, bigStep: 60 }
    else return { step: 30, bigStep: 120 }
  }

  const loadX = (): void => {
    const timeAxis = xAxisRef.current;
    const context = timeAxis?.getContext('2d');
    if (!timeAxis || !context) return;

    context.clearRect(0, 0, timeAxis.width, timeAxis.height);

    const durationOnScreen: number = SPECTRO_WIDTH / timePixelRatio;
    const steps = getXSteps(durationOnScreen);

    const bounds: DOMRect = timeAxis.getBoundingClientRect();
    const startTime: number = Math.ceil(getTimeFromClientX(bounds.left));
    const endTime: number = Math.floor(getTimeFromClientX(bounds.right));

    context.fillStyle = 'rgba(0, 0, 0)';
    context.font = '10px Arial';

    for (let i = startTime; i <= endTime; i++) {
      if (i % steps.step === 0) {
        const x: number = (i - startTime) * timePixelRatio;

        if (i % steps.bigStep === 0) {
          // Bar
          context.fillRect(x, 0, 2, 15);

          // Text
          const timeText: string = formatTimestamp(i, false);
          let xTxt: number = x;
          if (xTxt > 0) {
            // "Right align" all labels but first
            xTxt -= Math.round(timeText.length * 5);
          }
          context.fillText(timeText, xTxt, 25);
        } else {
          // Bar only
          context.fillRect(x, 0, 1, 10);
        }
      }
    }
  }

  const getYSteps = () => {
    if (frequencyRange <= 200) return { step: 5, bigStep: 20 }
    else if (frequencyRange > 200 && frequencyRange <= 500) return { step: 10, bigStep: 100 }
    else if (frequencyRange > 500 && frequencyRange <= 2000) return { step: 20, bigStep: 100 }
    else if (frequencyRange > 2000 && frequencyRange <= 20000) return { step: 500, bigStep: 2000 }
    else return { step: 2000, bigStep: 10000 }
  }

  const loadY = (): void => {
    const freqAxis = yAxisRef.current;
    const canvasContext = freqAxis?.getContext('2d');
    if (!freqAxis || !canvasContext) return;

    canvasContext.clearRect(0, 0, freqAxis.width, freqAxis.height);

    const bounds: DOMRect = freqAxis.getBoundingClientRect();
    const startFreq: number = Math.ceil(wholeFileBoundaries.startFrequency ?? 0);
    const endFreq: number = Math.floor((wholeFileBoundaries.startFrequency ?? 0) + frequencyRange);

    canvasContext.fillStyle = 'rgba(0, 0, 0)';
    canvasContext.font = '10px Arial';

    const steps = getYSteps();
    for (let i = startFreq; i <= endFreq; i += 5) {
      if (i % steps.step === 0) {
        const y: number = SPECTRO_HEIGHT - (i - startFreq) * frequencyPixelRatio - 2;

        if (i % steps.bigStep === 0) {
          // Bar
          canvasContext.fillRect(Y_WIDTH - 15, y, 15, 2);

          // Text
          let yTxt: number = y;
          if (yTxt < (bounds.height - 5)) {
            // "Top align" all labels but first
            yTxt += 12;
          }
          canvasContext.fillText(i.toString(), 0, yTxt);
        } else {
          // Bar only
          canvasContext.fillRect(Y_WIDTH - 10, y, 10, 1);
        }
      }
    }
  }

  const loadSpectroImages = (): Promise<void> => {
    if (!currentImages.length) throw 'no images to load';
    const promises = [];
    for (const data of currentImages) {
      if (images.get(data)) continue;
      const image = new Image();
      image.src = data.src;
      promises.push(new Promise<void>((resolve, reject) => {
        image.onload = () => {
          images.set(data, image);
          setImages(images)
          resolve();
        }
        image.onerror = e => {
          dispatch(setDangerToast(`Cannot load spectrogram image with source: ${ image.src }`))
          reject(e);
        }
      }))
    }
    return Promise.all(promises).then();
  }
  const loadSpectro = async (): Promise<void> => {
    const canvas = spectroRef.current;
    const canvasContext = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !canvasContext) return;

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    // Draw spectro images
    await loadSpectroImages();
    currentImages.forEach(spectro => canvasContext.drawImage(
      images.get(spectro)!,
      spectro.start * timePixelRatio,
      0,
      Math.floor((spectro.end - spectro.start) * timePixelRatio),
      canvas.height
    ));

    // Progress bar
    const newX: number = Math.floor(canvas.width * time / wholeFileBoundaries.duration);
    canvasContext.fillStyle = 'rgba(0, 0, 0)';
    canvasContext.fillRect(newX, 0, 1, canvas.height);

    // Render new annotation
    if (newAnnotation) {
      const a = newAnnotation;
      const x: number = Math.floor(a.startTime * timePixelRatio);
      const freqOffset: number = (a.startFrequency - (wholeFileBoundaries.startFrequency ?? 0)) * frequencyPixelRatio;
      const y: number = Math.floor(canvas.height - freqOffset);
      const width: number = Math.floor((a.endTime - a.startTime) * timePixelRatio);
      const height: number = -Math.floor((a.endFrequency - a.startFrequency) * frequencyPixelRatio);
      canvasContext.strokeStyle = 'blue';
      canvasContext.strokeRect(x, y, width, height);
    }
  }

  const onUpdateNewAnnotation = (e: PointerEvent<HTMLDivElement>) => {
    const time = getTimeFromClientX(e.clientX);
    const frequency = getFrequencyFromClientY(e.clientY)

    if (isInCanvas(e)) {
      dispatch(updatePointerPosition({ time, frequency }))
      newAnnotation?.update(time, frequency);
    } else dispatch(leavePointer())
  }

  const onStartNewAnnotation = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDrawingEnabled || !isInCanvas(e)) return;

    const newAnnotation = new EditAnnotation(
      getTimeFromClientX(e.clientX),
      getFrequencyFromClientY(e.clientY)
    );
    setNewAnnotation(newAnnotation);
  }

  const onEndNewAnnotation = (e: PointerEvent<HTMLDivElement>) => {
    if (newAnnotation) {
      newAnnotation.update(
        getTimeFromClientX(e.clientX),
        getFrequencyFromClientY(e.clientY)
      )
      const width = Math.abs(newAnnotation.startTime - newAnnotation.endTime) * timePixelRatio
      const height = Math.abs(newAnnotation.startFrequency - newAnnotation.endFrequency) * frequencyPixelRatio
      if (width > 2 && height > 2) {
        dispatch(addResult({
          type: AnnotationType.box,
          annotation: focusedTag ?? '',
          confidenceIndicator: focusedConfidence,
          startTime: newAnnotation.startTime,
          endTime: newAnnotation.endTime,
          startFrequency: newAnnotation.startFrequency,
          endFrequency: newAnnotation.endFrequency,
          result_comments: [],
          validation: null
        }))
      }
    }
    setNewAnnotation(undefined);
  }

  const onWheel = (event: WheelEvent) => {
    // Prevent page scrolling
    event.stopPropagation();
    // event.preventDefault();

    const origin = {
      x: event.clientX,
      y: event.clientY
    }

    if (event.deltaY < 0) dispatch(zoom({ direction: 'in', origin }))
    else if (event.deltaY > 0) dispatch(zoom({ direction: 'out', origin }))
  }

  return (
    <Fragment>
      <canvas className="freq-axis"
              ref={ yAxisRef }
              height={ SPECTRO_HEIGHT }
              width={ Y_WIDTH }
              style={ { top: `${ CONTROLS_AREA_SIZE }px` } }></canvas>


      <div className="canvas-wrapper"
           ref={ wrapperRef }
           onPointerDown={ onStartNewAnnotation }
           onPointerMove={ onUpdateNewAnnotation }
           onPointerLeave={ () => dispatch(leavePointer())}
           onPointerUp={ onEndNewAnnotation }
           style={ {
             width: `${ SPECTRO_WIDTH }px`,
             height: `${ SPECTRO_HEIGHT + X_HEIGHT + SCROLLBAR_RESERVED }px`,
             top: `${ CONTROLS_AREA_SIZE }px`,
           } }>

        <canvas className={ `canvas ${ isDrawingEnabled && 'drawable' }` }
                ref={ spectroRef }
                height={ SPECTRO_HEIGHT }
                width={ SPECTRO_WIDTH }
                onClick={ e => audioPlayer?.seek(getTimeFromClientX(e.clientX)) }
                onWheel={ onWheel }></canvas>

        <canvas className="time-axis"
                ref={ xAxisRef }
                height={ X_HEIGHT }
                width={ SPECTRO_WIDTH }
                style={ { top: `${ SPECTRO_HEIGHT }px` } }></canvas>

        { results
          .filter(a => a.type === AnnotationType.box)
          .map((annotation: Annotation, key: number) => (
            <Region key={ key }
                    canvasWrapperRef={ wrapperRef }
                    annotation={ annotation }
                    timePxRatio={ timePixelRatio }
                    freqPxRatio={ frequencyPixelRatio }
                    audioPlayer={ audioPlayer }></Region>
          )) }
      </div>
    </Fragment>)
}
