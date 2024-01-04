import React, { ChangeEvent, MouseEvent, PointerEvent, useEffect, useRef, useState, WheelEvent } from 'react';
import * as utils from '../utils';

import type { Annotation, FileMetadata, SpectroUrlsParams } from './AudioAnnotator';
import { TYPE_BOX } from './AudioAnnotator';
import Region from './Region';

// Component dimensions constants
export const SPECTRO_CANVAS_HEIGHT: number = 512;
const SPECTRO_CANVAS_WIDTH: number = 1813;
const CONTROLS_AREA_SIZE: number = 80;
const TIME_AXIS_SIZE: number = 30;
const FREQ_AXIS_SIZE: number = 35;
const SCROLLBAR_RESERVED: number = 20;

type Spectrogram = {
  start: number,
  end: number,
  src: string,
  image?: HTMLImageElement,
};

type SpectroParams = {
  nfft: number,
  winsize: number,
  overlap: number,
  zoom: number,
};

type SpectroDetails = {
  nfft: number,
  winsize: number,
  overlap: number,
  zoom: number,
  urlPrefix: string,
  urlFileName: string,
  urlFileExtension: string,
  images: Array<Spectrogram>,
};

type WorkbenchProps = {
  tagColors: Map<string, string>,
  currentTime: number,
  duration: number,
  fileMetadata: FileMetadata,
  startFrequency: number,
  frequencyRange: number,
  availableSpectroConfigs: Array<SpectroUrlsParams>,
  annotations: Array<Annotation>,
  onAnnotationCreated: (a: Annotation) => void,
  onAnnotationUpdated: (a: Annotation) => void,
  onAnnotationDeleted: (a: Annotation) => void,
  onAnnotationPlayed: (a: Annotation) => void,
  onAnnotationSelected: (a: Annotation) => void,
  onSeek: any,
  drawingEnabled: boolean,
  currentDefaultTagAnnotation: string,
  currentDefaultConfidenceIndicator?: string,
};

