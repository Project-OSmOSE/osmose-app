import { FC, ReactNode, Reducer, useReducer } from "react";
import {
  AudioContext,
  AudioDispatchContext,
  AudioCtx,
  AudioCtxAction,
  AudioCtxInitialValue
} from "./audio.context.tsx";
import { AudioPlayStatus } from "../../../enum";

const audioReducer: Reducer<AudioCtx, AudioCtxAction> = (currentContext: AudioCtx, action: AudioCtxAction): AudioCtx => {
  switch (action.type) {
    case 'element':
      return {
        ...currentContext,
        element: action.element
      }
    case 'state':
      return {
        ...currentContext,
        state: action.newState ?? AudioPlayStatus.pause
      }
    case 'time':
      return {
        ...currentContext,
        time: action.newTime ?? 0
      }
    default:
      return currentContext;
  }
}


export const ProvideAudio: FC<{ children?: ReactNode }> = ({ children }) => {
  const [task, dispatch] = useReducer(audioReducer, AudioCtxInitialValue);

  return (
    <AudioContext.Provider value={ task }>
      <AudioDispatchContext.Provider value={ dispatch }>
        { children }
      </AudioDispatchContext.Provider>
    </AudioContext.Provider>
  )
}