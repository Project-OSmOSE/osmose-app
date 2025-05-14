import { API } from "@/service/api/index.ts";
import { ID } from "@/service/type.ts";
import { downloadResponseHandler, encodeQueryParams } from "@/service/function.ts";
import { AudioMetadatum } from "@/service/types";

export const AudioMetadataAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    listAudioMetadata: builder.query<Array<AudioMetadatum>, {
      campaignID?: ID,
      datasetID?: ID,
    }>({
      query: ({ campaignID, datasetID }) => {
        const params: any = {}
        if (campaignID) params.dataset__annotation_campaigns = campaignID;
        if (datasetID) params.dataset = datasetID;
        return `audio-metadata/${ encodeQueryParams(params) }`;
      },
      providesTags: (_1, _2, arg) => [
        { type: "AudioMetadata", id: `campaign${ arg.campaignID }-dataset${ arg.datasetID }` }
      ]
    }),
    downloadAudioMetadata: builder.mutation<void, {
      filename: string;
      campaignID?: ID,
      datasetID?: ID,
    }>({
      query: ({ filename, campaignID, datasetID }) => {
        const params: any = { filename }
        if (campaignID) params.dataset__annotation_campaigns = campaignID;
        if (datasetID) params.dataset = datasetID;
        return {
          url: `audio-metadata/export/${ encodeQueryParams(params) }`,
          responseHandler: downloadResponseHandler
        }
      },
    }),
  })
})
