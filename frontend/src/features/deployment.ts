import { gqlAPI } from "@/features/gql.ts";
import { gql } from "graphql-request";

export const DeploymentAPI = gqlAPI.injectEndpoints({
    endpoints: (builder) => ({
        getDeploymentsForIds: builder.query({
            query: (ids: number[]) => ({
                body: gql`
                    query {
                        allDeployments(id_In: ${JSON.stringify(ids)}) {
                            results {
                                id
                                name
                                project {
                                    id
                                    name
                                }
                            }
                        }
                    }
                `
            }),
            transformResponse(response: any) {
                return response.allDeployments.results
            }
        }),
    })
})