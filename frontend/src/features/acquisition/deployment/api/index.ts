import { api, GetAllDeploymentsQuery } from './api.generated'
import { DefinitionsFromApi, OverrideResultType } from "@reduxjs/toolkit/query";

const Tags: string[] = [ ]
type TagType = typeof Tags[number]

type apiDefinitions = DefinitionsFromApi<typeof api>;
type Deployment = NonNullable<NonNullable<NonNullable<GetAllDeploymentsQuery['allDeployments']>['results']>[number]>
type apiType = Omit<apiDefinitions, 'getAllDeployments'> & {
  getAllDeployments: OverrideResultType<apiDefinitions['getAllDeployments'], Deployment[]>
}

const enhancedAPI = api.enhanceEndpoints<TagType, apiType>({
  addTagTypes: Tags,
  endpoints: {
    getAllDeployments: {
      transformResponse(response: GetAllDeploymentsQuery) {
        return response?.allDeployments?.results?.filter(r => r !== null) ?? [];
      },
    },
  }
})

export {
  enhancedAPI as API,
  type Deployment
}