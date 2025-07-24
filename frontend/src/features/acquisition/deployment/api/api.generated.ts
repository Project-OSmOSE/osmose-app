import * as Types from '../../../gql/types.generated';

import { gqlAPI } from '@/features/gql/baseApi.ts';
export type GetAllDeploymentsQueryVariables = Types.Exact<{
  ids?: Types.InputMaybe<Array<Types.InputMaybe<Types.Scalars['ID']['input']>> | Types.InputMaybe<Types.Scalars['ID']['input']>>;
}>;


export type GetAllDeploymentsQuery = { __typename?: 'Query', allDeployments?: { __typename?: 'DeploymentNodeNodeConnection', results: Array<{ __typename?: 'DeploymentNode', id: string, name?: string | null, project: { __typename?: 'ProjectNodeOverride', id: string, name: string } } | null> } | null };


export const GetAllDeploymentsDocument = `
    query getAllDeployments($ids: [ID]) {
  allDeployments(id_In: $ids) {
    results {
      id
      name
      project {
        id
        name
      }
    }
  }
}
    `;

const injectedRtkApi = gqlAPI.injectEndpoints({
  endpoints: (build) => ({
    getAllDeployments: build.query<GetAllDeploymentsQuery, GetAllDeploymentsQueryVariables | void>({
      query: (variables) => ({ document: GetAllDeploymentsDocument, variables })
    }),
  }),
});

export { injectedRtkApi as api };


