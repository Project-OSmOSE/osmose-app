import * as Types from '../../../gql/types.generated';

import { gqlAPI } from '@/features/gql/baseApi.ts';
export type GetAllSourcesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetAllSourcesQuery = { __typename?: 'Query', allSources?: { __typename?: 'SourceNodeNodeConnection', results: Array<{ __typename?: 'SourceNode', id: string, englishName: string, parent?: { __typename?: 'SourceNode', id: string } | null } | null> } | null };

export type CreateSourceMutationVariables = Types.Exact<{
  englishName: Types.Scalars['String']['input'];
  frenchName?: Types.InputMaybe<Types.Scalars['String']['input']>;
  parent_id?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type CreateSourceMutation = { __typename?: 'Mutation', postSource?: { __typename?: 'PostSourceMutationPayload', ok?: boolean | null, data?: { __typename?: 'SourceNode', id: string } | null, errors?: Array<{ __typename?: 'ErrorType', field: string, messages: Array<string> } | null> | null } | null };

export type UpdateParentSourceMutationVariables = Types.Exact<{
  englishName: Types.Scalars['String']['input'];
  parent_id?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type UpdateParentSourceMutation = { __typename?: 'Mutation', postSource?: { __typename?: 'PostSourceMutationPayload', ok?: boolean | null, data?: { __typename?: 'SourceNode', id: string } | null, errors?: Array<{ __typename?: 'ErrorType', field: string, messages: Array<string> } | null> | null } | null };

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
export const UpdateParentSourceDocument = `
    mutation updateParentSource($englishName: String!, $parent_id: String) {
  postSource(input: {englishName: $englishName, parent: $parent_id}) {
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
    createSource: build.mutation<CreateSourceMutation, CreateSourceMutationVariables>({
      query: (variables) => ({ document: CreateSourceDocument, variables })
    }),
    updateParentSource: build.mutation<UpdateParentSourceMutation, UpdateParentSourceMutationVariables>({
      query: (variables) => ({ document: UpdateParentSourceDocument, variables })
    }),
    deleteSource: build.mutation<DeleteSourceMutation, DeleteSourceMutationVariables>({
      query: (variables) => ({ document: DeleteSourceDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };


