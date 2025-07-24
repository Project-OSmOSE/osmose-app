import * as Types from '../../../gql/types.generated';

import { gqlAPI } from '@/features/gql/baseApi.ts';
export type GetAvailableDatasetsForImportQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetAvailableDatasetsForImportQuery = { __typename?: 'Query', allDatasetsAvailableForImport?: Array<{ __typename?: 'ImportDatasetType', name: string, path: string, legacy?: boolean | null, analysis?: Array<{ __typename?: 'ImportSpectrogramAnalysisType', name: string, path: string } | null> | null } | null> | null };


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
    getAvailableDatasetsForImport: build.query<GetAvailableDatasetsForImportQuery, GetAvailableDatasetsForImportQueryVariables | void>({
      query: (variables) => ({ document: GetAvailableDatasetsForImportDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };


