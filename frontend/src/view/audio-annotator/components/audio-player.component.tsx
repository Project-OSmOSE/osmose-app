import React, { useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  AudioContext,
  AudioDispatchContext
} from "../../../services/annotator/audio/audio.context.tsx";
import { Annotation } from "../../../interface/annotation.interface.tsx";
import { AnnotatorContext, AnnotatorDispatchContext } from "../../../services/annotator/annotator.context.tsx";

// Heavily inspired from ReactAudioPlayer
// https://github.com/justinmc/react-audio-player

export interface AudioPlayer {
  seek: (time: number) => void;
  play: (annotation?: Annotation) => void;
  pause: () => void;
  setPlaybackRate: (playbackRate?: number) => void;
  canPreservePitch: boolean;
}

export const AudioPlayerComponent = React.forwardRef<AudioPlayer, any>((_, ref: React.ForwardedRef<AudioPlayer>) => {
  const context = useContext(AudioContext);
  const dispatch = useContext(AudioDispatchContext);

  const annotatorContext = useContext(AnnotatorContext);
  const annotatorDispatch = useContext(AnnotatorDispatchContext);

  const elementRef = useRef<HTMLAudioElement | null>(null);

  const [stopTime, setStopTime] = useState<number | undefined>()
  const [listenTrack, setListenTrack] = useState<number | undefined>()

  useEffect(() => {
    onPause()
    return () => onPause()
  }, [])

  useEffect(() => {
    onPause()
    if (elementRef.current) {
      elementRef.current.volume = 1.0;
      elementRef.current.preservesPitch = false;
      elementRef.current.playbackRate = context.playbackRate;
    }
  }, [elementRef.current])

  const seek = (time: number) => {
    console.debug('will seek', time)
    if (elementRef.current) elementRef.current.currentTime = time;
  }
  const play = (annotation?: Annotation) => {
    console.debug('will play', annotation)
    if (annotation && elementRef.current) seek(annotation.startTime)
    elementRef.current?.play().catch(e => {
      annotatorDispatch!({ type: 'setDangerToast', message: `Audio failed playing: ${e}` });
    });
    setStopTime(annotation?.endTime);
  }
  const pause = () => {
    elementRef.current?.pause();
  }
  const setPlaybackRate = (playbackRate?: number) => {
    const rate = playbackRate ?? 1.0;
    if (elementRef.current) elementRef.current.playbackRate = rate;
    dispatch!({ type: 'setPlaybackRate', playbackRate: rate })
  }

  useImperativeHandle(ref, (): AudioPlayer => ({
    seek, play, pause, setPlaybackRate, get canPreservePitch() {
      return elementRef.current?.preservesPitch !== undefined
    }
  }))

  const onPause = () => {
    if (listenTrack) clearInterval(listenTrack)
    setListenTrack(undefined);
    dispatch!({ type: 'onPause' });
  }

  const onPlay = () => {
    if (listenTrack) return;
    setListenTrack(setInterval((() => {
      const time = elementRef.current?.currentTime;
      if (stopTime && time && time > stopTime) pause();
      else dispatch!({ type: 'setTime', time });
    }) as TimerHandler, 10));
    dispatch!({ type: 'onPlay' });
  }

  // title property used to set lockscreen / process audio title on devices
  return (
    <audio autoPlay={ false }
           className="audio-player"
           controls={ false }
           loop={ false }
           muted={ false }
           ref={ elementRef }
           onLoadedMetadata={ () => dispatch!({ type: 'setTime', time: 0 }) }
           onAbort={ onPause }
           onEnded={ onPause }
           onPause={ onPause }
           onPlay={ onPlay }
           preload="auto"
           src={ annotatorContext.audioURL }
           title={ annotatorContext.audioURL }>
      <p>Your browser does not support the <code>audio</code> element.</p>
    </audio>
  );
});
