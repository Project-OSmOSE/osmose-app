import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";
import { LabelSet } from "@/types/label.ts";


export class LabelSetAPIService extends APIService<Array<LabelSet>, never, never> {
  retrieve(): Promise<never> {
    throw 'Unimplemented';
  }

  create(): Promise<never> {
    throw 'Unimplemented';
  }
}


export const useLabelSetAPI = () => {
  const auth = useAuthService();
  return new LabelSetAPIService('/api/label-set', auth);
}
