import { Context, createContext, Dispatch, FC, ReactNode, Reducer, useContext, useReducer } from "react";

export enum AudioState {
  play,
  pause
}

interface AudioCtx {
  time: number;
  state: AudioState;
  element?: HTMLAudioElement;
  error?: any;
}

type AudioCtxActionType = 'element' | 'state' | 'time' | 'error';

interface AudioCtxAction {
  type: AudioCtxActionType;
  element?: HTMLAudioElement;
  newState?: AudioState;
  newTime?: number;
  newError?: any;
}

const AudioCtxInitialValue: AudioCtx = {
  time: 0,
  state: AudioState.pause,
}

const AudioContext: Context<AudioCtx> = createContext<AudioCtx>(AudioCtxInitialValue);
const AudioDispatchContext: Context<Dispatch<AudioCtxAction> | undefined> = createContext<Dispatch<AudioCtxAction> | undefined>(undefined);

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
        state: action.newState ?? AudioState.pause
      }
    case 'time':
      return {
        ...currentContext,
        time: action.newTime ?? 0
      }
    case 'error':
      return {
        ...currentContext,
        error: action.newError
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

export const useAudio = () => useContext(AudioContext);
export const useAudioDispatch = () => useContext(AudioDispatchContext);
