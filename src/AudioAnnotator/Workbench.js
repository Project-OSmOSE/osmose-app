// @flow
import React, { Component } from 'react';
import * as utils from '../utils';

import type { Annotation, SpectroUrlsParams } from './AudioAnnotator';
import Region from './Region';

// Component dimensions constants
const CANVAS_HEIGHT: number = 512;
const CANVAS_WIDTH: number = 1813;
const CONTROLS_AREA_SIZE: number = 80;
const TIME_AXIS_SIZE: number = 30;
const FREQ_AXIS_SIZE: number = 35;
const SCROLLBAR_RESERVED: number = 20;

type Spectrogram = {
  start: number,
  end: number,
  image: Image,
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
  startFrequency: number,
  frequencyRange: number,
  spectroUrlsParams: Array<SpectroUrlsParams>,
  annotations: Array<Annotation>,
  onAnnotationCreated: (Annotation) => void,
  onAnnotationUpdated: (Annotation) => void,
  onAnnotationDeleted: (Annotation) => void,
  onAnnotationPlayed: (Annotation) => void,
  onAnnotationSelected: (Annotation) => void,
  onSeek: any,
};

type WorkbenchState = {
  wrapperWidth: number,
  wrapperHeight: number,
  timePxRatio: number,
  freqPxRatio: number,
  currentParams: SpectroParams,
  currentZoom: number,
  spectrograms: Array<SpectroDetails>,
  newAnnotation: ?Annotation,
};

class Workbench extends Component<WorkbenchProps, WorkbenchState> {

  /**
   * Ref to canvas wrapper is used to modify its scrollLeft property.
   * @property {any} wrapperRef React reference to the wrapper
   */
  wrapperRef: any;

  /**
   * Ref to canvases are used to get their context.
   * @property {any} canvasRef React reference to the canvas
   */
  canvasRef: any;

  timeAxisRef: any;
  freqAxisRef: any;

  isDrawing: boolean;
  drawPxMove: number;
  drawStartTime: number;
  drawStartFrequency: number;

  constructor(props: WorkbenchProps) {
    super(props);

    let currentParams: SpectroParams = {nfft: 0, winsize: 0, overlap: 0, zoom: 0};
    if (props.spectroUrlsParams.length > 0) {
      const params = props.spectroUrlsParams[0];
      currentParams = {
        nfft: params.nfft,
        winsize: params.winsize,
        overlap: params.overlap,
        zoom: 1,
      };
    }

    this.state = {
      wrapperWidth: CANVAS_WIDTH,
      wrapperHeight: CANVAS_HEIGHT + TIME_AXIS_SIZE + SCROLLBAR_RESERVED,
      timePxRatio: CANVAS_WIDTH / props.duration,
      freqPxRatio: CANVAS_HEIGHT / props.frequencyRange,
      currentParams,
      currentZoom: 1,
      spectrograms: [],
      newAnnotation: undefined,
    };

    this.wrapperRef = React.createRef();
    this.canvasRef = React.createRef();
    this.timeAxisRef = React.createRef();
    this.freqAxisRef = React.createRef();

    this.isDrawing = false;
    this.drawPxMove = 0;
    this.drawStartTime = 0;
    this.drawStartFrequency = 0;
  }

