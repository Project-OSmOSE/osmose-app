import { API } from "@/service/api/index.ts";
import { useMemo } from "react";
import { AnnotationCampaign, Detector } from "@/service/types";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { skipToken } from "@reduxjs/toolkit/query";
import { useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";


export const DetectorAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    listDetector: builder.query<Array<Detector>, void | { campaign?: AnnotationCampaign } | undefined>({
      query: (params) => {
        if (!params) return 'detector/';
        const queryParams: any = {}
        if (params.campaign) queryParams['configurations__annotation_results__annotation_campaign'] = params.campaign.id
        return {
          url: `detector/`,
          params: queryParams
        }
      }
    }),
  })
})

export const useListDetectorForCurrentCampaign = () => {
  const { campaign } = useRetrieveCurrentCampaign()
  const { phase } = useRetrieveCurrentPhase()
  const { data, ...info } = DetectorAPI.endpoints.listDetector.useQuery(campaign ? {campaign} : skipToken, {
    skip: phase?.phase !== 'Verification'
  })
  return useMemo(() => ({ detectors: data, ...info, }), [ data, info ])
}