const Workbench: React.FC<WorkbenchProps> = ({
                                               availableSpectroConfigs,
                                               annotations,
                                               startFrequency,
                                               tagColors,
                                               onAnnotationDeleted,
                                               onAnnotationUpdated,
                                               onAnnotationPlayed,
                                               onAnnotationSelected,
                                               duration,
                                               frequencyRange,
                                               drawingEnabled,
                                               currentDefaultConfidenceIndicator,
                                               currentDefaultTagAnnotation,
                                               currentTime,
                                               onSeek,
                                               fileMetadata,
                                               onAnnotationCreated
                                             }) => {
  /**
   * Ref to canvas wrapper is used to modify its scrollLeft property.
   * @property { RefObject<HTMLDivElement>} wrapperRef React reference to the wrapper
   */
  const wrapperRef = useRef<HTMLDivElement>(null)

  /**
   * Ref to canvases are used to get their context.
   * @property { RefObject<HTMLCanvasElement>} canvasRef React reference to the canvas
   */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeAxisRef = useRef<HTMLCanvasElement>(null);
  const freqAxisRef = useRef<HTMLCanvasElement>(null);

  const [timePxRatio, setTimePxRatio] = useState<number>(0);
  const [freqPxRatio, setFreqPxRatio] = useState<number>(0);
  const [currentZoom, setCurrentZoom] = useState<number>(1);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawPxMove, setDrawPxMove] = useState<number>(1);
  const [drawStartTime, setDrawStartTime] = useState<number>(1);
  const [pointerFrequency, setPointerFrequency] = useState<number | undefined>(undefined);
  const [pointerTime, setPointerTime] = useState<number | undefined>(undefined);
  const [drawStartFrequency, setDrawStartFrequency] = useState<number>(1);

  const [newAnnotation, setNewAnnotation] = useState<Annotation | undefined>();

  const [currentParams, setCurrentParams] = useState<SpectroParams>({
    nfft: 0,
    winsize: 0,
    overlap: 0,
    zoom: 0
  });

  const [spectrograms, setSpectrograms] = useState<Array<SpectroDetails>>([]);
  const [loadingZoomLvl, setLoadingZoomLvl] = useState<number>(1);

  const availableSpectroConfigsRef = useRef<Array<SpectroUrlsParams>>([])
  const currentTimeRef = useRef<number>(0)

  useEffect(() => {
    setTimePxRatio(SPECTRO_CANVAS_WIDTH / duration);
    setFreqPxRatio(SPECTRO_CANVAS_HEIGHT / frequencyRange);
    setSpectrograms(buildSpectrogramsDetails(availableSpectroConfigs));
    if (availableSpectroConfigs.length > 0) setCurrentParams({ ...availableSpectroConfigs[0], zoom: 1 })


    // Add event listeners at the document level
    // (the user is able to release the click on any zone)
    document.addEventListener('pointermove', onUpdateNewAnnotation);
    document.addEventListener('pointerup', onEndNewAnnotation);
    return () => {
      document.removeEventListener('pointermove', onUpdateNewAnnotation);
      document.removeEventListener('pointerup', onEndNewAnnotation);
    }
  }, []);

  useEffect(() => {
    // Check if task has changed (new spectrogram URLS)
    const prevSpectroUrls = availableSpectroConfigsRef.current;
    const newSpectroUrls = availableSpectroConfigs;

    if (newSpectroUrls.length > 0 && prevSpectroUrls.length > 0 && newSpectroUrls[0] !== prevSpectroUrls[0]) {
      setSpectrograms(buildSpectrogramsDetails(newSpectroUrls))
      setLoadingZoomLvl(1);
    }

    // Re-render
    renderCanvas();
    renderTimeAxis();
    renderFreqAxis();
    availableSpectroConfigsRef.current = availableSpectroConfigs;
  }, [availableSpectroConfigs]);

  useEffect(() => {
    // Scroll if progress bar reach the right edge of the screen
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const oldX: number = Math.floor(canvas.width * currentTimeRef.current / duration);
    const newX: number = Math.floor(canvas.width * currentTime / duration);

    if ((oldX - wrapper.scrollLeft) < SPECTRO_CANVAS_WIDTH && (newX - wrapper.scrollLeft) >= SPECTRO_CANVAS_WIDTH) {
      wrapper.scrollLeft += SPECTRO_CANVAS_WIDTH;
    }

    // Re-render
    renderCanvas();
    renderTimeAxis();
    renderFreqAxis();
  }, [currentTime]);

  useEffect(() => {
    renderCanvas();
  }, [newAnnotation]);

  useEffect(() => {
    loadNextZoomLevel();
  }, [loadingZoomLvl]);

  useEffect(() => {
    loadNextZoomLevel();
  }, [currentParams]);


  const buildSpectrogramsDetails = (params: Array<SpectroUrlsParams>): Array<SpectroDetails> => {
    return params.flatMap(conf => {
      // URL
      const baseUrlRegexp = /(.*\/)(.*)_[\d]*_[\d]*(\..*)/;
      const urlParts = conf.urls[0].match(baseUrlRegexp);

      const base = {
        nfft: conf.nfft,
        winsize: conf.winsize,
        overlap: conf.overlap,
        urlPrefix: urlParts ? urlParts[1] : '',
        urlFileName: urlParts ? urlParts[2] : '',
        urlFileExtension: urlParts ? urlParts[3] : '',
      };

      // Zoom management
      const nbZooms = Math.log2(conf.urls.length + 1);
      const zoomLevels: Array<number> = [...Array(nbZooms)].map((_, i) => Math.pow(2, i));

      return zoomLevels.map(zoom => {
        const step: number = duration / zoom;

        const images = [...Array(zoom)].map((_, i) => {
          const start: number = i * step;
          const end: number = (i + 1) * step;
          const src: string = `${ base.urlPrefix }${ base.urlFileName }_${ zoom.toString() }_${ i }${ base.urlFileExtension }`;
          return { start, end, src, image: undefined };
        });

        return Object.assign({}, base, { zoom, images });
      });
    });
  }

  const onSpectroImageComplete = () => {
    // Re-render canvas with new image
    renderCanvas();

    // Retrieve current loading zoom with current details
    const details: SpectroDetails | undefined = getSpectrosForCurrentDetails()
      .find(details => details.zoom === loadingZoomLvl);

    if (details) {
      // Check if zoom lvl is loaded
      const isZoomLvlLoaded: boolean = details.images
        .reduce((acc, cur) => acc && cur.image ? cur.image.complete : false, true);

      if (isZoomLvlLoaded) {
        // Go on with next level if exists
        const zoomLevels = getSpectrosForCurrentDetails()
          .map(details => details.zoom)
          .sort((a, b) => a - b);
        const zoomIdx: number = zoomLevels.findIndex(factor => factor === loadingZoomLvl);

        if (zoomIdx < zoomLevels.length - 1) {
          setLoadingZoomLvl(zoomLevels[zoomIdx + 1])
        }
      }
    }
  }

  const loadNextZoomLevel = () => {
    const currentDetails: SpectroDetails | undefined = getSpectrosForCurrentDetails()
      .find(details => details.zoom === loadingZoomLvl);

    if (currentDetails) {
      const newImages: Array<Spectrogram> = currentDetails.images.map(spectro => {
        const image = new Image();
        image.src = spectro.src;
        image.onload = onSpectroImageComplete;
        return Object.assign({}, spectro, { image: image });
      });

      const filteredDetails: Array<SpectroDetails> = getAllSpectrosButCurrentForZoom(loadingZoomLvl);

      setSpectrograms(filteredDetails.concat(Object.assign({}, currentDetails, { images: newImages })))
    }
  }

  const getTimeFromClientX = (clientX: number): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const bounds = canvas.getBoundingClientRect();

    // Offset: nb of pixels from the axis (left)
    let offset: number = clientX - bounds.left;
    if (clientX < bounds.left) {
      offset = 0;
    } else if (clientX > bounds.right) {
      offset = canvas.width;
    }

    return offset / timePxRatio;
  }

  const getFrequencyFromClientY = (clientY: number): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const bounds = canvas.getBoundingClientRect();

    // Offset: nb of pixels from the axis (bottom)
    let offset: number = bounds.bottom - clientY;
    if (clientY < bounds.top) {
      offset = canvas.height;
    } else if (clientY > bounds.bottom) {
      offset = 0;
    }

    return startFrequency + offset / freqPxRatio;
  }

  const seekTo = (event: MouseEvent<HTMLCanvasElement>) => {
    onSeek(getTimeFromClientX(event.clientX));
  }

  const onWheelZoom = (event: WheelEvent<HTMLCanvasElement>) => {
    // Prevent page scrolling
    event.preventDefault();

    if (event.deltaY < 0) {
      // Zoom in
      zoom(1, event.clientX);
    } else if (event.deltaY > 0) {
      // Zoom out
      zoom(-1, event.clientX);
    }
  }

  const getSpectrosForCurrentDetails = (): Array<SpectroDetails> => {
    return spectrograms.filter((details: SpectroDetails) =>
      (currentParams.nfft === details.nfft) &&
      (currentParams.winsize === details.winsize) &&
      (currentParams.overlap === details.overlap)
    );
  }

  const getAllSpectrosButCurrentForZoom = (zoomIdx: number): Array<SpectroDetails> => {
    return spectrograms.filter((details: SpectroDetails) =>
        (
          (currentParams.nfft === details.nfft) &&
          (currentParams.winsize === details.winsize) &&
          (currentParams.overlap === details.overlap) &&
          (zoomIdx !== details.zoom)
        ) || (
          (currentParams.nfft !== details.nfft) ||
          (currentParams.winsize !== details.winsize) ||
          (currentParams.overlap !== details.overlap)
        )
    );
  }

  const changeCurrentParams = (event: ChangeEvent<HTMLSelectElement>) => {
    const fullParams = availableSpectroConfigs[+event.target.value];
    setCurrentParams({
      nfft: fullParams.nfft,
      winsize: fullParams.winsize,
      overlap: fullParams.overlap,
      zoom: 1,
    });
  }

  const zoom = (direction: number, xFrom?: number) => {
    const canvas = canvasRef.current;
    const timeAxis = timeAxisRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !timeAxis || !wrapper) return;

    const zoomLevels = getSpectrosForCurrentDetails()
      .map(details => details.zoom)
      .sort((a, b) => a - b);

    const oldZoomIdx: number = zoomLevels.findIndex(factor => factor === currentZoom);
    let newZoom: number = currentZoom;

    // When zoom will be free: if (direction > 0 && oldZoomIdx < zoomLevels.length - 1)
    if (direction > 0 && oldZoomIdx < 4 && oldZoomIdx < zoomLevels.length - 1) {
      // Zoom in
      newZoom = zoomLevels[oldZoomIdx + 1];
    } else if (direction < 0 && oldZoomIdx > 0) {
      // Zoom out
      newZoom = zoomLevels[oldZoomIdx - 1];
    }

    // If zoom factor has changed
    if (newZoom === currentZoom) return;
    // New timePxRatio
    const newTimePxRatio: number = SPECTRO_CANVAS_WIDTH * newZoom / duration;

    // Resize canvases and scroll
    canvas.width = SPECTRO_CANVAS_WIDTH * newZoom;
    timeAxis.width = SPECTRO_CANVAS_WIDTH * newZoom;

    // Compute new center (before resizing)
    let newCenter: number;
    if (xFrom) {
      // x-coordinate has been given, center on it
      const bounds = canvas.getBoundingClientRect();
      newCenter = (xFrom - bounds.left) * newZoom / currentZoom;
    } else {
      // If no x-coordinate: center on currentTime
      newCenter = currentTime * newTimePxRatio;
    }
    wrapper.scrollLeft = Math.floor(newCenter - SPECTRO_CANVAS_WIDTH / 2);

    setCurrentZoom(newZoom);
    setTimePxRatio(newTimePxRatio);
  }

  const onStartNewAnnotation = (event: PointerEvent<HTMLElement>) => {
    if (!drawingEnabled) return;

    const newTime: number = getTimeFromClientX(event.clientX);
    const newFrequency: number = getFrequencyFromClientY(event.clientY);

    setIsDrawing(true);
    setDrawPxMove(0);
    setDrawStartTime(newTime);
    setDrawStartFrequency(newFrequency);

    setNewAnnotation({
      type: TYPE_BOX,
      id: undefined,
      annotation: '',
      confidenceIndicator: currentDefaultConfidenceIndicator,
      startTime: newTime,
      endTime: newTime,
      startFrequency: newFrequency,
      endFrequency: newFrequency,
      active: false,
      result_comments: [],
    })
  }

  const computeNewAnnotation = (e: PointerEvent) => {
    const currentTime: number = getTimeFromClientX(e.clientX);
    const currentFrequency: number = getFrequencyFromClientY(e.clientY);

    return {
      type: TYPE_BOX,
      id: undefined,
      annotation: currentDefaultTagAnnotation,
      confidenceIndicator: currentDefaultConfidenceIndicator,
      startTime: Math.min(currentTime, drawStartTime),
      endTime: Math.max(currentTime, drawStartTime),
      startFrequency: Math.min(currentFrequency, drawStartFrequency),
      endFrequency: Math.max(currentFrequency, drawStartFrequency),
      active: false,
      result_comments: [],
    };
  }

  const onUpdateNewAnnotation = (e: any) => {
    if (isDrawing && drawPxMove + 1 > 2) {
      setNewAnnotation(computeNewAnnotation(e));
    }
    setDrawPxMove(drawPxMove + 1); // TODO: confirm the behavior, before it was ++drawPxMove in the upper if statement
    // Show pointer frequency/time data
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return;
    if (e.clientX < bounds.x || e.clientX > (bounds.x + bounds.width)
      || e.clientY < bounds.y || e.clientY > (bounds.y + bounds.height)) {
      setPointerFrequency(undefined);
      setPointerTime(undefined);
    } else {
      setPointerFrequency(getFrequencyFromClientY(e.clientY));
      setPointerTime(getTimeFromClientX(e.clientX));
    }
  }

  const onEndNewAnnotation = (e: any) => {
    if (isDrawing && drawPxMove > 2) {
      onAnnotationCreated(computeNewAnnotation(e));
      setNewAnnotation(undefined);
    }

    setIsDrawing(false);
    setDrawPxMove(0)
  }

  const renderTimeAxis = () => {
    const timeAxis = timeAxisRef.current;
    const context = timeAxis?.getContext('2d');
    if (!timeAxis || !context) return;

    context.clearRect(0, 0, timeAxis.width, timeAxis.height);

    let step: number = 1; // step of scale (in seconds)
    let bigStep: number = 5;

    const durationOnScreen: number = SPECTRO_CANVAS_WIDTH / timePxRatio;
    if (durationOnScreen <= 60) {
      step = 1;
      bigStep = 5;
    } else if (durationOnScreen > 60 && durationOnScreen <= 120) {
      step = 2;
      bigStep = 5;
    } else if (durationOnScreen > 120 && durationOnScreen <= 500) {
      step = 4;
      bigStep = 5;
    } else if (durationOnScreen > 500 && durationOnScreen <= 1000) {
      step = 10;
      bigStep = 60;
    } else {
      step = 30;
      bigStep = 120;
    }

    const bounds: DOMRect = timeAxis.getBoundingClientRect();
    const startTime: number = Math.ceil(getTimeFromClientX(bounds.left));
    const endTime: number = Math.floor(getTimeFromClientX(bounds.right));

    context.fillStyle = 'rgba(0, 0, 0)';
    context.font = '10px Arial';

    let i: number = 0;
    for (i = startTime; i <= endTime; i++) {
      if (i % step === 0) {
        const x: number = (i - startTime) * timePxRatio;

        if (i % bigStep === 0) {
          // Bar
          context.fillRect(x, 0, 2, 15);

          // Text
          const timeText: string = utils.formatTimestamp(i, false);
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

  const renderFreqAxis = () => {
    const freqAxis = freqAxisRef.current;
    const context = freqAxis?.getContext('2d');
    if (!freqAxis || !context) return;

    context.clearRect(0, 0, freqAxis.width, freqAxis.height);

    let step: number = 500; // step of scale (in hz)
    let bigStep: number = 2000;

    if (frequencyRange <= 200) {
      step = 5;
      bigStep = 20;
    } else if (frequencyRange > 200 && frequencyRange <= 500) {
      step = 10;
      bigStep = 100;
    } else if (frequencyRange > 500 && frequencyRange <= 2000) {
      step = 20;
      bigStep = 100;
    } else if (frequencyRange > 2000 && frequencyRange <= 20000) {
      step = 500;
      bigStep = 2000;
    } else {
      step = 2000;
      bigStep = 10000;
    }

    const bounds: DOMRect = freqAxis.getBoundingClientRect();
    const startFreq: number = Math.ceil(startFrequency);
    const endFreq: number = Math.floor(startFrequency + frequencyRange);

    context.fillStyle = 'rgba(0, 0, 0)';
    context.font = '10px Arial';

    let i: number = 0;
    for (i = startFreq; i <= endFreq; i += 5) {
      if (i % step === 0) {
        const y: number = SPECTRO_CANVAS_HEIGHT - (i - startFreq) * freqPxRatio - 2;

        if (i % bigStep === 0) {
          // Bar
          context.fillRect(FREQ_AXIS_SIZE - 15, y, 15, 2);

          // Text
          let yTxt: number = y;
          if (yTxt < (bounds.height - 5)) {
            // "Top align" all labels but first
            yTxt += 12;
          }
          context.fillText(i.toString(), 0, yTxt);
        } else {
          // Bar only
          context.fillRect(FREQ_AXIS_SIZE - 10, y, 10, 1);
        }
      }
    }
  }

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw spectro images
    const spectrograms = getSpectrosForCurrentDetails().find(details => details.zoom === currentZoom);

    if (spectrograms) {
      spectrograms.images.forEach(spectro => {
        if (spectro.image && spectro.image.complete) {
          const image = spectro.image;
          const x = spectro.start * timePxRatio;
          const width = Math.floor((spectro.end - spectro.start) * timePxRatio);
          context.drawImage(image, x, 0, width, canvas.height);
        }
      });
    }

    // Progress bar
    const newX: number = Math.floor(canvas.width * currentTime / duration);
    context.fillStyle = 'rgba(0, 0, 0)';
    context.fillRect(newX, 0, 1, canvas.height);

    // Render new annotation
    if (newAnnotation) {
      const ann: Annotation = newAnnotation;
      const x: number = Math.floor(ann.startTime * timePxRatio);
      const freqOffset: number = (ann.startFrequency - startFrequency) * freqPxRatio;
      const y: number = Math.floor(canvas.height - freqOffset);
      const width: number = Math.floor((ann.endTime - ann.startTime) * timePxRatio);
      const height: number = -Math.floor((ann.endFrequency - ann.startFrequency) * freqPxRatio);
      context.strokeStyle = 'blue';
      context.strokeRect(x, y, width, height);
    }
  }


  const style = {
    workbench: {
      height: `${ CONTROLS_AREA_SIZE + SPECTRO_CANVAS_HEIGHT + TIME_AXIS_SIZE + SCROLLBAR_RESERVED }px`,
      width: `${ FREQ_AXIS_SIZE + SPECTRO_CANVAS_WIDTH }px`,
    },
    wrapper: {
      top: `${ CONTROLS_AREA_SIZE }px`,
      height: `${ SPECTRO_CANVAS_HEIGHT + TIME_AXIS_SIZE + SCROLLBAR_RESERVED }px`,
      width: `${ SPECTRO_CANVAS_WIDTH }px`,
    },
    canvas: {
      top: 0,
      left: 0,
    },
    timeAxis: {
      top: `${ SPECTRO_CANVAS_HEIGHT }px`,
      left: 0,
    },
    freqAxis: {
      top: `${ CONTROLS_AREA_SIZE }px`,
      left: 0,
    },
  };

  const drawableStatusClass = drawingEnabled ? "drawable" : "";

  const currentSpectroIdx: number = availableSpectroConfigs.findIndex((params) => (
    params.nfft === currentParams.nfft &&
    params.overlap === currentParams.overlap &&
    params.winsize === currentParams.winsize));

  return (
    <div className="workbench rounded"
         style={ style.workbench }>
      <p className="workbench-controls">
        <select defaultValue={ currentSpectroIdx !== 1 ? currentSpectroIdx : 0 }
                onChange={ changeCurrentParams }>
          { availableSpectroConfigs.map((params, idx) => {
            return (
              <option key={ `params-${ idx }` } value={ idx }>
                { `nfft: ${ params.nfft } / winsize: ${ params.winsize } / overlap: ${ params.overlap }` }
              </option>
            );
          }) }
        </select>
        <button className="btn-simple fa fa-search-plus" onClick={ () => zoom(1) }></button>
        <button className="btn-simple fa fa-search-minus" onClick={ () => zoom(-1) }></button>
        <span>{ currentZoom }x</span>
      </p>

      { pointerFrequency && pointerTime && <p className="workbench-pointer">
        { pointerFrequency }Hz / { utils.formatTimestamp(pointerTime, false) }
      </p> }

      <p className="workbench-info workbench-info--intro">
        File : <strong>{ fileMetadata.name }</strong> - Sampling
        : <strong>{ fileMetadata.audioRate } Hz</strong><br/>
        Start date : <strong>{ fileMetadata.date.toUTCString() }</strong>
      </p>

      <canvas className="freq-axis"
              ref={ freqAxisRef }
              height={ SPECTRO_CANVAS_HEIGHT }
              width={ FREQ_AXIS_SIZE }
              style={ style.freqAxis }></canvas>

      <div className="canvas-wrapper"
           ref={ wrapperRef }
           style={ style.wrapper }>
        <canvas className={ `canvas ${ drawableStatusClass }` }
                ref={ canvasRef }
                height={ SPECTRO_CANVAS_HEIGHT }
                width={ SPECTRO_CANVAS_WIDTH }
                style={ style.canvas }
                onClick={ seekTo }
                onPointerDown={ onStartNewAnnotation }
                onWheel={ onWheelZoom }></canvas>

        <canvas className="time-axis"
                ref={ timeAxisRef }
                height={ TIME_AXIS_SIZE }
                width={ SPECTRO_CANVAS_WIDTH }
                style={ style.timeAxis }></canvas>


        { annotations.map((annotation: Annotation, idx: number) => (
          <Region key={ `region-${ idx.toFixed() }` }
                  canvasWrapperRef={ wrapperRef }
                  annotation={ annotation }
                  spectroStartFrequency={ startFrequency }
                  color={ utils.getTagColor(tagColors, annotation.annotation) }
                  timePxRatio={ timePxRatio }
                  freqPxRatio={ freqPxRatio }
                  currentZoom={ currentZoom }
                  onRegionDeleted={ onAnnotationDeleted }
                  onRegionMoved={ onAnnotationUpdated }
                  onRegionPlayed={ onAnnotationPlayed }
                  onRegionClicked={ onAnnotationSelected }
                  onAddAnotherAnnotation={ onStartNewAnnotation }
          ></Region>
        )) }
      </div>
    </div>
  );
}

export default Workbench;