  buildSpectrogramsDetails(params: Array<SpectroUrlsParams>): Array<SpectroDetails> {
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
        const step: number = this.props.duration / zoom;

        const images = [...Array(zoom)].map((_, i) => {
          const start: number = i * step;
          const end: number = (i + 1) * step;

          const image = new Image();
          image.src = `${base.urlPrefix}${base.urlFileName}_${zoom.toString()}_${i}${base.urlFileExtension}`;
          image.onload = this.renderCanvas;
          return {start, end, image};
        });

        return Object.assign({}, base, {zoom, images});
      });
    });
  }

  componentDidMount() {
    // Handling spectrogram images
    /* @todo Currently we load all images at this time, not only displayed ones
     * Implement a cache system which will load images when needed
     */

    const spectrograms: Array<SpectroDetails> = this.buildSpectrogramsDetails(this.props.spectroUrlsParams);
    this.setState({spectrograms});

    // Add event listeners at the document level
    // (the user is able to release the click on any zone)
    document.addEventListener('pointermove', this.onUpdateNewAnnotation);
    document.addEventListener('pointerup', this.onEndNewAnnotation);
  }

  componentDidUpdate(prevProps: WorkbenchProps) {
    // Scroll if progress bar reach the right edge of the screen
    const wrapper: HTMLElement = this.wrapperRef.current;
    const canvas: HTMLCanvasElement = this.canvasRef.current;
    const oldX: number = Math.floor(canvas.width * prevProps.currentTime / this.props.duration);
    const newX: number = Math.floor(canvas.width * this.props.currentTime / this.props.duration);

    if ((oldX - wrapper.scrollLeft) < CANVAS_WIDTH && (newX - wrapper.scrollLeft) >= CANVAS_WIDTH) {
      wrapper.scrollLeft += CANVAS_WIDTH;
    }

    // Re-render
    this.renderCanvas();
    this.renderTimeAxis();
    this.renderFreqAxis();
  }

  componentWillUnmount() {
    document.removeEventListener('pointermove', this.onUpdateNewAnnotation);
    document.removeEventListener('pointerup', this.onEndNewAnnotation);
  }

  getTimeFromClientX = (clientX: number) => {
    const canvas: HTMLCanvasElement = this.canvasRef.current;
    const bounds: ClientRect = canvas.getBoundingClientRect();

    // Offset: nb of pixels from the axis (left)
    let offset: number = clientX - bounds.left;
    if (clientX < bounds.left) {
      offset = 0;
    } else if (clientX > bounds.right) {
      offset = canvas.width;
    }

    return offset / this.state.timePxRatio;
  }

  getFrequencyFromClientY = (clientY: number) => {
    const canvas: HTMLCanvasElement = this.canvasRef.current;
    const bounds: ClientRect = canvas.getBoundingClientRect();

    // Offset: nb of pixels from the axis (bottom)
    let offset: number = bounds.bottom - clientY;
    if (clientY < bounds.top) {
      offset = canvas.height;
    } else if (clientY > bounds.bottom) {
      offset = 0;
    }

    return this.props.startFrequency + offset / this.state.freqPxRatio;
  }

  seekTo = (event: SyntheticPointerEvent<HTMLCanvasElement>) => {
    this.props.onSeek(this.getTimeFromClientX(event.clientX));
  }

  onWheelZoom = (event: SyntheticWheelEvent<HTMLCanvasElement>) => {
    // Prevent page scrolling
    event.preventDefault();

    if (event.deltaY < 0) {
      // Zoom in
      this.zoom(1, event.clientX);
    } else if (event.deltaY > 0) {
      // Zoom out
      this.zoom(-1, event.clientX);
    }
  }

  getCurrentDetails(): Array<SpectroDetails> {
    return this.state.spectrograms.filter((details: SpectroDetails) =>
      (this.state.currentParams.nfft === details.nfft) &&
        (this.state.currentParams.winsize === details.winsize) &&
        (this.state.currentParams.overlap === details.overlap)
    );
  }

  changeCurrentParams = (event: SyntheticInputEvent<HTMLSelectElement>) => {
    const fullParams = this.props.spectroUrlsParams[parseInt(event.target.value, 10)];
    const newParams = {
      nfft: fullParams.nfft,
      winsize: fullParams.winsize,
      overlap: fullParams.overlap,
      zoom: 1,
    };
    this.setState({currentParams: newParams}, this.renderCanvas);
  }

  zoom = (direction: number, xFrom: ?number) => {
    const canvas: HTMLCanvasElement = this.canvasRef.current;
    const timeAxis: HTMLCanvasElement = this.timeAxisRef.current;

    const zoomLevels = this.getCurrentDetails()
      .map(details => details.zoom)
      .sort((a, b) => a - b);

    const oldZoomIdx: number = zoomLevels.findIndex(factor => factor === this.state.currentZoom);
    let newZoom: number = this.state.currentZoom;

    // When zoom will be free: if (direction > 0 && oldZoomIdx < zoomLevels.length - 1)
    if (direction > 0 && oldZoomIdx < 4 && oldZoomIdx < zoomLevels.length - 1) {
      // Zoom in
      newZoom = zoomLevels[oldZoomIdx+1];
    } else if (direction < 0 && oldZoomIdx > 0) {
      // Zoom out
      newZoom = zoomLevels[oldZoomIdx-1];
    }

    // If zoom factor has changed
    if (newZoom !== this.state.currentZoom) {
      // New timePxRatio
      const timePxRatio: number = this.state.wrapperWidth * newZoom / this.props.duration;

      // Compute new center (before resizing)
      const wrapper: HTMLElement = this.wrapperRef.current;
      const zoomRatio = newZoom / this.state.currentZoom;

      let newCenter: number = 0;
      if (xFrom) {
        // x-coordinate has been given, center on it
        const bounds: ClientRect = canvas.getBoundingClientRect();
        newCenter = (xFrom - bounds.left) * zoomRatio;
      } else {
        // If no x-coordinate: center on currentTime
        newCenter = this.props.currentTime * timePxRatio;
      }
      const scroll = Math.floor(newCenter - CANVAS_WIDTH / 2);

      // Resize canvases and scroll
      canvas.width = this.state.wrapperWidth * newZoom;
      timeAxis.width = this.state.wrapperWidth * newZoom;

      wrapper.scrollLeft = scroll;

      this.setState({
        currentZoom: newZoom,
        timePxRatio,
      });
    }
  }

  onStartNewAnnotation = (event: SyntheticPointerEvent<HTMLCanvasElement>) => {
    const newTime: number = this.getTimeFromClientX(event.clientX);
    const newFrequency: number = this.getFrequencyFromClientY(event.clientY);

    this.isDrawing = true;
    this.drawPxMove = 0;
    this.drawStartTime = newTime;
    this.drawStartFrequency = newFrequency;

    const newAnnotation: Annotation = {
      id: '',
      annotation: '',
      startTime: newTime,
      endTime: newTime,
      startFrequency: newFrequency,
      endFrequency: newFrequency,
      active: false,
    };

    this.setState({newAnnotation});
  }

  computeNewAnnotation = (e: PointerEvent) => {
    const currentTime: number = this.getTimeFromClientX(e.clientX);
    const currentFrequency: number = this.getFrequencyFromClientY(e.clientY);

    const newAnnotation: Annotation = {
      id: '',
      annotation: '',
      startTime: Math.min(currentTime, this.drawStartTime),
      endTime: Math.max(currentTime, this.drawStartTime),
      startFrequency: Math.min(currentFrequency, this.drawStartFrequency),
      endFrequency: Math.max(currentFrequency, this.drawStartFrequency),
      active: false,
    };
    return newAnnotation;
  }

  onUpdateNewAnnotation = (e: PointerEvent) => {
    if (this.isDrawing && ++this.drawPxMove > 2) {
      const newAnnotation: Annotation = this.computeNewAnnotation(e);
      this.setState({newAnnotation}, this.renderCanvas);
    }
  }

  onEndNewAnnotation = (e: PointerEvent) => {
    if (this.isDrawing && this.drawPxMove > 2) {
      this.props.onAnnotationCreated(this.computeNewAnnotation(e));

      this.setState({newAnnotation: undefined}, this.renderCanvas);
    }

    this.isDrawing = false;
    this.drawPxMove = 0;
  }

  renderTimeAxis = () => {
    const timeAxis: HTMLCanvasElement = this.timeAxisRef.current;
    const context: CanvasRenderingContext2D = timeAxis.getContext('2d');
    context.clearRect(0, 0, timeAxis.width, timeAxis.height);

    let step: number = 1; // step of scale (in seconds)
    let bigStep: number = 5;

    const durationOnScreen: number = this.state.wrapperWidth / this.state.timePxRatio;
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

    const bounds: ClientRect = timeAxis.getBoundingClientRect();
    const startTime: number = Math.ceil(this.getTimeFromClientX(bounds.left));
    const endTime: number = Math.floor(this.getTimeFromClientX(bounds.right));

    context.fillStyle = 'rgba(0, 0, 0)';
    context.font = '10px Arial';

    let i: number = 0;
    for (i = startTime ; i <= endTime; i++) {
      if (i % step === 0) {
        const x: number = (i - startTime) * this.state.timePxRatio;

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

  renderFreqAxis = () => {
    const freqAxis: HTMLCanvasElement = this.freqAxisRef.current;
    const context: CanvasRenderingContext2D = freqAxis.getContext('2d');
    context.clearRect(0, 0, freqAxis.width, freqAxis.height);

    let step: number = 500; // step of scale (in hz)
    let bigStep: number = 2000;

    const frequencyOnScreen: number = this.state.wrapperHeight / this.state.freqPxRatio;
    if (frequencyOnScreen <= 200) {
      step = 5;
      bigStep = 20;
    } else if (frequencyOnScreen > 200 && frequencyOnScreen <= 500) {
      step = 10;
      bigStep = 100;
    } else if (frequencyOnScreen > 500 && frequencyOnScreen <= 2000) {
      step = 20;
      bigStep = 100;
    } else if (frequencyOnScreen > 2000 && frequencyOnScreen <= 20000) {
      step = 500;
      bigStep = 2000;
    } else {
      step = 2000;
      bigStep = 10000;
    }

    const bounds: ClientRect = freqAxis.getBoundingClientRect();
    const startFreq: number = Math.ceil(this.props.startFrequency);
    const endFreq: number = Math.floor(this.props.startFrequency + this.props.frequencyRange);

    context.fillStyle = 'rgba(0, 0, 0)';
    context.font = '10px Arial';

    let i: number = 0;
    for (i = startFreq ; i <= endFreq ; i += 5) {
      if (i % step === 0) {
        const y: number = CANVAS_HEIGHT - (i - startFreq) * this.state.freqPxRatio - 2;

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

  renderCanvas = () => {
    const canvas: HTMLCanvasElement = this.canvasRef.current;
    const context: CanvasRenderingContext2D = canvas.getContext('2d', { alpha: false });
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw spectro images
    const spectrograms = this.getCurrentDetails().find(details => details.zoom === this.state.currentZoom);
    if (spectrograms) {
      spectrograms.images.forEach(spectro => {
        if (spectro.image && spectro.image.complete) {
          const x = spectro.start * this.state.timePxRatio;
          const width = Math.floor((spectro.end - spectro.start) * this.state.timePxRatio);
          context.drawImage(spectro.image, x, 0, width, canvas.height);
        }
      });
    }

    // Progress bar
    const newX: number = Math.floor(canvas.width * this.props.currentTime / this.props.duration);
    context.fillStyle = 'rgba(0, 0, 0)';
    context.fillRect(newX, 0, 1, canvas.height);

    // Render new annotation
    if (this.state.newAnnotation) {
      const ann: Annotation = this.state.newAnnotation;
      const x: number = Math.floor(ann.startTime * this.state.timePxRatio);
      const y: number = Math.floor(canvas.height - ann.startFrequency * this.state.freqPxRatio);
      const width: number = Math.floor((ann.endTime - ann.startTime) * this.state.timePxRatio);
      const height: number = - Math.floor((ann.endFrequency - ann.startFrequency) * this.state.freqPxRatio);
      context.strokeStyle = 'blue';
      context.strokeRect(x, y, width, height);
    }
  }

  render() {
    const style = {
      workbench: {
        height: `${CONTROLS_AREA_SIZE + CANVAS_HEIGHT + TIME_AXIS_SIZE + SCROLLBAR_RESERVED}px`,
        width: `${FREQ_AXIS_SIZE + CANVAS_WIDTH}px`,
      },
      wrapper: {
        top: `${CONTROLS_AREA_SIZE}px`,
        height: `${this.state.wrapperHeight}px`,
        width: `${this.state.wrapperWidth}px`,
      },
      canvas: {
        top: 0,
        left: 0,
      },
      timeAxis: {
        top: `${CANVAS_HEIGHT}px`,
        left: 0,
      },
      freqAxis: {
        top: `${CONTROLS_AREA_SIZE}px`,
        left: 0,
      },
    };

    return (
      <div
        className="workbench rounded"
        style={style.workbench}
      >
        <p className="workbench-controls">
          <select defaultValue={this.state.currentParams} onChange={this.changeCurrentParams}>
            {this.props.spectroUrlsParams.map((params, idx) => {
              return (
                <option key={`params-${idx}`} value={idx}>
                  {`nfft: ${params.nfft} / winsize: ${params.winsize} / overlap: ${params.overlap}`}
                </option>
              );
            })}
          </select>
          <button className="btn-simple fa fa-search-plus" onClick={() => this.zoom(1)}></button>
          <button className="btn-simple fa fa-search-minus" onClick={() => this.zoom(-1)}></button>
          <span>{this.state.currentZoom}x</span>
        </p>

        <canvas
          className="freq-axis"
          ref={this.freqAxisRef}
          height={CANVAS_HEIGHT}
          width={FREQ_AXIS_SIZE}
          style={style.freqAxis}
        ></canvas>
        <div
          className="canvas-wrapper"
          ref={this.wrapperRef}
          style={style.wrapper}
        >
          <canvas
            className="canvas"
            ref={this.canvasRef}
            height={CANVAS_HEIGHT}
            width={CANVAS_WIDTH}
            style={style.canvas}
            onClick={this.seekTo}
            onPointerDown={this.onStartNewAnnotation}
            onWheel={this.onWheelZoom}
          ></canvas>

          <canvas
            className="time-axis"
            ref={this.timeAxisRef}
            height={TIME_AXIS_SIZE}
            width={CANVAS_WIDTH}
            style={style.timeAxis}
          ></canvas>

          {this.props.annotations.map(annotation => this.renderRegion(annotation))}
        </div>
      </div>
    );
  }

  renderRegion = (ann: Annotation) => {
    // Top offset
    const offsetTop: number = CANVAS_HEIGHT - ann.endFrequency * this.state.freqPxRatio;

    // Left offset
    const offsetLeft: number = ann.startTime * this.state.timePxRatio;

    return (
      <Region
        key={ann.id}
        annotation={ann}
        color={utils.getTagColor(this.props.tagColors, ann.annotation)}
        timePxRatio={this.state.timePxRatio}
        freqPxRatio={this.state.freqPxRatio}
        offsetTop={offsetTop}
        offsetLeft={offsetLeft}
        onRegionDeleted={this.props.onAnnotationDeleted}
        onRegionMoved={this.props.onAnnotationUpdated}
        onRegionPlayed={this.props.onAnnotationPlayed}
        onRegionClicked={this.props.onAnnotationSelected}
       ></Region>
    );
  }
}

export default Workbench;
