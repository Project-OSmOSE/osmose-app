import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareHeadersWithToken } from '@/service/auth/function.ts';
import { ID } from '@/service/type.ts';
import { SpectrogramConfiguration } from './type.ts';
import { encodeQueryParams } from '@/service/function.ts';
import { AnnotationCampaign } from '@/service/campaign';

export const SpectrogramConfigurationAPI = createApi({
  reducerPath: 'spectrogramConfigurationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/spectrogram-configuration/',
    prepareHeaders: prepareHeadersWithToken,
  }),
  endpoints: (builder) => ({
    list: builder.query<Array<SpectrogramConfiguration>, {
      campaignID?: ID,
    }>({
      query: ({ campaignID }) => {
        const params: any = {}
        if (campaignID) params.annotation_campaigns__id = campaignID;
        return encodeQueryParams(params);
      },
    }),
    download: builder.mutation<void, AnnotationCampaign>({
      query: ({ name, id }) => ({
        url: `export/${ encodeQueryParams({
          filename: name.replace(' ', '_') + '_spectrogram_configuration.csv',
          annotation_campaigns__id: id
        }) }`,
        method: 'POST',
      }),
      transformResponse: (response) => {
        console.warn('transformResponse', response)
        // TODO
      }
    }),
  })
})

export const {
  useListQuery: useListSpectrogramConfigurationQuery,
  useDownloadMutation: useDownloadSpectrogramConfigurationMutation,
} = SpectrogramConfigurationAPI;