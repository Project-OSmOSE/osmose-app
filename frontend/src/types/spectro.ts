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
}

export interface SpectrogramParams {
  nfft: number;
  winsize: number;
  overlap: number;
}
