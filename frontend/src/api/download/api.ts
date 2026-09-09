import { restAPI } from '@/api/baseRestApi';
import { getDownloadResponseHandler } from '@/service/function';
import type { SpectrogramAnalysisNode } from '@/api/types.gql-generated';


export const DownloadRestAPI = restAPI.injectEndpoints({
    endpoints: builder => ({

        downloadAnalysis: builder.mutation<void, Pick<SpectrogramAnalysisNode, 'id' | 'name'>>({
            query: ({ id, name }) => {
                return {
                    url: `/api/download/analysis-export/${ id }/`,
                    responseHandler: getDownloadResponseHandler(`${ name }.zip`),
                }
            },
        }),

        downloadAnnotations: builder.mutation<void, { phaseID: string }>({
            query: ({ phaseID }) => {
                return {
                    url: `/api/download/phase-annotations/${ phaseID }/`,
                    responseHandler: getDownloadResponseHandler(),
                }
            },
        }),

        downloadProgress: builder.mutation<void, { phaseID: string }>({
            query: ({ phaseID }) => {
                return {
                    url: `/api/download/phase-progression/${ phaseID }/`,
                    responseHandler: getDownloadResponseHandler(),
                }
            },
        }),

    }),
})
