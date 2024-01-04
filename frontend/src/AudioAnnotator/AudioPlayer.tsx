import React, { useEffect, useState } from 'react';

// Heavily inspired from ReactAudioPlayer
// https://github.com/justinmc/react-audio-player

type AudioPlayerProps = {
  onAbort: () => void;
  onEnded: () => void;
  onError?: (error: any) => void;
  onListen: (seconds: number) => void;
  onPause: () => void;
  onPlay: () => void;
  onLoadedMetadata: () => void;
  playbackRate: number;
  src: string;
};

const AudioPlayer: React.ForwardRefRenderFunction<HTMLAudioElement, AudioPlayerProps> = ({
                                                   onAbort,
                                                   onEnded,
                                                   onError,
                                                   onListen,
                                                   onPause,
                                                   onPlay,
                                                   onLoadedMetadata,
                                                   src,
                                                   playbackRate,
                                                 }, ref) => {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>();
  const [timeUpdateInterval, setTimeUpdateInterval] = useState<any>();

  // static defaultProps = {
  //   playbackRate: 1.0,
  // };

  useEffect(() => {
    if (audioElement) {
      audioElement.volume = 1.0;
      // Do not preserve pitch when changing playback rate
      audioElement.preservesPitch = false;
      _updatePlaybackRate(playbackRate ?? 1.0);
    }

    return () => {
      _clearListenTrack();
    }
  }, [])

  useEffect(() => {
    if (!audioElement) return;
    _updatePlaybackRate(playbackRate ?? 1.0);
  }, [playbackRate,])

  const _onAbort = () => {
    // When unloading the audio player (switching to another src)
    _clearListenTrack();
    onAbort();
  }

  const _onPause = () => {
    // When the user pauses playback
    _clearListenTrack();
    onPause();
  }

  const _onPlay = () => {
    // When audio play starts
    _setListenTrack();
    onPlay();
  }

  const _onEnded = () => {
    // When the file has finished playing to the end
    _clearListenTrack();
    onEnded();
  }

  /**
   * Set an interval to call props.onListen every listenInterval time period
   */
  const _setListenTrack = () => {
    if (timeUpdateInterval) return;
    const listenInterval = 10;
    setTimeUpdateInterval(setInterval(() => {
      onListen(audioElement?.currentTime ?? 0);
    }, listenInterval));
  }

  /**
   * Clear the onListen interval
   */
  const _clearListenTrack = () => {
    if (!timeUpdateInterval) return;
    clearInterval(timeUpdateInterval);
    setTimeUpdateInterval(null);
  }

  const _updatePlaybackRate = (rate: number) => {
    if (!audioElement || rate === audioElement.playbackRate) return;
    audioElement.playbackRate = rate;
  }


  // title property used to set lockscreen / process audio title on devices
  return (
    <audio autoPlay={ false }
           className="audio-player"
           controls={ false }
           loop={ false }
           muted={ false }
           onAbort={ _onAbort }
           onEnded={ _onEnded }
           onError={ onError }
           onLoadedMetadata={ onLoadedMetadata }
           onPause={ _onPause }
           onPlay={ _onPlay }
           preload="auto"
           ref={ e => {
             setAudioElement(e);
             if (typeof ref === 'function') {
               ref(e);
             } else if (ref) {
               ref.current = e;
             }
           } }
           src={ src }
           title={ src }>
      <p>Your browser does not support the <code>audio</code> element.</p>
    </audio>
  );
}

export default React.forwardRef(AudioPlayer);
