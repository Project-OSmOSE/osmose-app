import { MutableRefObject, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/slices/app.ts";
import { AudioActions } from "@/slices/annotator/audio.ts";
import { AnnotatorActions } from "@/slices/annotator/global-annotator.ts";
import { AnnotationResult } from '@/service/campaign/result';

export const useAudioService = (player: MutableRefObject<HTMLAudioElement | null>) => {
  // Data
  const {
    isPaused
  } = useAppSelector(state => state.annotator.audio);
  const dispatch = useAppDispatch();

  // Ref
  const _isPaused = useRef<boolean>(isPaused)
  useEffect(() => {
    _isPaused.current = isPaused
  }, [ isPaused ]);

  // Methods

  function seek(time: number | null) {
    if (!player.current || time === null) return;
    player.current.currentTime = time;
    dispatch(AudioActions.setTime(time))
  }

  function play(annotation?: AnnotationResult) {
    if (annotation && player.current) seek(annotation.start_time)
    player.current?.play().catch(e => {
      dispatch(AnnotatorActions.setDangerToast(`Audio failed playing: ${ e }`))
    });
    if (annotation) dispatch(AudioActions.setStopTime(annotation.end_time))
  }

  function pause() {
    player.current?.pause();
  }

  function _setPlaybackRate(playbackRate?: number) {
    const rate = playbackRate ?? 1.0;
    if (player.current) player.current.playbackRate = rate;
    dispatch(AudioActions.setPlaybackRate(rate))
  }

  function playPause(annotation?: AnnotationResult) {
    try {
      if (_isPaused.current) play(annotation);
      else pause();
    } catch (e) {
      console.warn(e);
    }
  }

  return { seek, play, pause, setPlaybackRate: _setPlaybackRate, playPause }
}