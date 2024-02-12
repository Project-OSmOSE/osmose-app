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

  const [ stopTime, setStopTime ] = useState<number | undefined>()

  useEffect(() => {
    const interval = setInterval(() => {
      if (!elementRef.current || elementRef.current?.paused) return;

      const time = elementRef.current?.currentTime;
      if (stopTime && time && time > stopTime) player.pause();
      else dispatch!({ type: 'setTime', time });
    }, 1 / 30) // 1/30 is the more common video FPS os it should be enough to update currentTime in view

    return () => clearInterval(interval)
  }, [ annotatorContext.taskId ]);

  useEffect(() => {
    dispatch!({ type: 'onPause' })
    if (elementRef.current) {
      elementRef.current.volume = 1.0;
      elementRef.current.preservesPitch = false;
      elementRef.current.playbackRate = context.playbackRate;
    }
  }, [ elementRef.current ])

  const player: AudioPlayer = {
    seek(time: number) {
      if (!elementRef.current) return;
      elementRef.current.currentTime = time;
      dispatch!({ type: 'setTime', time });
    },
    play(annotation?: Annotation) {
      if (annotation && elementRef.current) player.seek(annotation.startTime)
      elementRef.current?.play().catch(e => {
        annotatorDispatch!({ type: 'setDangerToast', message: `Audio failed playing: ${ e }` });
      });
      setStopTime(annotation?.endTime);
    },
    pause() {
      elementRef.current?.pause();
    },
    setPlaybackRate(playbackRate?: number) {
      const rate = playbackRate ?? 1.0;
      if (elementRef.current) elementRef.current.playbackRate = rate;
      dispatch!({ type: 'setPlaybackRate', playbackRate: rate })
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
           onLoadedMetadata={ () => dispatch!({ type: 'setTime', time: 0 }) }
           onAbort={ () => dispatch!({ type: 'onPause' }) }
           onEnded={ () => dispatch!({ type: 'onPause' }) }
           onPause={ () => dispatch!({ type: 'onPause' }) }
           onPlay={ () => dispatch!({ type: 'onPlay' }) }
           preload="auto"
           src={ annotatorContext.audioURL }
           title={ annotatorContext.audioURL }>
      <p>Your browser does not support the <code>audio</code> element.</p>
    </audio>
  );
});
