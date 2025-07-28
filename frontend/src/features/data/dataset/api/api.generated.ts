import * as Types from '../../../gql/types.generated';

import { gqlAPI } from '@/features/gql/baseApi.ts';

export type GetDatasetsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetDatasetsQuery = {
  __typename?: 'Query',
  allDatasets?: {
    __typename?: 'DatasetNodeNodeConnection',
    results: Array<{
      __typename?: 'DatasetNode',
      id: string,
      name: string,
      description?: string | null,
      createdAt: any,
      legacy: boolean,
      analysisCount?: number | null,
      filesCount?: number | null,
      start?: any | null,
      end?: any | null
    } | null>
  } | null
};

export type GetAvailableDatasetsForImportQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetAvailableDatasetsForImportQuery = {
  __typename?: 'Query',
  allDatasetsAvailableForImport?: Array<{
    __typename?: 'ImportDatasetType',
    name: string,
    path: string,
    legacy?: boolean | null,
    analysis?: Array<{ __typename?: 'ImportSpectrogramAnalysisType', name: string, path: string } | null> | null
  } | null> | null
};

export type GetDatasetByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetDatasetByIdQuery = {
  __typename?: 'Query',
  datasetById?: {
    __typename?: 'DatasetNode',
    name: string,
    createdAt: any,
    legacy: boolean,
    start?: any | null,
    end?: any | null,
    owner: { __typename?: 'UserNode', displayName?: string | null }
  } | null
};


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
export const GetDatasetByIdDocument = `
    query getDatasetByID($id: ID!) {
  datasetById(id: $id) {
    name
    createdAt
    legacy
    start
    end
    owner {
      displayName
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
    getDatasetByID: build.query<GetDatasetByIdQuery, GetDatasetByIdQueryVariables>({
      query: (variables) => ({ document: GetDatasetByIdDocument, variables }),
    }),
  }),
});

export { injectedRtkApi as api };


