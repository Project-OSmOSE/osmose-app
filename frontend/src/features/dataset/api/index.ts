import { api, GetDatasetsQuery, } from "./api.generated.ts";
import { DefinitionsFromApi, OverrideResultType } from "@reduxjs/toolkit/query";

type N<T> = NonNullable<T>

const Tags = [ 'Dataset' ]
type TagType = typeof Tags[number]

type Dataset = N<N<N<GetDatasetsQuery['allDatasets']>['results']>[number]>

type apiDefinitions = DefinitionsFromApi<typeof api>;
type apiType = Omit<apiDefinitions, 'getDatasets'> & {
  getDatasets: OverrideResultType<apiDefinitions['getDatasets'], Dataset[]>
}

const enhancedAPI = api.enhanceEndpoints<TagType, apiType>({
  addTagTypes: Tags,
  endpoints: {
    getDatasets: {
      transformResponse(response: GetDatasetsQuery) {
        return (response?.allDatasets?.results?.filter(r => r !== null) ?? [])
      },
      providesTags: [ 'Dataset' ],
    },
  }
})

export {
  enhancedAPI as DatasetAPI,
  type Dataset,
}