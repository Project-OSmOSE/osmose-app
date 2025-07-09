import * as Types from '../../../gql/types.generated';

import { gqlAPI } from '@/features/gql/baseApi.ts';
export type GetAllSoundsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetAllSoundsQuery = { __typename?: 'Query', allSounds?: { __typename?: 'SoundNodeNodeConnection', results: Array<{ __typename?: 'SoundNode', id: string, englishName: string, parent?: { __typename?: 'SoundNode', id: string } | null } | null> } | null };

export type CreateSoundMutationVariables = Types.Exact<{
  englishName: Types.Scalars['String']['input'];
  frenchName?: Types.InputMaybe<Types.Scalars['String']['input']>;
  parent_id?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type CreateSoundMutation = { __typename?: 'Mutation', postSound?: { __typename?: 'PostSoundMutationPayload', ok?: boolean | null, data?: { __typename?: 'SoundNode', id: string } | null, errors?: Array<{ __typename?: 'ErrorType', field: string, messages: Array<string> } | null> | null } | null };

export type UpdateParentSoundMutationVariables = Types.Exact<{
  englishName: Types.Scalars['String']['input'];
  parent_id?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type UpdateParentSoundMutation = { __typename?: 'Mutation', postSound?: { __typename?: 'PostSoundMutationPayload', ok?: boolean | null, data?: { __typename?: 'SoundNode', id: string } | null, errors?: Array<{ __typename?: 'ErrorType', field: string, messages: Array<string> } | null> | null } | null };

export type DeleteSoundMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type DeleteSoundMutation = { __typename?: 'Mutation', deleteSound?: { __typename?: 'DeleteSoundMutation', ok?: boolean | null } | null };


export const GetAllSoundsDocument = `
    query getAllSounds {
  allSounds {
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
export const CreateSoundDocument = `
    mutation createSound($englishName: String!, $frenchName: String, $parent_id: String) {
  postSound(
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
export const UpdateParentSoundDocument = `
    mutation updateParentSound($englishName: String!, $parent_id: String) {
  postSound(input: {englishName: $englishName, parent: $parent_id}) {
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
export const DeleteSoundDocument = `
    mutation deleteSound($id: ID!) {
  deleteSound(id: $id) {
    ok
  }
}
    `;

const injectedRtkApi = gqlAPI.injectEndpoints({
  endpoints: (build) => ({
    getAllSounds: build.query<GetAllSoundsQuery, GetAllSoundsQueryVariables | void>({
      query: (variables) => ({ document: GetAllSoundsDocument, variables })
    }),
    createSound: build.mutation<CreateSoundMutation, CreateSoundMutationVariables>({
      query: (variables) => ({ document: CreateSoundDocument, variables })
    }),
    updateParentSound: build.mutation<UpdateParentSoundMutation, UpdateParentSoundMutationVariables>({
      query: (variables) => ({ document: UpdateParentSoundDocument, variables })
    }),
    deleteSound: build.mutation<DeleteSoundMutation, DeleteSoundMutationVariables>({
      query: (variables) => ({ document: DeleteSoundDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };


