import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { AnnotationResult } from '@/service/campaign/result/type.ts';
import { ID } from '@/service/type.ts';
import { encodeQueryParams } from '@/service/function.ts';
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

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
      },
      transformErrorResponse(error: FetchBaseQueryError): unknown {
        const outOfFilesError = "This start and end datetime does not belong to any file of the dataset";
        if (error.status === 400) {
          const errors = error.data  as Array<{ [key in string]: string[] }>
          if (!JSON.stringify(errors).includes(outOfFilesError)) return error;
          const count = [ ...JSON.stringify(errors).matchAll(new RegExp(outOfFilesError, 'g')) ].length;
          return {
            status: 400,
            data: `[${ count } results]: ${ outOfFilesError }`,
            canForce: true
          }
        }
        return error
      },
    }),
  })
})

export const {
  useListQuery: useListResultQuery,
  useImportMutation: useImportResultMutation,
} = AnnotationResultAPI;