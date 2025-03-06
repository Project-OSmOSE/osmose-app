import { SpectrogramConfiguration } from './spectrogram-configuration';
import { ChannelConfiguration } from "@pam-standardization/metadatax-ts";

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
}