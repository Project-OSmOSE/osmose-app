import { useParams } from "react-router-dom";
import { CampaignAPI } from "@/service/campaign";

export const usePageCampaign = () => {
  const { campaignID } = useParams<{ campaignID: string }>();
  const { data: campaign } = CampaignAPI.useRetrieveQuery(campaignID!, { skip: !campaignID });
  return campaign;
}

export const usePagePhase = () => {
  const { phaseID } = useParams<{ phaseID: string }>();
  const campaign = usePageCampaign();
  return campaign?.phases.find(p => p.id.toString() === phaseID);
}
