import * as Types from '../../../gql/types.generated';

import { gqlAPI } from '@/features/gql/baseApi.ts';
export type GetDatasetsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetDatasetsQuery = { __typename?: 'Query', allDatasets?: { __typename?: 'DatasetNodeNodeConnection', results: Array<{ __typename?: 'DatasetNode', id: string, name: string, description?: string | null, createdAt: any, legacy: boolean, analysisCount?: number | null, filesCount?: number | null, start?: any | null, end?: any | null } | null> } | null };

export type GetAvailableDatasetsForImportQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetAvailableDatasetsForImportQuery = { __typename?: 'Query', allDatasetsAvailableForImport?: Array<{ __typename?: 'ImportDatasetType', name: string, path: string, legacy?: boolean | null, analysis?: Array<{ __typename?: 'ImportSpectrogramAnalysisType', name: string, path: string } | null> | null } | null> | null };


export const GetDatasetsDocument = `
    query getDatasets {
  allDatasets(orderBy: "-createdAt") {
    results {
      id
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
export const GetAvailableDatasetsForImportDocument = `
    query getAvailableDatasetsForImport {
  allDatasetsAvailableForImport {
    name
    path
    legacy
    analysis {
      name
      path
    }
  }
}
    `;

const injectedRtkApi = gqlAPI.injectEndpoints({
  endpoints: (build) => ({
    getDatasets: build.query<GetDatasetsQuery, GetDatasetsQueryVariables | void>({
      query: (variables) => ({ document: GetDatasetsDocument, variables })
    }),
    getAvailableDatasetsForImport: build.query<GetAvailableDatasetsForImportQuery, GetAvailableDatasetsForImportQueryVariables | void>({
      query: (variables) => ({ document: GetAvailableDatasetsForImportDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };


