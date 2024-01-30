import { Context, createContext, Dispatch, useContext } from "react";


export interface AudioCtx {
  time: number;
  stopTime?: number;
  playbackRate: number;
  src?: string;
  isPaused: boolean;
  canPreservePitch: boolean;
}

export type AudioCtxAction =
  { type: 'setElement', element: HTMLAudioElement | null, forSrc?: string } |
  { type: 'removeElement' } |
  { type: 'onPlay' } |
  { type: 'onPause' } |
  { type: 'setTime', time?: number } |
  { type: 'setPlaybackRate', playbackRate: number };

export const AudioCtxInitialValue: AudioCtx = {
  time: 0,
  playbackRate: 1.0,
  isPaused: true,
  canPreservePitch: false
}

export const AudioContext: Context<AudioCtx> = createContext<AudioCtx>(AudioCtxInitialValue);
export const AudioDispatchContext: Context<Dispatch<AudioCtxAction> | undefined> = createContext<Dispatch<AudioCtxAction> | undefined>(undefined);

export const useAudioContext = () => useContext(AudioContext);
export const useAudioDispatch = () => useContext(AudioDispatchContext);

