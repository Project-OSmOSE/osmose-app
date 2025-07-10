import { api, GetAllSourcesQuery, GetDetailedSourceByIdQuery, UpdateSourceMutationVariables } from "./api.generated.ts";
import { DefinitionsFromApi, OverrideResultType, } from "@reduxjs/toolkit/query";
import { providesTagsForList } from "@/features/gql/utils.ts";

const Tags = [ 'Source' ]
type TagType = typeof Tags[number]

type apiDefinitions = DefinitionsFromApi<typeof api>;
type Source = NonNullable<NonNullable<NonNullable<GetAllSourcesQuery['allSources']>['results']>[number]>
type DetailedSource = NonNullable<GetDetailedSourceByIdQuery['sourceById']>
type apiType = Omit<apiDefinitions, 'getAllSources' | 'getDetailedSourceByID'> & {
  getAllSources: OverrideResultType<apiDefinitions['getAllSources'], Source[]>
  getDetailedSourceByID: OverrideResultType<apiDefinitions['getDetailedSourceByID'], DetailedSource | undefined>
}

const enhancedAPI = api.enhanceEndpoints<TagType, apiType>({
  addTagTypes: Tags,
  endpoints: {
    getAllSources: {
      transformResponse(response: GetAllSourcesQuery) {
        return response?.allSources?.results?.filter(r => r !== null) ?? [];
      },
      providesTags: result => providesTagsForList('Source', result)
    },
    getDetailedSourceByID: {
      transformResponse(response: GetDetailedSourceByIdQuery) {
        return response?.sourceById ?? undefined;
      },
      providesTags: result => result ? [ { type: 'Source' as const, id: result.id } ] : []
    },
    updateSource: {
      invalidatesTags: result => result?.postSource?.data?.id ? [ {
        type: 'Source',
        id: result.postSource.data.id
      }, 'Source' ] : [ 'Source' ],
    },
    createSource: {
      invalidatesTags: [ 'Source' ],
    },
    deleteSource: {
      invalidatesTags: (_1, _2, { id }) => [ { type: 'Source' as const, id }, 'Source' ]
    }
  }
})

export {
  enhancedAPI as SourceAPI,
  type Source,
  type DetailedSource,
  type UpdateSourceMutationVariables
}