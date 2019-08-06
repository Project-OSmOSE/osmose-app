// @flow
import React, { Component } from 'react';

import AudioPlayer from './AudioPlayer';

import './css/font-awesome-4.7.0.min.css';
import './css/annotator.css';

type AudioAnnotatorProps = {
  match: {
    params: {
      annotation_task_id: number
    },
  },
  app_token: string,
  src: string,
};

type AudioAnnotatorState = {
  isLoading: boolean,
  isPlaying: boolean,
  currentTime: number,
  duration: number,
  progress: number,
};

class AudioAnnotator extends Component<AudioAnnotatorProps, AudioAnnotatorState> {
  audioContext: AudioContext;
  audioPlayer: AudioPlayer;

  canvasRef: any;

  constructor(props: AudioAnnotatorProps) {
    super(props);

    this.state = {
      isLoading: false,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      progress: 0,
    };

    this.canvasRef = React.createRef();
  }

  initSize = (element: ?HTMLElement) => {
    if (element) {
      const bounds: ClientRect = element.getBoundingClientRect();

      const canvas: HTMLCanvasElement = this.canvasRef.current;
      canvas.height = bounds.height - 20;
      canvas.width = bounds.width;
    }
  }

  playPause = () => {
    if (this.audioPlayer.audioElement.paused) {
      this.setState({isPlaying: true});
      this.audioPlayer.audioElement.play();
    } else {
      this.setState({isPlaying: false});
      this.audioPlayer.audioElement.pause();
    }
  }

  updateProgress = (seconds: number) => {
    const progress = seconds / this.audioPlayer.audioElement.duration;
    this.setState({
      currentTime: seconds,
      duration: this.audioPlayer.audioElement.duration,
      progress,
    });

    this.renderCanvas();
  }

  renderCanvas = () => {
    const canvas: HTMLCanvasElement = this.canvasRef.current;
    const context: CanvasRenderingContext2D = canvas.getContext('2d');

    context.fillStyle = 'rgba(200, 200, 200)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const newX: number = Math.floor(this.state.progress * canvas.width);
    context.fillStyle = 'rgba(0, 0, 0)';
    context.fillRect(newX, 0, 1, canvas.height);
  }

  strPad = (nb: number) => {
    if (nb < 10) {
      return '0' + nb.toFixed(0);
    } else {
      return nb.toFixed(0);
    }
  }

  formatTimestamp = (rawSeconds: number) => {
    const hours: number = Math.floor(rawSeconds / 3600);
    const minutes: number = Math.floor(rawSeconds / 60) % 60;
    const seconds: number = Math.floor(rawSeconds) % 60;
    const ms: number = rawSeconds - seconds;

    return this.strPad(hours) + ':'
      + this.strPad(minutes) + ':'
      + this.strPad(seconds) + '.'
      + ms.toFixed(3).substring(2);
  }

  render() {
    const playStatusClass = this.state.isPlaying ? "fa-pause-circle" : "fa-play-circle";
    
    if (this.state.isLoading) {
      return <p>Chargement en cours</p>;
    } else {
      return (
        <div className="annotator" ref={this.initSize}>
          <AudioPlayer
            // controls
            listenInterval={10}
            onListen={(seconds) => this.updateProgress(seconds)}
            onLoadedMetadata={() => this.updateProgress(0)}
            preload="auto"
            ref={(element) => { if (element) this.audioPlayer = element; } }
            src={this.props.src}
          ></AudioPlayer>

          <canvas
            width="600" height="200"
            ref={this.canvasRef}
            className="canvas"
          ></canvas>

          <div className="controls">
            <button
              className={`btn-play fa ${playStatusClass}`}
              onClick={this.playPause}
            ></button>

            <p className="timestamps">
              {this.formatTimestamp(this.state.currentTime)}
              /
              {this.formatTimestamp(this.state.duration)}
            </p>
          </div>
        </div>
      );
    }
  }
}

export default AudioAnnotator;
