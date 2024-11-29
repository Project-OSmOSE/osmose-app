import { OldAPIService } from "../api-service.util.tsx";

export interface ConfidenceIndicator {
  id: number;
  label: string;
  level: number;
  isDefault: boolean;
}

export interface ConfidenceIndicatorSet {
  id: number;
  name: string;
  desc: string;
  confidence_indicators: Array<ConfidenceIndicator>
}

class ConfidenceSetAPIService extends OldAPIService<ConfidenceIndicatorSet, never> {

  retrieveForCampaign(campaignID: string |number): Promise<ConfidenceIndicatorSet | undefined> {
    return this.list(undefined, {
      annotation_campaign: campaignID
    }).then(list => list.length > 0 ? list[0] : undefined)
  }

  create(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useConfidenceSetAPI = () => {
  return new ConfidenceSetAPIService('/api/confidence-indicator');
}
