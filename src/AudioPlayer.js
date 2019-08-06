// @flow
import * as React from 'react';

// Heavily inspired from ReactAudioPlayer
// https://github.com/justinmc/react-audio-player

type AudioPlayerProps = {
  autoPlay: boolean,
  children: React.Node,
  className: string,
  controls: boolean,
  controlsList: string,
  crossOrigin: ?string,
  id: string,
  listenInterval: number,
  loop: boolean,
  muted: boolean,
  onAbort: any,
  onCanPlay: any,
  onCanPlayThrough: any,
  onEnded: any,
  onError: any,
  onListen: any,
  onPause: any,
  onPlay: any,
  onSeeked: any,
  onVolumeChanged: any,
  onLoadedMetadata: any,
  preload: string,
  src: string,
  style: any,
  title: any,
  volume: number
};

class AudioPlayer extends React.Component<AudioPlayerProps> {

  // audioContext: AudioContext;
  audioElement: HTMLAudioElement;
  listenTracker: any;

  static defaultProps = {
    autoPlay: false,
    children: null,
    className: '',
    controls: false,
    controlsList: '',
    crossOrigin: null,
    id: '',
    listenInterval: 10000,
    loop: false,
    muted: false,
    onAbort: () => {},
    onCanPlay: () => {},
    onCanPlayThrough: () => {},
    onEnded: () => {},
    onError: () => {},
    onListen: () => {},
    onPause: () => {},
    onPlay: () => {},
    onSeeked: () => {},
    onVolumeChanged: () => {},
    onLoadedMetadata: () => {},
    preload: 'metadata',
    src: null,
    style: {},
    title: '',
    volume: 1.0,
  };

  componentDidMount() {
    const audio = this.audioElement;

    this.updateVolume(this.props.volume);

    audio.addEventListener('error', (e: ProgressEvent) => {
      this.props.onError(e);
    });

    // When enough data has been downloaded to start playing the file
    audio.addEventListener('canplay', (e) => {
      this.props.onCanPlay(e);
    });

    // When enough data has been downloaded to play the entire file
    audio.addEventListener('canplaythrough', (e) => {
      this.props.onCanPlayThrough(e);
    });

    // When audio play starts
    audio.addEventListener('play', (e) => {
      this.setListenTrack();
      this.props.onPlay(e);
    });

    // When unloading the audio player (switching to another src)
    audio.addEventListener('abort', (e: ProgressEvent) => {
      this.clearListenTrack();
      this.props.onAbort(e);
    });

    // When the file has finished playing to the end
    audio.addEventListener('ended', (e) => {
      this.clearListenTrack();
      this.props.onEnded(e);
    });

    // When the user pauses playback
    audio.addEventListener('pause', (e) => {
      this.clearListenTrack();
      this.props.onPause(e);
    });

    // When the user drags the time indicator to a new time
    audio.addEventListener('seeked', (e) => {
      this.props.onSeeked(e);
    });

    audio.addEventListener('loadedmetadata', (e) => {
      this.props.onLoadedMetadata(e);
    });

    audio.addEventListener('volumechange', (e) => {
      this.props.onVolumeChanged(e);
    });
  }

  componentDidUpdate(prevProps: AudioPlayerProps) {
    if (this.props.volume !== prevProps.volume) {
      this.updateVolume(this.props.volume);
    }
  }

  /**
   * Set an interval to call props.onListen every props.listenInterval time period
   */
  setListenTrack() {
    if (!this.listenTracker) {
      const listenInterval = this.props.listenInterval;
      this.listenTracker = setInterval(() => {
        this.props.onListen(this.audioElement.currentTime);
      }, listenInterval);
    }
  }

  /**
   * Clear the onListen interval
   */
  clearListenTrack() {
    if (this.listenTracker) {
      clearInterval(this.listenTracker);
      this.listenTracker = null;
    }
  }

  /**
   * Set the volume on the audio element from props
   * @param {Number} volume 
   */
  updateVolume(volume: number) {
    if (typeof volume === 'number' && volume !== this.audioElement.volume) {
      this.audioElement.volume = volume;
    }
  }

  render() {
    const incompatibilyMessage = this.props.children || (
      <p>Your browser does not support the <code>audio</code> element.</p>
    );

    // Set controls to be true by default unless explicitly stated otherwise
    const controls = !(this.props.controls === false);

    // Set lockscreen / process audio title on devices
    const title = this.props.title ? this.props.title : this.props.src;

    // Some props should only be added if specified
    const conditionalProps = {};
    if (this.props.controlsList) {
      conditionalProps.controlsList = this.props.controlsList;
    }

    return (
      <audio
        autoPlay={this.props.autoPlay}
        className={`audio-player ${this.props.className}`}
        controls={controls}
        crossOrigin={this.props.crossOrigin}
        id={this.props.id}
        loop={this.props.loop}
        muted={this.props.muted}
        onPlay={this.props.onPlay}
        preload={this.props.preload}
        ref={(ref) => { if (ref) this.audioElement = ref; }}
        src={this.props.src}
        style={this.props.style}
        title={title}
        {...conditionalProps}
      >
        {incompatibilyMessage}
      </audio>
    );
  }
}

export default AudioPlayer;
