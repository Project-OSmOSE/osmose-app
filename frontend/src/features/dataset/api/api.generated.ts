import * as Types from '../../gql/types.generated';

import { gqlAPI } from '@/features/gql/baseApi.ts';
export type GetDatasetsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetDatasetsQuery = { __typename?: 'Query', allDatasets?: { __typename?: 'DatasetNodeNodeConnection', results: Array<{ __typename?: 'DatasetNode', name: string, description?: string | null, createdAt: any, legacy: boolean, spectrogramAnalysis?: { __typename?: 'SpectrogramAnalysisNodeNodeConnection', results: Array<{ __typename?: 'SpectrogramAnalysisNode', startDate?: any | null, endDate?: any | null, spectrograms?: { __typename?: 'SpectrogramNodeNodeConnection', totalCount?: number | null } | null } | null> } | null } | null> } | null };


export const GetDatasetsDocument = `
    query getDatasets {
  allDatasets {
    results {
      name
      description
      createdAt
      legacy
      spectrogramAnalysis {
        results {
          startDate
          endDate
          spectrograms {
            totalCount
          }
        }
      }
    }
  }
}
    `;

const injectedRtkApi = gqlAPI.injectEndpoints({
  endpoints: (build) => ({
    getDatasets: build.query<GetDatasetsQuery, GetDatasetsQueryVariables | void>({
      query: (variables) => ({ document: GetDatasetsDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };


