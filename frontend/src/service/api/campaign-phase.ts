import { API } from "@/service/api/index.ts";
import { AnnotationCampaign, AnnotationCampaignPhase, Phase } from "@/service/types";
import { ID } from "@/service/type.ts";
import { downloadResponseHandler, encodeQueryParams } from "@/service/function.ts";


export const CampaignPhaseAPI = API.injectEndpoints({
  endpoints: (builder) => ({
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
      invalidatesTags: phase => phase ? [ { type: "CampaignPhase", id: phase.id } ] : [],
    }),
    endCampaignPhase: builder.mutation<AnnotationCampaignPhase, ID>({
      query: (phaseID) => ({
        url: `annotation-campaign-phase/${ phaseID }/end/`,
        method: 'POST',
      }),
      invalidatesTags: phase => phase ? [ { type: "CampaignPhase", id: phase.id } ] : [],
    }),
    downloadCampaignPhaseReport: builder.mutation<void, {
      phaseID: ID;
      filename: string;
    }>({
      query: ({ phaseID, filename }) => ({
        url: `annotation-campaign-phase/${ phaseID }/report/${ encodeQueryParams({ filename }) }`,
        responseHandler: downloadResponseHandler
      }),
    }),
    downloadCampaignPhaseStatus: builder.mutation<void, {
      phaseID: ID;
      filename: string;
    }>({
      query: ({ phaseID, filename }) => ({
        url: `annotation-campaign-phase/${ phaseID }/report-status/${ encodeQueryParams({ filename }) }`,
        responseHandler: downloadResponseHandler
      }),
    }),
  })
})
