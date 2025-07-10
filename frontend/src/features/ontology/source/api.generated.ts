import * as Types from '../../gql/types.generated';

import { gqlAPI } from '@/features/gql/baseApi.ts';
export type GetAllSourcesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetAllSourcesQuery = { __typename?: 'Query', allSources?: { __typename?: 'SourceNodeNodeConnection', results: Array<{ __typename?: 'SourceNode', id: string, englishName: string, parent?: { __typename?: 'SourceNode', id: string } | null } | null> } | null };

export type GetDetailedSourceByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetDetailedSourceByIdQuery = { __typename?: 'Query', sourceById?: { __typename?: 'SourceNode', id: string, englishName: string, latinName?: string | null, frenchName?: string | null, codeName?: string | null, taxon?: string | null } | null };

export type CreateSourceMutationVariables = Types.Exact<{
  englishName: Types.Scalars['String']['input'];
  frenchName?: Types.InputMaybe<Types.Scalars['String']['input']>;
  parent_id?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type CreateSourceMutation = { __typename?: 'Mutation', postSource?: { __typename?: 'PostSourceMutationPayload', ok?: boolean | null, data?: { __typename?: 'SourceNode', id: string } | null, errors?: Array<{ __typename?: 'ErrorType', field: string, messages: Array<string> } | null> | null } | null };

export type UpdateSourceMutationVariables = Types.Exact<{
  id: Types.Scalars['Int']['input'];
  englishName: Types.Scalars['String']['input'];
  latinName?: Types.InputMaybe<Types.Scalars['String']['input']>;
  frenchName?: Types.InputMaybe<Types.Scalars['String']['input']>;
  codeName?: Types.InputMaybe<Types.Scalars['String']['input']>;
  taxon?: Types.InputMaybe<Types.Scalars['String']['input']>;
  parent_id?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type UpdateSourceMutation = { __typename?: 'Mutation', postSource?: { __typename?: 'PostSourceMutationPayload', ok?: boolean | null, data?: { __typename?: 'SourceNode', id: string, parent?: { __typename?: 'SourceNode', id: string } | null } | null, errors?: Array<{ __typename?: 'ErrorType', field: string, messages: Array<string> } | null> | null } | null };

export type DeleteSourceMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type DeleteSourceMutation = { __typename?: 'Mutation', deleteSource?: { __typename?: 'DeleteSourceMutation', ok?: boolean | null } | null };


export const GetAllSourcesDocument = `
    query getAllSources {
  allSources {
    results {
      id
      englishName
      parent {
        id
      }
    }
  }
}
    `;
export const GetDetailedSourceByIdDocument = `
    query getDetailedSourceByID($id: ID!) {
  sourceById(id: $id) {
    id
    englishName
    latinName
    frenchName
    codeName
    taxon
  }
}
    `;
export const CreateSourceDocument = `
    mutation createSource($englishName: String!, $frenchName: String, $parent_id: String) {
  postSource(
    input: {englishName: $englishName, frenchName: $frenchName, parent: $parent_id}
  ) {
    ok
    data {
      id
    }
    errors {
      field
      messages
    }
  }
}
    `;
export const UpdateSourceDocument = `
    mutation updateSource($id: Int!, $englishName: String!, $latinName: String, $frenchName: String, $codeName: String, $taxon: String, $parent_id: String) {
  postSource(
    input: {id: $id, englishName: $englishName, latinName: $latinName, frenchName: $frenchName, codeName: $codeName, taxon: $taxon, parent: $parent_id}
  ) {
    ok
    data {
      id
      parent {
        id
      }
    }
    errors {
      field
      messages
    }
  }
}
    `;
export const DeleteSourceDocument = `
    mutation deleteSource($id: ID!) {
  deleteSource(id: $id) {
    ok
  }
}
    `;

const injectedRtkApi = gqlAPI.injectEndpoints({
  endpoints: (build) => ({
    getAllSources: build.query<GetAllSourcesQuery, GetAllSourcesQueryVariables | void>({
      query: (variables) => ({ document: GetAllSourcesDocument, variables })
    }),
    getDetailedSourceByID: build.query<GetDetailedSourceByIdQuery, GetDetailedSourceByIdQueryVariables>({
      query: (variables) => ({ document: GetDetailedSourceByIdDocument, variables })
    }),
    createSource: build.mutation<CreateSourceMutation, CreateSourceMutationVariables>({
      query: (variables) => ({ document: CreateSourceDocument, variables })
    }),
    updateSource: build.mutation<UpdateSourceMutation, UpdateSourceMutationVariables>({
      query: (variables) => ({ document: UpdateSourceDocument, variables })
    }),
    deleteSource: build.mutation<DeleteSourceMutation, DeleteSourceMutationVariables>({
      query: (variables) => ({ document: DeleteSourceDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };


