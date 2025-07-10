import { createApi } from "@reduxjs/toolkit/query/react";
import { ClientError, GraphQLClient, request } from "graphql-request";
import { graphqlRequestBaseQuery } from "@rtk-query/graphql-request-base-query";

export const graphqlBaseQuery = ({ baseUrl }: { baseUrl: string }) =>
  async ({ body }: { body: string }) => {
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

export const client = new GraphQLClient(`/api/graphql`)

export const gqlAPI = createApi({
  baseQuery: graphqlRequestBaseQuery({ client }),
  endpoints: () => ({})
})