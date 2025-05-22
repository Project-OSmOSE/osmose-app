import { API } from "@/service/api/index.ts";
import { ID } from "@/service/type.ts";
import { v4 as uuidV4 } from "uuid";
import { Dataset, DatasetFile, ImportDataset } from "@/service/types";
import { extendSpectrogram } from "@/service/api/spectrogram-configuration.ts";

function extendDataset(dataset: Dataset): Dataset {
  return {
    ...dataset,
    spectros: dataset.spectros.map(extendSpectrogram),
  }
}

export function extendDatasetFile(file: DatasetFile): DatasetFile {
  const start = new Date(file.start).getTime() / 1000;
  const end = new Date(file.end).getTime() / 1000;
  return {
    ...file,
    duration: end - start,
    maxFrequency: file.dataset_sr / 2
  }
}

export const DatasetAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    listDataset: builder.query<Array<Dataset>, { campaignID: ID | symbol } | void>({
      query: (arg = undefined) => {
        if (!arg) return 'dataset/'
        const params: any = {}
        if (arg.campaignID) params.annotation_campaigns = arg.campaignID
        return {
          url: `dataset/`,
          params,
        }
      },
      providesTags: [ { type: 'Dataset' } ],
      transformResponse(configs: Array<Dataset>): Array<Dataset> {
        return [ ...configs ].map(extendDataset)
      }
    }),
    listDatasetForImport: builder.query<Array<ImportDataset>, void>({
      query: () => 'dataset/list_to_import/',
      transformResponse: (response: Array<Omit<ImportDataset, 'id'>>) => {
        return response.map(d => ({ ...d, id: uuidV4() }))
      },
      providesTags: [ { type: 'DatasetToImport' } ]
    }),

    importDataset: builder.mutation<Array<ImportDataset>, Array<ImportDataset>>({
      query: (wanted_datasets) => ({
        url: `dataset/datawork_import/`,
        method: 'POST',
        body: { wanted_datasets }
      }),
      invalidatesTags: [ { type: 'DatasetToImport' }, { type: 'Dataset' } ]
    })
  })
})