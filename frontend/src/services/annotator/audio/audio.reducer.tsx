import { FC, ReactNode, Reducer, useReducer } from "react";
import {
  AudioContext,
  AudioDispatchContext,
  AudioCtx,
  AudioCtxAction,
  AudioCtxInitialValue
} from "./audio.context.tsx";

const audioReducer: Reducer<AudioCtx, AudioCtxAction> = (currentContext: AudioCtx, action: AudioCtxAction): AudioCtx => {
  switch (action.type) {
    case 'onPlay':
      return {...currentContext, isPaused: false}
    case 'onPause':
      return {...currentContext, isPaused: true}

    case 'setTime':
      return {...currentContext, time: action.time ?? 0}
    case 'setPlaybackRate':
      return {...currentContext, playbackRate: action.playbackRate}

    default:
      return currentContext;
  }
}


export const ProvideAudio: FC<{ children?: ReactNode }> = ({children}) => {
  const [ task, dispatch ] = useReducer(audioReducer, AudioCtxInitialValue);

  return (
    <AudioContext.Provider value={ task }>
      <AudioDispatchContext.Provider value={ dispatch }>
        { children }
      </AudioDispatchContext.Provider>
    </AudioContext.Provider>
  )
}
