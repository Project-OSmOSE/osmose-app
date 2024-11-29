import { OldAPIService } from "../api-service.util.tsx";

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

class DatasetFileAPIService extends OldAPIService<DatasetFile, never> {
  create(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useDatasetFileAPI = () => {
  return new DatasetFileAPIService('/api/dataset-file');
}
