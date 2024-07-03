import { createSlice } from "@reduxjs/toolkit";
import { SpectrogramData, SpectrogramImage, SpectrogramParams } from "@/types/spectro.ts";
import { Retrieve, RetrieveSpectroURL } from "@/services/api/annotation-task-api.service.tsx";

const baseUrlRegexp = /(.*\/)(.*)_\d*_\d*(\..*)/;


export type SpectroSlice = {
  allSpectrograms: Array<SpectrogramData>;
  currentImages: Array<SpectrogramImage>;

  currentParams?: SpectrogramParams;
  availableParams: Array<SpectrogramParams>

  availableZoomLevels: Array<number>;
  currentZoom: number;
  currentZoomOrigin?: { x: number, y: number };

  pointerPosition?: { time: number, frequency: number };

  retrieve: Array<RetrieveSpectroURL>;
  selectedSpectroId: number;
}

function getSpectrogramForParams(allSpectrograms: Array<SpectrogramData>,
                                 zoom: number,
                                 params?: SpectrogramParams): SpectrogramData | undefined {
  if (allSpectrograms.length === 0) return;
  if (!params) return allSpectrograms.find(d => d.zoom === zoom)
  return allSpectrograms.filter(d =>
    d.nfft === params.nfft &&
    d.winsize === params.winsize &&
    d.overlap === params.overlap
  ).find(d => d.zoom === zoom)
}

function getNewZoomLevel(state: SpectroSlice, direction: 'in' | 'out'): number {
  const oldZoomId: number = state.availableZoomLevels.findIndex(z => z === state.currentZoom);
  // When zoom will be free: if (direction > 0 && oldZoomIdx < zoomLevels.length - 1)
  if (direction === 'in' && (oldZoomId + 1) < state.availableZoomLevels.length) {
    // Zoom in
    return state.availableZoomLevels[oldZoomId + 1];
  } else if (direction === 'out' && oldZoomId > 0) {
    // Zoom out
    return state.availableZoomLevels[oldZoomId - 1];
  } else return state.currentZoom;
}

function getAllSpectrograms(task: Retrieve): Array<SpectrogramData> {
  return task.spectroUrls.map(configuration => {
    const urlParts = configuration.urls[0].match(baseUrlRegexp);
    const nbZooms = Math.log2(configuration.urls.length + 1);
    return {
      ...configuration,
      nfft: configuration.nfft,
      winsize: configuration.winsize,
      overlap: configuration.overlap,
      zoomLevels: [...Array(nbZooms)].map((_, i) => Math.pow(2, i)),
      urlPrefix: urlParts ? urlParts[1] : '',
      urlFileName: urlParts ? urlParts[2] : '',
      urlFileExtension: urlParts ? urlParts[3] : '',
    }
  }).flatMap(info => {
    return info.zoomLevels.map(zoom => {
      const step: number = task.boundaries.duration / zoom;
      return {
        nfft: info.nfft,
        winsize: info.winsize,
        overlap: info.overlap,
        zoom,
        images: [...Array(zoom)].map((_, i) => ({
          start: i * step,
          end: (i + 1) * step,
          src: `${ info.urlPrefix }${ info.urlFileName }_${ zoom }_${ i }${ info.urlFileExtension }`
        }))
      }
    })
  })
}

export const spectroSlice = createSlice({
  name: 'Spectro',
  initialState: {
    allSpectrograms: [],
    availableZoomLevels: [],
    currentImages: [],
    availableParams: [],
    currentZoom: 1,
    retrieve: [],
    selectedSpectroId: 0
  } as SpectroSlice,
  reducers: {
    initSpectro: (state, action: { payload: Retrieve }) => {
      console.debug('[initSpectro]', action.payload.spectroUrls)
      const allSpectrograms = getAllSpectrograms(action.payload);
      const currentSpectro = getSpectrogramForParams(allSpectrograms, 1);
      let availableParams = allSpectrograms.map(c => ({
        nfft: c.nfft,
        overlap: c.overlap,
        winsize: c.winsize
      }))
      availableParams = availableParams.filter((p, i) => availableParams.findIndex(a => a.winsize === p.winsize && a.nfft === p.nfft && a.overlap === p.overlap) === i)
      Object.assign(state, {
        allSpectrograms,
        availableZoomLevels: [...new Set(allSpectrograms.map(c => c.zoom))].sort((a, b) => a - b),
        availableParams,
        currentImages: currentSpectro?.images ?? [],
        currentParams: currentSpectro ? {
          nfft: currentSpectro.nfft,
          overlap: currentSpectro.overlap,
          winsize: currentSpectro.winsize
        } : undefined,
        currentZoom: 1,
        currentZoomOrigin: undefined,
        retrieve: action.payload.spectroUrls,
      })
    },

    updateParams: (state, action: { payload: SpectrogramParams & { zoom: number } }) => {
      Object.assign(state, {
        currentImages: getSpectrogramForParams(state.allSpectrograms, action.payload.zoom, action.payload)?.images ?? [],
        currentParams: action.payload,
        currentZoomOrigin: undefined,
        selectedSpectroId: state.retrieve.find(s => s.nfft === action.payload.nfft && s.winsize === action.payload.winsize && s.overlap === action.payload.overlap)!.id
      })
    },

    updatePointerPosition: (state, action: { payload: { time: number, frequency: number } }) => {
      state.pointerPosition = action.payload
    },

    leavePointer: (state) => {
      state.pointerPosition = undefined
    },

    zoom: (state, action: {
      payload: { direction: 'in' | 'out', origin?: { x: number; y: number } }
    }) => {
      const zoom = getNewZoomLevel(state, action.payload.direction);
      Object.assign(state, {
        currentImages: getSpectrogramForParams(state.allSpectrograms, zoom, state.currentParams)?.images ?? [],
        currentZoom: zoom,
        currentZoomOrigin: action.payload.origin
      })
    },
  }
})

export const {
  initSpectro,
  updateParams,
  updatePointerPosition,
  leavePointer,
  zoom,
} = spectroSlice.actions;

export default spectroSlice.reducer;
