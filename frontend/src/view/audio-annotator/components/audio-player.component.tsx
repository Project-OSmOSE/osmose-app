import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Annotation } from "@/types/annotations.ts";
import { useAppSelector, useAppDispatch } from "@/slices/app";
import { setDangerToast } from "@/slices/annotator/global-annotator.ts";
import { onPause, onPlay, setPlaybackRate, setTime } from "@/slices/annotator/audio.ts";

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

  const {
    task,
  } = useAppSelector(state => state.annotator.global);
  const {
    playbackRate
  } = useAppSelector(state => state.annotator.audio);
  const dispatch = useAppDispatch();

  const elementRef = useRef<HTMLAudioElement | null>(null);

  const [ stopTime, setStopTime ] = useState<number | undefined>()

  useEffect(() => {
    const interval = setInterval(() => {
      if (!elementRef.current || elementRef.current?.paused) return;

      const time = elementRef.current?.currentTime;
      if (stopTime && time && time > stopTime) player.pause();
      else dispatch(setTime(time))
    }, 1 / 30) // 1/30 is the more common video FPS os it should be enough to update currentTime in view

    return () => clearInterval(interval)
  }, [ task.id ]);

  useEffect(() => {
    dispatch(onPause())
    if (elementRef.current) {
      elementRef.current.volume = 1.0;
      elementRef.current.preservesPitch = false;
      elementRef.current.playbackRate = playbackRate;
    }
  }, [ elementRef.current ])

  const player: AudioPlayer = {
    seek(time: number) {
      if (!elementRef.current) return;
      elementRef.current.currentTime = time;
      dispatch(setTime(time))
    },
    play(annotation?: Annotation) {
      if (annotation && elementRef.current) player.seek(annotation.startTime)
      elementRef.current?.play().catch(e => {
        dispatch(setDangerToast(`Audio failed playing: ${ e }`))
      });
      setStopTime(annotation?.endTime);
    },
    pause() {
      elementRef.current?.pause();
    },
    setPlaybackRate(playbackRate?: number) {
      const rate = playbackRate ?? 1.0;
      if (elementRef.current) elementRef.current.playbackRate = rate;
      dispatch(setPlaybackRate(rate))
    },
    get canPreservePitch() {
      return elementRef.current?.preservesPitch !== undefined
    }
  }

  useImperativeHandle(ref, (): AudioPlayer => player)

  // title property used to set lockscreen / process audio title on devices
  return (
    <audio autoPlay={ false }
           className="audio-player"
           controls={ false }
           loop={ false }
           muted={ false }
           ref={ elementRef }
           onLoadedMetadata={ () => dispatch(setTime(0)) }
           onAbort={ () => dispatch(onPause()) }
           onEnded={ () => dispatch(onPause()) }
           onPause={ () => dispatch(onPause()) }
           onPlay={ () => dispatch(onPlay()) }
           preload="auto"
           src={ task.audioUrl }
           title={ task.audioUrl }>
      <p>Your browser does not support the <code>audio</code> element.</p>
    </audio>
  );
});
