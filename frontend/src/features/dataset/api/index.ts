import { api, GetDatasetsQuery, } from "./api.generated.ts";
import { DefinitionsFromApi, OverrideResultType } from "@reduxjs/toolkit/query";

type N<T> = NonNullable<T>

const Tags = [ 'Dataset' ]
type TagType = typeof Tags[number]

type _Dataset = N<N<N<GetDatasetsQuery['allDatasets']>['results']>[number]>
type Dataset = Omit<_Dataset, 'spectrogramAnalysis'> & {
  spectrogramsCount: number;
  startDate?: Date;
  endDate?: Date;
}

type apiDefinitions = DefinitionsFromApi<typeof api>;
type apiType = Omit<apiDefinitions, 'getDatasets'> & {
  getDatasets: OverrideResultType<apiDefinitions['getDatasets'], Dataset[]>
}

const enhancedAPI = api.enhanceEndpoints<TagType, apiType>({
  addTagTypes: Tags,
  endpoints: {
    getDatasets: {
      transformResponse(response: GetDatasetsQuery) {
        return (response?.allDatasets?.results?.filter(r => r !== null) ?? [])?.map(d => {
          let startDate = undefined;
          let endDate = undefined;
          let spectrogramsCount = 0;
          const analysis = d.spectrogramAnalysis?.results?.filter(a => !!a);
          if (analysis && analysis.length > 0) {
            startDate = new Date(Math.min(...analysis.map(a => new Date(a.startDate).getTime())))
            endDate = new Date(Math.max(...analysis.map(a => new Date(a.endDate).getTime())))
            spectrogramsCount = analysis.reduce((prev, a) => prev + (a.spectrograms?.totalCount ?? 0), 0)
          }
          return { ...d, startDate, endDate, spectrogramsCount } as Dataset
        })
      },
      providesTags: [ 'Dataset' ],
    },
  }
})

export {
  enhancedAPI as DatasetAPI,
  type Dataset,
}