import { api, GetAllSoundsQuery } from "./api.generated.ts";
import { DefinitionsFromApi, OverrideResultType } from "@reduxjs/toolkit/query";
import { providesTagsForList } from "@/features/gql/utils.ts";

const Tags = [ 'Sound' ]
type TagType = typeof Tags[number]

type apiDefinitions = DefinitionsFromApi<typeof api>;
type Sound = NonNullable<NonNullable<NonNullable<GetAllSoundsQuery['allSounds']>['results']>[number]>
type apiType = Omit<apiDefinitions, 'getAllSounds'> & {
  getAllSounds: OverrideResultType<apiDefinitions['getAllSounds'], Sound[]>
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
    updateParentSound: {
      invalidatesTags: result => result?.postSound?.data?.id ? [ {
        type: 'Sound',
        id: result.postSound.data.id
      }, 'Sound' ] : [ 'Sound']
    },
    deleteSound: {
      invalidatesTags: (_1, _2, { id }) => [ { type: 'Sound' as const, id }, 'Sound' ]
    }
  }
})

export {
  enhancedAPI as API,
  type Sound
}