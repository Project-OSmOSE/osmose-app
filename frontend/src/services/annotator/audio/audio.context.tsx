import { Context, createContext, Dispatch, useContext } from "react";
import { AudioPlayStatus } from "../../../enum";


export interface AudioCtx {
  time: number;
  state: AudioPlayStatus;
  element?: HTMLAudioElement;
}
type AudioCtxActionType = 'element' | 'state' | 'time';
export interface AudioCtxAction {
  type: AudioCtxActionType;
  element?: HTMLAudioElement;
  newState?: AudioPlayStatus;
  newTime?: number;
}

export const AudioCtxInitialValue: AudioCtx = {
  time: 0,
  state: AudioPlayStatus.pause,
}

export const AudioContext: Context<AudioCtx> = createContext<AudioCtx>(AudioCtxInitialValue);
export const AudioDispatchContext: Context<Dispatch<AudioCtxAction> | undefined> = createContext<Dispatch<AudioCtxAction> | undefined>(undefined);

export const useAudioContext = () => useContext(AudioContext);
export const useAudioDispatch = () => useContext(AudioDispatchContext);

