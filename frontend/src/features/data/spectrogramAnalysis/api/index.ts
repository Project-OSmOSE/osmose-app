import { api, GetSpectrogramAnalysisQuery, GetSpectrogramAnalysisQueryVariables } from "./api.generated.ts";
import { DefinitionsFromApi, OverrideResultType } from "@reduxjs/toolkit/query";

type N<T> = NonNullable<T>

const Tags = [ 'SpectrogramAnalysis' ]
type TagType = typeof Tags[number]

type SpectrogramAnalysis = N<N<N<GetSpectrogramAnalysisQuery['allSpectrogramAnalysis']>['results']>[number]>

type apiDefinitions = DefinitionsFromApi<typeof api>;
type apiType = Omit<apiDefinitions, 'getSpectrogramAnalysis'> & {
  getSpectrogramAnalysis: OverrideResultType<apiDefinitions['getSpectrogramAnalysis'], SpectrogramAnalysis[]>,
}

const enhancedAPI = api.enhanceEndpoints<TagType, apiType>({
  addTagTypes: Tags,
  endpoints: {
    getSpectrogramAnalysis: {
      transformResponse(response: GetSpectrogramAnalysisQuery) {
        return (response?.allSpectrogramAnalysis?.results?.filter(r => r !== null) ?? [])
      },
      // @ts-expect-error: result and error are unused
      providesTags: (result, error, { datasetID, annotationCampaignID }: GetSpectrogramAnalysisQueryVariables) => [
        { type: 'SpectrogramAnalysis', id: `d${ datasetID }-ac${ annotationCampaignID }` }
      ]
    },
  }
})

export {
  enhancedAPI as SpectrogramAnalysisAPI,
  type SpectrogramAnalysis,
}