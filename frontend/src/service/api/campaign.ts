import { API } from "@/service/api/index.ts";
import { AnnotationCampaign, Phase } from "@/service/types";
import { extendUser, UserAPI } from "@/service/api/user.ts";
import { ID, Optionable } from "@/service/type.ts";
import { encodeQueryParams } from "@/service/function.ts";
import { useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useMemo } from "react";

export function extendCampaign(campaign: AnnotationCampaign): AnnotationCampaign {
  return {
    ...campaign,
    owner: extendUser(campaign.owner),
    archive: campaign.archive ? {
      ...campaign.archive,
      by_user: extendUser(campaign.archive.by_user)
    } : campaign.archive
  }
}

export type PostAnnotationCampaign = Pick<AnnotationCampaign,
  'name' | 'desc' | 'instructions_url' | 'deadline' | 'datasets' |
  'allow_image_tuning' | 'allow_colormap_tuning' | 'colormap_default' | 'colormap_inverted_default'
> & {
  spectro_configs: ID[]
}

export type PatchAnnotationCampaign = Optionable<Pick<AnnotationCampaign,
  'labels_with_acoustic_features' | 'label_set' | 'confidence_indicator_set' | 'allow_point_annotation'
>> & { id: ID }

export const CampaignAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    listCampaign: builder.query<Array<AnnotationCampaign>, {
      onlyArchived?: boolean;
      phase?: Phase;
      owner?: ID;
      annotator?: ID;
      search?: string;
    }>({
      query: (clientParams) => {
        const params: { [key in string]: any } = {}
        if (clientParams?.onlyArchived !== undefined) params.archive__isnull = !clientParams.onlyArchived;
        if (clientParams?.phase) params.phases__phase = clientParams.phase[0];
        if (clientParams?.owner) params.owner = clientParams.owner;
        if (clientParams?.annotator) params.phases__file_ranges__annotator_id = clientParams.annotator;
        if (clientParams?.search !== undefined) params.search = clientParams.search;
        return {
          url: `annotation-campaign/${ encodeQueryParams(params) }`
        }
      },
      transformResponse(campaigns: Array<AnnotationCampaign>): Array<AnnotationCampaign> {
        return [ ...campaigns ].map(extendCampaign)
      },
      providesTags: campaigns => campaigns ? [ ...campaigns.flatMap(({ id, phases }) => [
        { type: 'Campaign' as const, id },
        ...(phases ?? []).map(p => ({ type: 'CampaignPhase' as const, id: p.id }))
      ]), 'Campaign' ] : [ 'Campaign' ]
    }),
    retrieveCampaign: builder.query<AnnotationCampaign, ID>({
      query: (id) => `annotation-campaign/${ id }/`,
      transformResponse: extendCampaign,
      providesTags: (campaign, _, arg) => [
        { type: 'Campaign', id: campaign?.id ?? arg },
        ...(campaign?.phases ?? []).map(p => ({ type: 'CampaignPhase' as const, id: p.id }))
      ]
    }),
    postCampaign: builder.mutation<AnnotationCampaign, PostAnnotationCampaign>({
      query: (data) => {
        if (data.deadline?.trim()) data.deadline = new Date(data.deadline).toISOString().split('T')[0];
        else data.deadline = null
        data.desc = data.desc?.trim() ? data.desc.trim() : null;
        data.instructions_url = data.instructions_url?.trim() ? data.instructions_url.trim() : null;
        return {
          url: 'annotation-campaign/',
          method: 'POST',
          body: data
        }
      },
      transformResponse: extendCampaign,
      invalidatesTags: [ 'Campaign' ],
    }),
    patchCampaign: builder.mutation<AnnotationCampaign, PatchAnnotationCampaign>({
      query: (data) => ({
        url: `annotation-campaign/${ data.id }/`,
        method: 'PATCH',
        body: {
          ...data,
          id: undefined
        }
      }),
      transformResponse: extendCampaign,
      invalidatesTags: (_1, _2, arg) => [ { type: 'Campaign' as const, id: arg.id } ],
    }),
    archiveCampaign: builder.mutation<AnnotationCampaign, ID>({
      query: (id) => ({
        url: `annotation-campaign/${ id }/archive/`,
        method: 'POST',
      }),
      invalidatesTags: (_1, _2, arg) => [ { type: 'Campaign' as const, id: arg } ],
    }),
  })
})

export const useRetrieveCurrentCampaign = () => {
  const { campaignID, phaseID } = useParams<{ campaignID: string; phaseID?: string }>();
  const { data: campaign, ...info } = CampaignAPI.endpoints.retrieveCampaign.useQuery(campaignID ?? skipToken)
  const { data: user } = UserAPI.endpoints.getCurrentUser.useQuery();
  return useMemo(() => ({
    campaign,
    ...info,
    currentPhase: campaign?.phases.find(p => p.id.toString() === phaseID),
    hasAdminAccess: !!user && (user.is_staff || user.is_superuser || campaign?.owner?.id === user.id)
  }), [ campaign, info, phaseID ])
}
