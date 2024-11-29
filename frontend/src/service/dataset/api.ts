import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareHeadersWithToken } from '@/service/auth/function.ts';
import { Dataset, ImportDataset } from './type.ts';
import { v4 as uuidV4 } from 'uuid';

export const DatasetAPI = createApi({
  reducerPath: 'datasetApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/dataset/',
    prepareHeaders: prepareHeadersWithToken,
  }),
  endpoints: (builder) => ({

    list: builder.query<Array<Dataset>, void>({ query: () => '' }),
    listForImport: builder.query<Array<ImportDataset>, void>({
      query: () => 'list_to_import/',
      transformResponse: (response: Array<Omit<ImportDataset, 'id'>>) => {
        return response.map(d => ({ ...d, id: uuidV4() }))
      }
    }),

    import: builder.mutation<Array<ImportDataset>, Array<ImportDataset>>({
      query: (data) => ({
        url: `datawork_import/`,
        method: 'POST',
        body: data
      })
    })
  })
})

export const {
  useListQuery: useListDatasetQuery,
  useListForImportQuery: useListDatasetForImportQuery,
  useImportMutation: useImportDatasetMutation,
} = DatasetAPI;