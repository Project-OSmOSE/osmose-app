import { API } from "@/service/api/index.ts";
import { ID } from "@/service/type.ts";
import { useMemo } from "react";
import { LabelSet } from "@/service/types";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { skipToken } from "@reduxjs/toolkit/query";


export const LabelSetAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    listLabelSet: builder.query<Array<LabelSet>, void>({
      query: () => 'label-set/'
    }),
    retrieveLabelSet: builder.query<LabelSet, ID>({
      query: (id) => `label-set/${ id }/`
    }),
  })
})

export const useGetLabelSetForCurrentCampaign = () => {
  const {  campaign } = useRetrieveCurrentCampaign()
  const { data, ...info } = LabelSetAPI.endpoints.retrieveLabelSet.useQuery(campaign?.label_set ?? skipToken)
  return useMemo(() => ({ labelSet: data, ...info, }), [ data, info ])
}
