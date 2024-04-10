export interface SpectrogramConfiguration {
  id: number;
  name: string;
  desc: string;
  nfft: number;
  window_size: number;
  overlap: number;
  dataset_sr: number;
  zoom_level: number;
  spectro_normalization: string;
  data_normalization: string;
  zscore_duration: string;
  hp_filter_min_freq: number;
  colormap: string;
  dynamic_min: number;
  dynamic_max: number;
  frequency_resolution: number;
  time_resolution_zoom_0: number;
  time_resolution_zoom_1: number;
  time_resolution_zoom_2: number;
  time_resolution_zoom_3: number;
  time_resolution_zoom_4: number;
  time_resolution_zoom_5: number;
  time_resolution_zoom_6: number;
  time_resolution_zoom_7: number;
  time_resolution_zoom_8: number;
  window_type: WindowType;
}

export interface WindowType {
  id: number;
  name: string;
}
