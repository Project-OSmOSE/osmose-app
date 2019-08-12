// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import request from 'superagent';

import AudioPlayer from './AudioPlayer';

import './css/font-awesome-4.7.0.min.css';
import './css/annotator.css';

if (!process.env.REACT_APP_API_URL) throw new Error('REACT_APP_API_URL missing in env');
const API_URL = process.env.REACT_APP_API_URL + '/annotation-task';

type AnnotationTask = {
  annotationTags: Array<string>,
  boundaries: {
    startTime: string,
    endTime: string,
    startFrequency: number,
    endFrequency: number,
  },
  audioUrl: string,
  spectroUrls: {
    keys: Array<string>,
    urls: Array<string>,
  },
};

type AudioAnnotatorProps = {
  match: {
    params: {
      annotation_task_id: number
    },
  },
  app_token: string,
};

type AudioAnnotatorState = {
  isLoading: boolean,
  isPlaying: boolean,
  error: ?string,
  currentTime: number,
  duration: number,
  progress: number,
  task: ?AnnotationTask,
};

class AudioAnnotator extends Component<AudioAnnotatorProps, AudioAnnotatorState> {
  audioContext: AudioContext;
  audioPlayer: AudioPlayer;

  canvasRef: any;

  constructor(props: AudioAnnotatorProps) {
    super(props);

    this.state = {
      isLoading: true,
      isPlaying: false,
      error: undefined,
      currentTime: 0,
      duration: 0,
      progress: 0,
      task: undefined,
    };

    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    const taskId: number = this.props.match.params.annotation_task_id;

    // Retrieve current task
    request.get(API_URL + '/' + taskId.toString())
      .set('Authorization', 'Bearer ' + this.props.app_token)
      .then(result => {
        this.setState({
          task: result.body.task,
          isLoading: false,
          error: undefined,
        });
      })
      .catch(err => {
        if (err.status && err.status === 401) {
          // Server returned 401 which means token was revoked
          document.cookie = 'token=;max-age=0';
          window.location.reload();
        } else {
          this.setState({isLoading: false, error: this.buildErrorMessage(err)});
        }
      });
  }

  buildErrorMessage = (err: any) => {
    return 'Status: ' + err.status.toString() +
      ' - Reason: ' + err.message +
      (err.response.body.title ? ` - ${err.response.body.title}` : '') +
      (err.response.body.detail ? ` - ${err.response.body.detail}` : '');
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

    // Temporary grey background
    context.fillStyle = 'rgba(200, 200, 200)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Progress bar
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
      return <p>Loading...</p>;
    } else if (this.state.error) {
      return <p>Error while loading task: <code>{this.state.error}</code></p>
    } else if (!this.state.task) {
      return <p>Unknown error while loading task.</p>
    } else {
      return (
        <div className="annotator" ref={this.initSize}>
          <p><Link to={'/audio-annotator/legacy/' + this.props.match.params.annotation_task_id}>
            <button className="btn btn-submit" type="button">Switch to old annotator</button>
          </Link></p>

          <AudioPlayer
            // controls
            listenInterval={10}
            onListen={(seconds) => this.updateProgress(seconds)}
            onLoadedMetadata={() => this.updateProgress(0)}
            preload="auto"
            ref={(element) => { if (element) this.audioPlayer = element; } }
            src={this.state.task.audioUrl}
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
