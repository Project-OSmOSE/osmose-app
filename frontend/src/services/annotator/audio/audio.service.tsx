import { AudioCtx, AudioCtxAction, useAudioContext, useAudioDispatch } from "./audio.context.tsx";
import { Annotation } from "../../../interface/annotation.interface.tsx";
import { Dispatch, useEffect } from "react";
import { AudioPlayStatus } from "../../../enum/audio.enum.tsx";

export class AudioService {
  context?: AudioCtx;
  private listenTrack?: number;

  get currentTime(): number {
    return this.context?.time ?? 0;
  }

  get playbackRate(): number {
    return this.context?.playbackRate ?? 1.0;
  }

  get isPaused(): boolean {
    return this.context?.state === AudioPlayStatus.pause;
  }

  get canPreservePitch(): boolean {
    return !!this.context?.element?.preservesPitch;
  }

  constructor(private dispatch: Dispatch<AudioCtxAction>) {
  }

  public setElement(element: HTMLAudioElement | null, forSrc?: string): void {
    if (this.context?.src === forSrc && this.context?.element) return;
    this.dispatch({ type: "element", element: element ?? undefined, forSrc });
    if (!element) return;
    element.volume = 1.0;
    element.preservesPitch = false; // Do not preserve pitch when changing playback rate
    element.playbackRate = this.playbackRate;
  }

  public removeElement(): void {
    this.dispatch({ type: "element", element: undefined, forSrc: undefined });
    this.dispatch({ type: "time", time: undefined });
  }

  public onPause(): void {
    this.dispatch({ type: "state", state: AudioPlayStatus.pause });
    this.clearListenTrack();
  }

  public onPlay(): void {
    this.dispatch({ type: "state", state: AudioPlayStatus.play });
    this.setListenTrack();
  }

  public updateCurrentTime(time: number): void {
    this.dispatch({ type: 'time', time })
  }

  public playPause(): void {
    if (this.context?.element?.paused) this.play();
    else this.pause()
  }

  public play(annotation?: Annotation): void {
    if (annotation) {
      this.seek(annotation.startTime);
      this.dispatch({ type: "stopTime", stopTime: annotation.endTime });
    } else this.dispatch({ type: "stopTime", stopTime: undefined });
    this.context?.element?.play();
  }

  public pause(): void {
    this.context?.element?.pause();
  }

  public seek(time: number): void {
    if (!this.context?.element) return;
    this.context.element.currentTime = time;
  }

  public setPlaybackRate(rate: number) {
    if (!this.context?.element) return;
    this.context.element.playbackRate = rate;
    this.dispatch({ type: "playbackRate", playbackRate: rate });
  }

  private setListenTrack(): void {
    if (this.listenTrack) return;
    const listenInterval = 10;
    this.listenTrack = setInterval((() => {
      const time = this.context?.element?.currentTime;
      if (this.context?.stopTime && time && time > this.context?.stopTime) this.pause();
      else this.dispatch({ type: 'time', time });
    }) as TimerHandler, listenInterval);
  }

  private clearListenTrack(): void {
    if (!this.listenTrack) return;
    clearInterval(this.listenTrack);
    delete this.listenTrack;
  }
}

export const useAudioService = (): AudioService => {
  const context = useAudioContext();
  const dispatch = useAudioDispatch();
  const service = new AudioService(dispatch!);

  useEffect(() => {
    service.context = context;
  }, [context])

  return service;
}