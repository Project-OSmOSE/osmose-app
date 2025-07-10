import { api, GetAllSoundsQuery, GetDetailedSoundByIdQuery } from "./api.generated.ts";
import { DefinitionsFromApi, OverrideResultType } from "@reduxjs/toolkit/query";
import { providesTagsForList } from "@/features/gql/utils.ts";

const Tags = [ 'Sound' ]
type TagType = typeof Tags[number]

type apiDefinitions = DefinitionsFromApi<typeof api>;
type Sound = NonNullable<NonNullable<NonNullable<GetAllSoundsQuery['allSounds']>['results']>[number]>
type DetailedSound = NonNullable<GetDetailedSoundByIdQuery['soundById']>
type apiType = Omit<apiDefinitions, 'getAllSounds' | 'getDetailedSoundByID'> & {
  getAllSounds: OverrideResultType<apiDefinitions['getAllSounds'], Sound[]>
  getDetailedSoundByID: OverrideResultType<apiDefinitions['getDetailedSoundByID'], DetailedSound | undefined>
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
    }
  }
})

export {
  enhancedAPI as SoundAPI,
  type Sound,
  type DetailedSound
}