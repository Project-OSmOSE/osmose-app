// @flow
import React, { Component } from 'react';

import type { Annotation } from './AudioAnnotator';
import Region from './Region';

// Component dimensions constants
const CANVAS_HEIGHT: number = 500;
const CANVAS_WIDTH: number = 950;
const LABELS_AREA_SIZE: number = 50;
const X_AXIS_SIZE: number = 45;
const Y_AXIS_SIZE: number = 30;


type WorkbenchProps = {
  currentTime: number,
  duration: number,
  startFrequency: number,
  frequencyRange: number,
  spectrogramUrl: string,
  annotations: Array<Annotation>,
  onAnnotationCreated: (Annotation) => void,
  onAnnotationUpdated: (Annotation) => void,
  onAnnotationDeleted: (Annotation) => void,
  onAnnotationPlayed: (Annotation) => void,
  onAnnotationSelected: (Annotation) => void,
  onSeek: any,
};

type WorkbenchState = {
  canvasWidth: number,
  canvasHeight: number,
  timePxRatio: number,
  freqPxRatio: number,
  spectrogram: ?Image,
  newAnnotation: ?Annotation,
};

class Workbench extends Component<WorkbenchProps, WorkbenchState> {

  canvasRef: any;

  isDrawing: boolean;
  drawPxMove: number;
  drawStartTime: number;
  drawStartFrequency: number;

  constructor(props: WorkbenchProps) {
    super(props);

    this.state = {
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      timePxRatio: CANVAS_WIDTH / props.duration,
      freqPxRatio: CANVAS_HEIGHT / props.frequencyRange,
      spectrogram: undefined,
      newAnnotation: undefined,
    };

    this.canvasRef = React.createRef();

    this.isDrawing = false;
    this.drawPxMove = 0;
    this.drawStartTime = 0;
    this.drawStartFrequency = 0;
  }

  componentDidMount() {
    // Handling spectrogram image
    const spectrogram = new Image();
    spectrogram.onload = this.renderCanvas;
    spectrogram.src = this.props.spectrogramUrl;

    this.setState({spectrogram});

    document.addEventListener('pointermove', this.onUpdateNewAnnotation);
    document.addEventListener('pointerup', this.onEndNewAnnotation);
  }

  componentDidUpdate() {
    this.renderCanvas();
  }

  componentWillUnmount() {
    document.removeEventListener('pointermove', this.onUpdateNewAnnotation);
    document.removeEventListener('pointerup', this.onEndNewAnnotation);
  }

  initSizes = (wrapper: ?HTMLElement) => {
    if (wrapper) {
      const bounds: ClientRect = wrapper.getBoundingClientRect();
      const canvas: HTMLCanvasElement = this.canvasRef.current;
      const canvasWidth: number = bounds.width - Y_AXIS_SIZE;
      const canvasHeight: number = bounds.height - LABELS_AREA_SIZE - X_AXIS_SIZE;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      this.setState({
        canvasWidth,
        canvasHeight,
        timePxRatio: canvasWidth / this.props.duration,
        freqPxRatio: canvasHeight / this.props.frequencyRange,
      });
    }
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

  renderCanvas = () => {
    const canvas: HTMLCanvasElement = this.canvasRef.current;
    const context: CanvasRenderingContext2D = canvas.getContext('2d');

    // Draw spectro image
    if (this.state.spectrogram) {
      context.drawImage(this.state.spectrogram, 0, 0, canvas.width, canvas.height);
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
      top: LABELS_AREA_SIZE,
    };

    return (
      <div
        className="workbench rounded col-sm-12"
        ref={this.initSizes}
      >
        <canvas
          className="canvas"
          ref={this.canvasRef}
          height={CANVAS_HEIGHT}
          width={CANVAS_WIDTH}
          style={style}
          onClick={this.seekTo}
          onPointerDown={this.onStartNewAnnotation}
        ></canvas>

        {this.props.annotations.map(annotation => this.renderRegion(annotation))}
      </div>
    );
  }

  renderRegion = (ann: Annotation) => {
    const offsetTop: number = LABELS_AREA_SIZE + this.state.canvasHeight - ann.endFrequency * this.state.freqPxRatio;
    const offsetLeft: number = Y_AXIS_SIZE + ann.startTime * this.state.timePxRatio;

    return (
      <Region
        key={ann.id}
        annotation={ann}
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
