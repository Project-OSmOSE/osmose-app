import { API } from "@/service/api/index.ts";
import { useMemo } from "react";
import { AnnotationCampaign, Detector } from "@/service/types";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { skipToken } from "@reduxjs/toolkit/query";
import { encodeQueryParams } from "@/service/function.ts";


export const DetectorAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    listDetector: builder.query<Array<Detector>, void | { campaign?: AnnotationCampaign } | undefined>({
      query: (params) => {
        if (!params) return 'detector/';
        const queryParams: any = {}
        if (params.campaign) queryParams['configurations__annotation_results__annotation_campaign'] = params.campaign.id
        return `detector/${ encodeQueryParams(queryParams) }`
      }
    }),
  })
})

export const useListDetectorForCurrentCampaign = () => {
  const { campaign, currentPhase } = useRetrieveCurrentCampaign()
  const { data, ...info } = DetectorAPI.endpoints.listDetector.useQuery(campaign ? {campaign} : skipToken, {
    skip: currentPhase?.phase !== 'Verification'
  })
  return useMemo(() => ({ detectors: data, ...info, }), [ data, info ])
}
