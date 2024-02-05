import { Context, createContext, Dispatch } from "react";
import { Retrieve } from "../../api/annotation-task-api.service.tsx";

export interface SpectrogramData {
  nfft: number;
  winsize: number;
  overlap: number;
  zoom: number;
  images: Array<SpectrogramImage>;
}

export interface SpectrogramImage {
  start: number,
  end: number,
  src: string,
  image?: HTMLImageElement,
}

export interface SpectrogramParams {
  nfft: number;
  winsize: number;
  overlap: number;
}

export interface SpectroCtx {
  allSpectrograms: Array<SpectrogramData>;
  currentImages: Array<SpectrogramImage>;

  currentParams?: SpectrogramParams;
  availableParams: Array<SpectrogramParams>

  availableZoomLevels: Array<number>;
  currentZoom: number;
  currentZoomOrigin?: { x: number, y: number };

  pointerPosition?: { time: number, frequency: number };
}

export const SpectroCtxInitialValue: SpectroCtx = {
  allSpectrograms: [],
  availableZoomLevels: [],
  currentImages: [],
  availableParams: [],
  currentZoom: 1,
}

export type SpectroCtxAction =
  { type: 'init', task: Retrieve } |
  { type: 'updateParams', params: SpectrogramParams, zoom: number } |
  { type: 'updatePointerPosition', position: { time: number, frequency: number } } |
  { type: 'leavePointer' } |
  { type: 'zoom', direction: 'in' | 'out', origin?: { x: number; y: number } };

export const SpectroContext: Context<SpectroCtx> = createContext<SpectroCtx>(SpectroCtxInitialValue);
export const SpectroDispatchContext: Context<Dispatch<SpectroCtxAction> | undefined> = createContext<Dispatch<SpectroCtxAction> | undefined>(undefined);
