import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";

export type List = Array<ListItem>

export interface ListItem {
  id: number;
  name: string;
  configurations: Array<ListItemConfiguration>;
}
export interface ListItemConfiguration {
  id: number;
  configuration: string;
}

class DetectorAPIService extends APIService<List, never, never> {
  retrieve(): Promise<never> {
    throw 'Unimplemented';
  }

  create(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useDetectorsAPI = () => {
  const auth = useAuthService();
  return new DetectorAPIService('/api/detector', auth);
}
