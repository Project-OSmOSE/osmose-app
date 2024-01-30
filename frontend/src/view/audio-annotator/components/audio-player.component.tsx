import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useAnnotatorService } from "../../../services/annotator/annotator.service.tsx";
import { useAudioContext, useAudioDispatch } from "../../../services/annotator/audio/audio.context.tsx";
import { Annotation } from "../../../interface/annotation.interface.tsx";
import { buildErrorMessage } from "../../../services/annotator/format/format.util.tsx";

// Heavily inspired from ReactAudioPlayer
// https://github.com/justinmc/react-audio-player

export interface AudioPlayer {
  seek: (time: number) => void;
  play: (annotation?: Annotation) => void;
  pause: () => void;
  setPlaybackRate: (playbackRate?: number) => void;
}

export const AudioPlayerComponent = React.forwardRef<AudioPlayer, any>((_, ref: React.ForwardedRef<AudioPlayer>) => {
  const context = useAudioContext();
  const dispatch = useAudioDispatch();

  const elementRef = useRef<HTMLAudioElement | null>(null);

  const { context: annotatorContext, toasts } = useAnnotatorService();
  const [stopTime, setStopTime] = useState<number | undefined>()
  const [listenTrack, setListenTrack] = useState<number | undefined>()

  useEffect(() => {
    return () => onPause()
  }, [])

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.volume = 1.0;
      elementRef.current.preservesPitch = false;
      elementRef.current.playbackRate = context.playbackRate;
    }
  }, [elementRef.current])

  const seek = (time: number) => {
    if (elementRef.current) elementRef.current.currentTime = time;
  }
  const play = (annotation?: Annotation) => {
    if (annotation && elementRef.current) elementRef.current.currentTime = annotation.startTime;
    elementRef.current?.play().catch(e => {
      toasts.setDanger(buildErrorMessage(e));
    });
    setStopTime(annotation?.endTime);
  }
  const pause = () => {
    elementRef.current?.pause();
  }
  const setPlaybackRate = (playbackRate?: number) => {
    const rate = playbackRate ?? 1.0;
    if (elementRef.current) elementRef.current.playbackRate = rate;
    dispatch!({type: 'setPlaybackRate', playbackRate: rate})
  }

  useImperativeHandle(ref, (): AudioPlayer => ({ seek, play, pause, setPlaybackRate }))

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
           src={ annotatorContext.task?.audioUrl }
           title={ annotatorContext.task?.audioUrl }>
      <p>Your browser does not support the <code>audio</code> element.</p>
    </audio>
  );
});
