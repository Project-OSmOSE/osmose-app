import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { AnnotationResult } from '@/service/campaign/result/type.ts';
import { ID } from '@/service/type.ts';
import { encodeQueryParams } from '@/service/function.ts';
import { DetectorSelection } from '@/service/campaign';

export const AnnotationResultAPI = createApi({
  reducerPath: 'annotationResultApi',
  baseQuery: getAuthenticatedBaseQuery('/api/annotation-result/'),
  endpoints: (builder) => ({
    list: builder.query<Array<AnnotationResult>, void>({ query: () => '' }),
    import: builder.mutation<Array<AnnotationResult>, {
      campaignID: ID,
      datasetName: string,
      detectors: Array<DetectorSelection>,
      file: File,
      force?: boolean
    }>({
      query: ({ campaignID, datasetName, file, force, detectors }) => {
        const detectors_map: { [key in string]: { detector: string, configuration: string } } = {}
        for (const d of detectors) {
          detectors_map[d.initialName] = {
            detector: d.knownDetector?.name ?? d.initialName,
            configuration: d.knownConfiguration?.configuration ?? d.newConfiguration ?? ''
          }
        }
        const body = new FormData()
        body.append('file', file)
        return {
          url: `campaign/${ campaignID }/import/${ encodeQueryParams({
            dataset_name: datasetName,
            detectors_map: JSON.stringify(detectors_map),
            force: force ?? false
          }) }`,
          method: 'POST',
          body,
        }
      }
    }),
  })
})

export const {
  useListQuery: useListResultQuery,
  useImportMutation: useImportResultMutation,
} = AnnotationResultAPI;