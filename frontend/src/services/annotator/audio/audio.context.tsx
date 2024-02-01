import { Context, createContext, Dispatch } from "react";


export interface AudioCtx {
  time: number;
  stopTime?: number;
  playbackRate: number;
  isPaused: boolean;
  canPreservePitch: boolean;
}

export type AudioCtxAction =
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
