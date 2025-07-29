import {
  api,
  GetAllSoundsQuery,
  GetAllSourcesQuery,
  GetDetailedSoundByIdQuery,
  GetDetailedSourceByIdQuery,
  UpdateSourceMutationVariables
} from "./api.generated.ts";
import { DefinitionsFromApi, OverrideResultType } from "@reduxjs/toolkit/query";
import { providesTagsForList } from "@/features/gql/utils.ts";

const Tags = [ 'Sound', 'Source' ]
type TagType = typeof Tags[number]

type Sound = NonNullable<NonNullable<NonNullable<GetAllSoundsQuery['allSounds']>['results']>[number]>
type DetailedSound = NonNullable<GetDetailedSoundByIdQuery['soundById']>

type Source = NonNullable<NonNullable<NonNullable<GetAllSourcesQuery['allSources']>['results']>[number]>
type DetailedSource = NonNullable<GetDetailedSourceByIdQuery['sourceById']>

type apiDefinitions = DefinitionsFromApi<typeof api>;
type apiType =
  Omit<apiDefinitions, 'getAllSounds' | 'getDetailedSoundByID' | 'getAllSources' | 'getDetailedSourceByID'>
  & {
  getAllSounds: OverrideResultType<apiDefinitions['getAllSounds'], Sound[]>
  getDetailedSoundByID: OverrideResultType<apiDefinitions['getDetailedSoundByID'], DetailedSound | undefined>
  getAllSources: OverrideResultType<apiDefinitions['getAllSources'], Source[]>
  getDetailedSourceByID: OverrideResultType<apiDefinitions['getDetailedSourceByID'], DetailedSource | undefined>
}

const enhancedAPI = api.enhanceEndpoints<TagType, apiType>({
  addTagTypes: Tags,
  endpoints: {
    getAllSounds: {
      transformResponse(response: GetAllSoundsQuery) {
        return response?.allSounds?.results?.filter(r => r !== null) ?? [];
      },
      providesTags: result => providesTagsForList('Sound', result)
    },
    getDetailedSoundByID: {
      transformResponse(response: GetDetailedSoundByIdQuery) {
        return response?.soundById ?? undefined;
      },
      providesTags: result => result ? [ { type: 'Sound' as const, id: result.id } ] : []
    },
    updateSound: {
      invalidatesTags: result => result?.postSound?.data?.id ? [ {
        type: 'Sound',
        id: result.postSound.data.id
      }, 'Sound' ] : [ 'Sound' ]
    },
    createSound: {
      invalidatesTags: [ 'Sound' ]
    },
    deleteSound: {
      invalidatesTags: (_1, _2, { id }) => [ { type: 'Sound' as const, id }, 'Sound' ]
    },
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
  enhancedAPI as OntologyAPI,
  type Sound,
  type DetailedSound,
  type Source,
  type DetailedSource,
  type UpdateSourceMutationVariables
}