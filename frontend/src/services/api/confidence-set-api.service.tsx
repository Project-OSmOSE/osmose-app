import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";


export type List = Array<ListItem>
export type ListItem = {
  id: number;
  name: string;
  desc: string;
  confidence_indicators: Array<{
    id: number;
    label: string;
    level: number;
    isDefault: boolean;
  }>;
}

class ConfidenceSetAPIService extends APIService<List, never, never> {
  retrieve(): Promise<never> {
    throw 'Unimplemented';
  }

  create(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useConfidenceSetAPI = () => {
  const auth = useAuthService();
  return new ConfidenceSetAPIService('/api/confidence-indicator', auth);
}
