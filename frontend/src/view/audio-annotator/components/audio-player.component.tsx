import React, { useEffect, useState } from 'react';
import { useAudioService } from "../../../services/annotator/audio";
import { AudioPlayStatus } from "../../../enum/audio.enum.tsx";
import { useAnnotatorService } from "../../../services/annotator/annotator.service.tsx";

// Heavily inspired from ReactAudioPlayer
// https://github.com/justinmc/react-audio-player


export const AudioPlayer: React.FC = () => {
  const [timeUpdateInterval, setTimeUpdateInterval] = useState<any>();

  const { context, dispatch } = useAudioService();
  const { context: annotatorContext } = useAnnotatorService();

  useEffect(() => {
    if (context.element) {
      context.element.volume = 1.0;
      // Do not preserve pitch when changing playback rate
      context.element.preservesPitch = false;
    }

    return () => {
      _clearListenTrack();
    }
  }, [])

  useEffect(() => {
    if (!context.element) return;
    context.element.volume = 1.0
    // Do not preserve pitch when changing playback rate
    context.element.preservesPitch = false;
    context.element.playbackRate = 1.0;
  }, [context.element])

  useEffect(() => {
    if (!context.element) return;
    context.element.volume = 1.0
    // Do not preserve pitch when changing playback rate
    context.element.preservesPitch = false;
    context.element.playbackRate = 1.0;
  }, [context.element])

  const _onAbort = () => {
    // When unloading the audio player (switching to another src)
    _clearListenTrack();
    dispatch!({ type: 'state', state: AudioPlayStatus.pause });
  }

  const _onPause = () => {
    // When the user pauses playback
    _clearListenTrack();
    dispatch!({ type: 'state', state: AudioPlayStatus.pause });
  }

  const _onPlay = () => {
    // When audio play starts
    _setListenTrack();
    dispatch!({ type: 'state', state: AudioPlayStatus.play });
  }

  const _onEnded = () => {
    // When the file has finished playing to the end
    _clearListenTrack();
    dispatch!({ type: 'state', state: AudioPlayStatus.pause });
  }

  /**
   * Set an interval to call props.onListen every listenInterval time period
   */
  const _setListenTrack = () => {
    if (timeUpdateInterval) return;
    const listenInterval = 10;
    setTimeUpdateInterval(setInterval(() => {
      const time = context.element?.currentTime;
      if (context.stopTime && time && time > context.stopTime) context.element?.pause();
      else dispatch!({type: 'time', time});
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


  // title property used to set lockscreen / process audio title on devices
  return (
    <audio autoPlay={ false }
           className="audio-player"
           controls={ false }
           loop={ false }
           muted={ false }
           onAbort={ _onAbort }
           onEnded={ _onEnded }
           onLoadedMetadata={ () => dispatch!({ type: 'time', time: 0 }) }
           onPause={ _onPause }
           onPlay={ _onPlay }
           preload="auto"
           ref={ e => dispatch!({ type: 'element', element: e ?? undefined }) }
           src={ annotatorContext.task?.audioUrl }
           title={ annotatorContext.task?.audioUrl }>
      <p>Your browser does not support the <code>audio</code> element.</p>
    </audio>
  );
}
