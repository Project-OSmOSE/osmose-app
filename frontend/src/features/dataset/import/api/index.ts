import { api, GetAvailableDatasetsForImportQuery, } from "./api.generated.ts";
import { DefinitionsFromApi, OverrideResultType } from "@reduxjs/toolkit/query";

type N<T> = NonNullable<T>

const Tags = [ 'ImportDataset' ]
type TagType = typeof Tags[number]

type _ImportDataset = N<N<GetAvailableDatasetsForImportQuery['allDatasetsAvailableForImport']>[number]>
type ImportAnalysis = N<N<_ImportDataset['analysis']>[number]>
type ImportDataset = Omit<_ImportDataset, 'analysis'> & { analysis: ImportAnalysis[] }

type apiDefinitions = DefinitionsFromApi<typeof api>;
type apiType = Omit<apiDefinitions, 'getAvailableDatasetsForImport'> & {
  getAvailableDatasetsForImport: OverrideResultType<apiDefinitions['getAvailableDatasetsForImport'], ImportDataset[]>
}

const enhancedAPI = api.enhanceEndpoints<TagType, apiType>({
  addTagTypes: Tags,
  endpoints: {
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
  enhancedAPI as ImportDatasetAPI,
  type ImportDataset,
  type ImportAnalysis
}