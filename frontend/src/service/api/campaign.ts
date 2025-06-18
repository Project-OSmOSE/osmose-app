import { API } from "@/service/api/index.ts";
import { AnnotationCampaign } from "@/service/types";
import { extendUser, UserAPI } from "@/service/api/user.ts";
import { ID, Optionable } from "@/service/type.ts";
import { useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useMemo } from "react";

export type CampaignFilter = {
  archive__isnull?: boolean;
  phases__phase?: 'A' | 'V';
  owner?: number;
  phases__file_ranges__annotator_id?: number;
  search?: string;
}

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
    listCampaign: builder.query<Array<AnnotationCampaign>, CampaignFilter>({
      query: (params) => ({ url: `annotation-campaign/`, params }),
      transformResponse(campaigns: Array<AnnotationCampaign>): Array<AnnotationCampaign> {
        return [ ...campaigns ].map(extendCampaign)
      },
      providesTags: campaigns => campaigns ? [ ...campaigns.map(({ id }) => ({
        type: 'Campaign' as const,
        id
      })), 'Campaign' ] : [ 'Campaign' ]
    }),
    retrieveCampaign: builder.query<AnnotationCampaign, ID>({
      query: (id) => `annotation-campaign/${ id }/`,
      transformResponse: extendCampaign,
      providesTags: (campaign, _, arg) => [
        { type: 'Campaign', id: campaign?.id ?? arg },
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
    patchCampaign: builder.mutation<void, PatchAnnotationCampaign>({
      query: ({ id, ...body }) => ({
        url: `annotation-campaign/${ id }/`,
        method: 'PATCH',
        body
      }),
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
  const { campaignID } = useParams<{ campaignID: string; }>();
  const { data: campaign, ...info } = CampaignAPI.endpoints.retrieveCampaign.useQuery(campaignID ?? skipToken)
  const { data: user } = UserAPI.endpoints.getCurrentUser.useQuery();
  return useMemo(() => ({
    campaign,
    ...info,
    hasAdminAccess: !!user && (user.is_staff || user.is_superuser || campaign?.owner?.id === user.id),
  }), [ campaign, info ])
}
