import * as Types from '../../gql/types.generated';

import { gqlAPI } from '@/features/gql/baseApi.ts';
export type GetDatasetsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetDatasetsQuery = { __typename?: 'Query', allDatasets?: { __typename?: 'DatasetNodeNodeConnection', results: Array<{ __typename?: 'DatasetNode', name: string, description?: string | null, createdAt: any, legacy: boolean, analysisCount?: number | null, filesCount?: number | null, start?: any | null, end?: any | null } | null> } | null };


export const GetDatasetsDocument = `
    query getDatasets {
  allDatasets(orderBy: "-createdAt") {
    results {
      name
      description
      createdAt
      legacy
      analysisCount
      filesCount
      start
      end
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


