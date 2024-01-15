import { useAudioContext, useAudioDispatch } from "./audio.context.tsx";

export const useAudioService = () => {
  const context = useAudioContext();

  return {
    context,
    dispatch: useAudioDispatch(),
    playPause: () => context.element?.paused ? context.element?.play() : context.element?.pause(),
    setPlaybackRate: (rate: number) => {
      if (!context.element) return;
      context.element.playbackRate = rate;
    }
  }
}