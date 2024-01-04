import { createContext, Dispatch } from "react";

export enum AudioState {
  play,
  pause
}

interface AudioPlayerState {
  currentTime: number;
  currentState: AudioState;
  playbackRate: number;
  audioElement?: HTMLAudioElement;
}
export enum AudioPlayerStateAction {
  updateCurrentTime,
  updatePlaybackRate,
  play,
  pause,
  end,
  setAudioElement
}
export const AudioPlayerInitialState: AudioPlayerState = {
  currentTime: 0,
  currentState: AudioState.pause,
  playbackRate: 1
}
export const AudioPlayerReducer = (state: any, action: any) => {
  switch (action.type) {
    case AudioPlayerStateAction.updateCurrentTime:
      return {
        ...state,
        currentTime: action.time
      };
    case AudioPlayerStateAction.updatePlaybackRate:
      return {
        ...state,
        playbackRate: action.playbackRate
      };
    case AudioPlayerStateAction.play:
      return {
        ...state,
        currentState: AudioState.play
      };
    case AudioPlayerStateAction.pause:
      return {
        ...state,
        currentState: AudioState.pause
      };
    case AudioPlayerStateAction.end:
      return {
        ...state,
        currentTime: 0,
        currentState: AudioState.pause,
      };
    case AudioPlayerStateAction.setAudioElement:
      return {
        ...state,
        audioElement: action.element
      };
  }
}

export const AudioPlayerContext = createContext<AudioPlayerState | undefined>(undefined);
export const AudioPlayerDispatchContext = createContext<Dispatch<any> | undefined>(undefined);