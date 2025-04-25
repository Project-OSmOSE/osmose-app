import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { ID } from '@/service/type.ts';
import { SpectrogramConfiguration } from './type.ts';
import { downloadResponseHandler, encodeQueryParams } from '@/service/function.ts';

export const SpectrogramConfigurationAPI = createApi({
  reducerPath: 'spectrogramConfigurationApi',
  baseQuery: getAuthenticatedBaseQuery('/api/spectrogram-configuration/'),
  endpoints: (builder) => ({
    list: builder.query<Array<SpectrogramConfiguration>, {
      campaignID?: ID,
      datasetID?: ID,
    }>({
      query: ({ campaignID, datasetID }) => {
        const params: any = {}
        if (campaignID) params.annotation_campaigns = campaignID;
        if (datasetID) params.dataset = datasetID;
        return encodeQueryParams(params);
      },
    }),
    download: builder.mutation<void, {
      filename: string;
      campaignID?: ID,
      datasetID?: ID,
    }>({
      query: ({ filename, campaignID, datasetID }) => {
        const params: any = { filename }
        if (campaignID) params.annotation_campaigns = campaignID;
        if (datasetID) params.dataset = datasetID;
        return {
          url: `export/${ encodeQueryParams(params) }`,
          responseHandler: downloadResponseHandler
        }
      },
    }),
  })
})

export const {
  useListQuery: useListSpectrogramConfigurationQuery,
  useDownloadMutation: useDownloadSpectrogramConfigurationMutation,
} = SpectrogramConfigurationAPI;