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
  playbackRate: number,
  preload: string,
  src: string,
  style: any,
  title: any,
  volume: number,
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
    playbackRate: 1.0,
    preload: 'metadata',
    style: {},
    title: '',
    volume: 1.0,
  };

  componentDidMount() {
    this.updateVolume(this.props.volume);
    this.updatePlaybackRate(this.props.playbackRate);

    // Do not preserve pitch when changing playback rate (experimental, so prevent flow errors)
    // $FlowFixMe
    if (this.audioElement.mozPreservesPitch !== undefined) {
      // $FlowFixMe
      this.audioElement.mozPreservesPitch = false;
    }
  }

  componentDidUpdate(prevProps: AudioPlayerProps) {
    if (this.props.volume !== prevProps.volume) {
      this.updateVolume(this.props.volume);
    }
    if (this.props.playbackRate !== prevProps.playbackRate) {
      this.updatePlaybackRate(this.props.playbackRate);
    }
  }

  onAbort = (e: SyntheticEvent<HTMLAudioElement>) => {
    // When unloading the audio player (switching to another src)
    this.clearListenTrack();
    this.props.onAbort(e);
  }

  onPause = (e: SyntheticEvent<HTMLAudioElement>) => {
    // When the user pauses playback
    this.clearListenTrack();
    this.props.onPause(e);
  }

  onPlay = (e: SyntheticEvent<HTMLAudioElement>) => {
    // When audio play starts
    this.setListenTrack();
    this.props.onPlay(e);
  }

  onEnded = (e: SyntheticEvent<HTMLAudioElement>) => {
    // When the file has finished playing to the end
    this.clearListenTrack();
    this.props.onEnded(e);
  }

  componentWillUnmount() {
    this.clearListenTrack();
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

  updatePlaybackRate(rate: number) {
    if (typeof rate === 'number' && rate !== this.audioElement.playbackRate) {
      this.audioElement.playbackRate = rate;
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
        onAbort={this.onAbort}
        onCanPlay={this.props.onCanPlay}
        onCanPlayThrough={this.props.onCanPlayThrough}
        onEnded={this.onEnded}
        onError={this.props.onError}
        onLoadedMetadata={this.props.onLoadedMetadata}
        onPause={this.onPause}
        onPlay={this.onPlay}
        onSeeked={this.props.onSeeked}
        onVolumeChange={this.props.onVolumeChanged}
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
