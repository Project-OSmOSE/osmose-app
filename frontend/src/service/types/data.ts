import { ChannelConfiguration } from "@pam-standardization/metadatax-ts";
import { Colormap } from "@/services/utils/color.ts";
import { LinearScale, MultiLinearScale } from "@/service/dataset/spectrogram-configuration/scale";

export type Dataset = {
  id: number;
  name: string;
  files_type: string;
  start_date: string;
  end_date: string;
  files_count: number;
  type: string;
  spectros: Array<SpectrogramConfiguration>;
  created_at: string;
  related_channel_configuration: Array<ChannelConfiguration>
}

export type ImportDataset = {
  dataset: string;
  name: string; // = dataset
  path: string;
  spectro_duration: string;
  dataset_sr: string;
  file_type: string;
}

export interface DatasetFile {
  id: number;
  start: string; // Datetime
  end: string; // Datetime
  filename: string;
  size: number;
  dataset_sr: number; // read only
  audio_url: string;
  dataset_name: string; // read only

  // Front only
  duration: number;
}

export interface SpectrogramConfiguration {
  id: number;
  name: string;
  folder_path: string;
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
  colormap: Colormap;
  dynamic_min: number;
  dynamic_max: number;
  frequency_resolution: number;
  spectro_duration?: number;
  sensitivity_dB?: number;
  peak_voltage?: number;
  gain_dB?: number;
  temporal_resolution?: number;
  audio_file_dataset_overlap?: number;
  time_resolution_zoom_0: number;
  time_resolution_zoom_1: number;
  time_resolution_zoom_2: number;
  time_resolution_zoom_3: number;
  time_resolution_zoom_4: number;
  time_resolution_zoom_5: number;
  time_resolution_zoom_6: number;
  time_resolution_zoom_7: number;
  time_resolution_zoom_8: number;
  window_type: WindowType | null;
  linear_frequency_scale: LinearScale | null;
  multi_linear_frequency_scale: MultiLinearScale | null;

  // Front only
  scale_name: string;
}

export interface WindowType {
  id: number;
  name: string;
}

export interface AudioMetadatum {
  id: number;
  start: string;
  end: string;
  channel_count: number;
  audio_file_count: number;
  audio_file_dataset_duration: number;
  dataset_sr: number;
  total_samples?: number;
  files_subtypes: Array<string>;
  gain_db?: number;
  gain_rel?: number;
  dutycycle_rdm?: number;
  dutycycle_rim?: number;
}

