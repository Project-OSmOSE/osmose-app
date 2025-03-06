import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { Dataset, ImportDataset } from './type.ts';
import { v4 as uuidV4 } from 'uuid';
import { ID } from "@/service/type.ts";
import { encodeQueryParams } from "@/service/function.ts";

export const DatasetAPI = createApi({
  reducerPath: 'datasetApi',
  baseQuery: getAuthenticatedBaseQuery('/api/dataset/'),
  endpoints: (builder) => ({

    list: builder.query<Array<Dataset>, {
      campaign?: ID
    } | undefined>({
      query: (arg) => {
        if (!arg) return ''
        const params: any = {}
        if (arg.campaign) params.annotation_campaigns=arg.campaign
        return encodeQueryParams(params);
      }
    }),
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
        body: { wanted_datasets: data }
      })
    })
  })
})

export const {
  useListQuery: useListDatasetQuery,
  useListForImportQuery: useListDatasetForImportQuery,
  useImportMutation: useImportDatasetMutation,
} = DatasetAPI;