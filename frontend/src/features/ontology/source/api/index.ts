import { api, GetAllSourcesQuery } from "./api.generated.ts";
import { DefinitionsFromApi, OverrideResultType } from "@reduxjs/toolkit/query";
import { providesTagsForList } from "@/features/gql/utils.ts";

const Tags = [ 'Source' ]
type TagType = typeof Tags[number]

type apiDefinitions = DefinitionsFromApi<typeof api>;
type Source = NonNullable<NonNullable<NonNullable<GetAllSourcesQuery['allSources']>['results']>[number]>
type apiType = Omit<apiDefinitions, 'getAllSources'> & {
  getAllSources: OverrideResultType<apiDefinitions['getAllSources'], Source[]>
}

const enhancedAPI = api.enhanceEndpoints<TagType, apiType>({
  addTagTypes: [ 'Source' ],
  endpoints: {
    getAllSources: {
      transformResponse(response: GetAllSourcesQuery) {
        return response?.allSources?.results?.filter(r => r !== null) ?? [];
      },
      providesTags: result => providesTagsForList('Source', result)
    },
    updateParentSource: {
      invalidatesTags: result => result?.postSource?.data?.id ? [ {
        type: 'Source',
        id: result.postSource.data.id
      }, 'Source' ] : [ 'Source']
    },
    deleteSource: {
      invalidatesTags: (_1, _2, { id }) => [ { type: 'Source' as const, id }, 'Source' ]
    }
  }
})

export {
  enhancedAPI as API,
  type Source
}