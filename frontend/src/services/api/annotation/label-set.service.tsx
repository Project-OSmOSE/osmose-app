import { useAuthService } from "../../auth";
import { APIService } from "../api-service.util.tsx";

export interface LabelSet {
  id: number;
  name: string;
  desc?: string;
  labels: Array<string>;
}

export class LabelSetAPIService extends APIService<LabelSet, never> {

  retrieveForCampaign(campaignID: string |number): Promise<LabelSet | undefined> {
    return this.list(undefined, {
      annotation_campaign: campaignID
    }).then(list => list.length > 0 ? list[0] : undefined)
  }

  create(): Promise<never> {
    throw 'Unimplemented';
  }
}


export const useLabelSetAPI = () => {
  const auth = useAuthService();
  return new LabelSetAPIService('/api/label-set', auth);
}
