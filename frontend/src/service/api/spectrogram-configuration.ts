import { API } from "@/service/api/index.ts";
import { ID } from "@/service/type.ts";
import { downloadResponseHandler, encodeQueryParams } from "@/service/function.ts";
import { SpectrogramConfiguration } from "@/service/types";
import { useParams } from "react-router-dom";
import { useMemo } from "react";

export function extendSpectrogram(config: Omit<SpectrogramConfiguration, 'scale_name'>): SpectrogramConfiguration {
  let scale_name = 'Default';
  if (config.linear_frequency_scale) scale_name = config.linear_frequency_scale.name ?? 'Linear';
  else if (config.multi_linear_frequency_scale) scale_name = config.multi_linear_frequency_scale.name ?? 'Multi-linear';
  return {
    ...config,
    scale_name,
    zoom_level: config.zoom_level +1
  }
}

export const SpectrogramConfigurationAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    listSpectrogramConfiguration: builder.query<Array<SpectrogramConfiguration>, {
      campaignID?: ID,
      datasetID?: ID,
    }>({
      query: ({ campaignID, datasetID }) => {
        const params: any = {}
        if (campaignID) params.annotation_campaigns = campaignID;
        if (datasetID) params.dataset = datasetID;
        return `spectrogram-configuration//${ encodeQueryParams(params) }`;
      },
      providesTags: (_1, _2, arg) => [
        { type: "SpectrogramConfiguration", id: `campaign${ arg.campaignID }-dataset${ arg.datasetID }` }
      ],
      transformResponse(configs: Array<Omit<SpectrogramConfiguration, 'scale_name'>>): Array<SpectrogramConfiguration> {
        return [ ...configs ].map(extendSpectrogram)
      }
    }),
    downloadSpectrogramConfiguration: builder.mutation<void, {
      filename: string;
      campaignID?: ID,
      datasetID?: ID,
    }>({
      query: ({ filename, campaignID, datasetID }) => {
        const params: any = { filename }
        if (campaignID) params.annotation_campaigns = campaignID;
        if (datasetID) params.dataset = datasetID;
        return {
          url: `spectrogram-configuration/export/${ encodeQueryParams(params) }`,
          responseHandler: downloadResponseHandler
        }
      },
    }),
  })
})

export const useListSpectrogramForCurrentCampaign = () => {
  const { campaignID } = useParams<{ campaignID: string }>();
  const { data, ...info } = SpectrogramConfigurationAPI.endpoints.listSpectrogramConfiguration.useQuery({ campaignID }, {skip: !campaignID})
  return useMemo(() => ({ configurations: data, ...info, }), [ data, info ])
}
