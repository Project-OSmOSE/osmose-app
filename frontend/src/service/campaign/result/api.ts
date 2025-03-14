import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { AnnotationResult } from '@/service/campaign/result/type.ts';
import { ID } from '@/service/type.ts';
import { encodeQueryParams } from '@/service/function.ts';

export const AnnotationResultAPI = createApi({
  reducerPath: 'annotationResultApi',
  baseQuery: getAuthenticatedBaseQuery('/api/annotation-result/'),
  endpoints: (builder) => ({
    list: builder.query<Array<AnnotationResult>, void>({ query: () => '' }),
    import: builder.mutation<Array<AnnotationResult>, {
      campaignID: ID,
      datasetName: string,
      detectors_map: { [key in string]: { detector: string, configuration: string } },
      data: string[][],
      force?: boolean
    }>({
      query: ({ campaignID, datasetName, data, force, detectors_map }) => {
        return {
          url: `campaign/${ campaignID }/import/${ encodeQueryParams({
            dataset_name: datasetName,
            detectors_map: JSON.stringify(detectors_map),
            force: force ?? false
          }) }`,
          method: 'POST',
          body: { data: data.map(row => row.map(cell => `"${ cell }"`).join(',')).join('\n') },
        }
      }
    }),
  })
})

export const {
  useListQuery: useListResultQuery,
  useImportMutation: useImportResultMutation,
} = AnnotationResultAPI;