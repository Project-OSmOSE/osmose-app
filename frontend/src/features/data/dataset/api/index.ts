import { api, GetAvailableDatasetsForImportQuery, GetDatasetsQuery } from "./api.generated.ts";
import { DefinitionsFromApi, OverrideResultType } from "@reduxjs/toolkit/query";

type N<T> = NonNullable<T>

const Tags = [ 'Dataset', 'ImportDataset' ]
type TagType = typeof Tags[number]

type Dataset = N<N<N<GetDatasetsQuery['allDatasets']>['results']>[number]>

type _ImportDataset = N<N<GetAvailableDatasetsForImportQuery['allDatasetsAvailableForImport']>[number]>
type ImportAnalysis = N<N<_ImportDataset['analysis']>[number]>
type ImportDataset = Omit<_ImportDataset, 'analysis'> & { analysis: ImportAnalysis[] }

type apiDefinitions = DefinitionsFromApi<typeof api>;
type apiType = Omit<apiDefinitions, 'getDatasets' | 'getAvailableDatasetsForImport'> & {
  getDatasets: OverrideResultType<apiDefinitions['getDatasets'], Dataset[]>,
  getAvailableDatasetsForImport: OverrideResultType<apiDefinitions['getAvailableDatasetsForImport'], ImportDataset[]>
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
    getAvailableDatasetsForImport: {
      transformResponse(response: GetAvailableDatasetsForImportQuery) {
        return (response?.allDatasetsAvailableForImport?.filter(r => r !== null) ?? [])?.map(d => ({
          ...d,
          analysis: d.analysis ?? []
        } as ImportDataset));
      },
      providesTags: [ 'ImportDataset' ],
    },
  }
})

export {
  enhancedAPI as DatasetAPI,
  type Dataset,
  type ImportDataset,
  type ImportAnalysis
}