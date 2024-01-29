import { Context, createContext, Dispatch, useContext } from "react";
import { AudioPlayStatus } from "../../../enum/audio.enum.tsx";


export interface AudioCtx {
  time: number;
  state: AudioPlayStatus;
  element?: HTMLAudioElement;
  stopTime?: number;
  playbackRate?: number;
  src?: string;
}

export type AudioCtxAction =
  { type: 'element', element?: HTMLAudioElement, forSrc?: string } |
  { type: 'playbackRate', playbackRate: number } |
  { type: 'state', state: AudioPlayStatus } |
  { type: 'time', time?: number } |
  { type: 'stopTime', stopTime?: number };

export const AudioCtxInitialValue: AudioCtx = {
  time: 0,
  state: AudioPlayStatus.pause,
}

export const AudioContext: Context<AudioCtx> = createContext<AudioCtx>(AudioCtxInitialValue);
export const AudioDispatchContext: Context<Dispatch<AudioCtxAction> | undefined> = createContext<Dispatch<AudioCtxAction> | undefined>(undefined);

export const useAudioContext = () => useContext(AudioContext);
export const useAudioDispatch = () => useContext(AudioDispatchContext);

