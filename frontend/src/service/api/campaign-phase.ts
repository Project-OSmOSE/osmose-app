import { API } from "@/service/api/index.ts";
import { AnnotationCampaign, AnnotationCampaignPhase, Phase } from "@/service/types";
import { ID } from "@/service/type.ts";
import { downloadResponseHandler } from "@/service/function.ts";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";


export const CampaignPhaseAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    listCampaignPhase: builder.query<AnnotationCampaignPhase[], {
      campaigns?: AnnotationCampaign[],
    } | void>({
      query: (arg) => {
        const params: any = {}
        if (arg) {
          if (arg.campaigns) params.annotation_campaign_id__in = JSON.stringify(arg.campaigns.map(c => c.id))
        }
        return {
          url: `annotation-campaign-phase/`,
          params,
        }
      },
      providesTags: phases => (phases ?? []).map(({ id }) => ({ type: 'CampaignPhase' as const, id })),
    }),
    retrieveCampaignPhase: builder.query<AnnotationCampaignPhase, ID>({
      query: (id) => `annotation-campaign-phase/${ id }`,
      providesTags: phase => phase ? [ { type: 'CampaignPhase' as const, id: phase.id } ] : [],
    }),
    postCampaignPhase: builder.mutation<AnnotationCampaignPhase, {
      campaign: AnnotationCampaign,
      phase: Phase,
    }>({
      query: ({ campaign, phase }) => ({
        url: 'annotation-campaign-phase/',
        method: 'POST',
        body: {
          phase,
          annotation_campaign: campaign.id
        }
      }),
      invalidatesTags: phase => phase ? [
        { type: "CampaignPhase", id: phase.id },
        { type: "Campaign", id: phase.annotation_campaign },
      ] : [],
    }),
    endCampaignPhase: builder.mutation<AnnotationCampaignPhase, ID>({
      query: (phaseID) => ({
        url: `annotation-campaign-phase/${ phaseID }/end/`,
        method: 'POST',
      }),
      invalidatesTags: phase => phase ? [ { type: "CampaignPhase", id: phase.id }, 'Campaign' ] : ['Campaign'],
    }),
    downloadCampaignPhaseReport: builder.mutation<void, {
      phaseID: ID;
      filename: string;
    }>({
      query: ({ phaseID, filename }) => ({
        url: `annotation-campaign-phase/${ phaseID }/report/`,
        params: { filename },
        responseHandler: downloadResponseHandler
      }),
    }),
    downloadCampaignPhaseStatus: builder.mutation<void, {
      phaseID: ID;
      filename: string;
    }>({
      query: ({ phaseID, filename }) => ({
        url: `annotation-campaign-phase/${ phaseID }/report-status/`,
        params: { filename },
        responseHandler: downloadResponseHandler
      }),
    }),
  })
})

export const useListPhasesForCurrentCampaign = () => {
  const { campaign } = useRetrieveCurrentCampaign()
  const { data, ...info } = CampaignPhaseAPI.endpoints.listCampaignPhase.useQuery({
    campaigns: [ campaign! ],
  }, { skip: !campaign })
  const annotationPhase = useMemo(() => data?.find(p => p.phase === 'Annotation'), [ data ])
  const verificationPhase = useMemo(() => data?.find(p => p.phase === 'Verification'), [ data ])
  return useMemo(() => ({ phases: data, annotationPhase, verificationPhase, ...info, }), [ data, annotationPhase, verificationPhase, info ])
}

export const useRetrieveCurrentPhase = () => {
  const { phaseID } = useParams<{ phaseID?: string }>();
  const { data, ...info } = CampaignPhaseAPI.endpoints.retrieveCampaignPhase.useQuery(phaseID ?? skipToken)
  return useMemo(() => ({ phase: phaseID ? data : undefined, ...info, }), [ data, info, phaseID ])
}
