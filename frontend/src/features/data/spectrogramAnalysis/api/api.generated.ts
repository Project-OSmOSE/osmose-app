import * as Types from '../../../gql/types.generated';

import { gqlAPI } from '@/features/gql/baseApi.ts';
export type GetSpectrogramAnalysisQueryVariables = Types.Exact<{
  datasetID?: Types.InputMaybe<Types.Scalars['Decimal']['input']>;
  annotationCampaignID?: Types.InputMaybe<Types.Scalars['Decimal']['input']>;
}>;


export type GetSpectrogramAnalysisQuery = { __typename?: 'Query', allSpectrogramAnalysis?: { __typename?: 'SpectrogramAnalysisNodeNodeConnection', results: Array<{ __typename?: 'SpectrogramAnalysisNode', id: string, name: string, description?: string | null, createdAt: any, legacy: boolean, filesCount?: number | null, start?: any | null, end?: any | null, dataDuration?: number | null, fft: { __typename?: 'FFTNode', samplingFrequency: number, nfft: number, windowSize: number, overlap: any } } | null> } | null };


export const GetSpectrogramAnalysisDocument = `
    query getSpectrogramAnalysis($datasetID: Decimal, $annotationCampaignID: Decimal) {
  allSpectrogramAnalysis(
    orderBy: "-createdAt"
    datasetId: $datasetID
    annotationCampaigns_Id: $annotationCampaignID
  ) {
    results {
      id
      name
      description
      createdAt
      legacy
      filesCount
      start
      end
      dataDuration
      fft {
        samplingFrequency
        nfft
        windowSize
        overlap
      }
    }
  }
}
    `;

const injectedRtkApi = gqlAPI.injectEndpoints({
  endpoints: (build) => ({
    getSpectrogramAnalysis: build.query<GetSpectrogramAnalysisQuery, GetSpectrogramAnalysisQueryVariables | void>({
      query: (variables) => ({ document: GetSpectrogramAnalysisDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };


