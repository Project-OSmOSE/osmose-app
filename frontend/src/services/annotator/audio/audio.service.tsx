import { useAudioContext, useAudioDispatch } from "./audio.context.tsx";
import { Annotation } from "../../../interface/annotation.interface.tsx";

export const useAudioService = () => {
  const context = useAudioContext();
  const dispatch = useAudioDispatch();

  const seek = (time: number) => {
    if (!context.element) return;
    context.element.currentTime = time;
  }
  const play = () => {
    context.element?.play();
    dispatch!({ type: "stopTime", stopTime: undefined });
  }
  const pause = () => context.element?.pause()
  return {
    context,
    dispatch,
    playPause: () => context.element?.paused ? play() : pause(),
    setPlaybackRate: (rate: number) => {
      if (!context.element) return;
      context.element.playbackRate = rate;
    },
    seek,
    play,
    playAnnotation: (annotation: Annotation) => {
      seek(annotation.startTime);
      context.element?.play();
      dispatch!({ type: "stopTime", stopTime: annotation.endTime });
    },
    pause,
  }
}