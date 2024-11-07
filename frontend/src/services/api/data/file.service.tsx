import { useAuthService } from "../../auth";
import { APIService } from "../api-service.util.tsx";

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

class DatasetFileAPIService extends APIService<DatasetFile, never> {
  create(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useDatasetFileAPI = () => {
  const auth = useAuthService();
  return new DatasetFileAPIService('/api/dataset-file', auth);
}
