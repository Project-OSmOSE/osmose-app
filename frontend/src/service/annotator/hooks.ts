import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { useFileFilters } from "@/service/slices/filter.ts";

export const useOpenAnnotator = () => {
  const { campaignID } = useRetrieveCurrentCampaign()
  const { phaseID } = useRetrieveCurrentPhase()
  const { params } = useFileFilters()
  const navigate = useNavigate()

  return useCallback((fileID: number) => {
    const encodedParams = encodeURI(Object.entries(params).map(([k, v]) => `${ k }=${ v }`).join('&'));
    navigate(`/annotation-campaign/${ campaignID }/phase/${ phaseID }/file/${ fileID }?${ encodedParams }`);
  }, [ campaignID, phaseID ])
}