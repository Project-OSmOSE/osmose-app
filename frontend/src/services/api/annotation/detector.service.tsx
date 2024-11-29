import { OldAPIService } from "../api-service.util.tsx";

export interface Detector {
  id: number;
  name: string;
  configurations: Array<DetectorConfiguration>;
}
export interface DetectorConfiguration {
  id: number;
  configuration: string;
}

class DetectorService extends OldAPIService<Detector, never> {
  create(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useDetectorsAPI = () => {
  return new DetectorService('/api/detector');
}
