import { useAuthService } from "../../auth";
import { APIService } from "../api-service.util.tsx";

export interface Detector {
  id: number;
  name: string;
  configurations: Array<DetectorConfiguration>;
}
export interface DetectorConfiguration {
  id: number;
  configuration: string;
}

class DetectorService extends APIService<Detector, never> {
  create(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useDetectorsAPI = () => {
  const auth = useAuthService();
  return new DetectorService('/api/detector', auth);
}
