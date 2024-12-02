import { SpectrogramConfiguration } from './spectrogram-configuration';

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
}

export type ImportDataset = {
  dataset: string;
  name: string; // = dataset
  path: string;
  spectro_duration: string;
  dataset_sr: string;
  file_type: string;
}
