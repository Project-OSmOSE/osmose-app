import { createApi } from "@reduxjs/toolkit/query/react";
import { ClientError, request } from "graphql-request";

export const graphqlBaseQuery = ({ baseUrl }: { baseUrl: string }) =>
  async ({ body }:  { body: string }) => {
    try {
      const result = await request(baseUrl, body)
      return { data: result }
    } catch (error) {
      if (error instanceof ClientError) {
        return { error: { status: error.response.status, data: error } }
      }
      return { error: { status: 500, data: error } }
    }
  }


export const gqlAPI = createApi({
  baseQuery: graphqlBaseQuery({
    baseUrl: `${ window.location.origin }/api/graphql`,
  }),
    endpoints: () => ({})
})