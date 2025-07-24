import { createApi } from "@reduxjs/toolkit/query/react";
import { GraphQLClient } from "graphql-request";
import { graphqlRequestBaseQuery } from "@rtk-query/graphql-request-base-query";
import { prepareHeaders } from "@/service/api";


export const client = new GraphQLClient(`/api/graphql`)

function prepareGqlHeaders(headers: Headers) {
  headers = prepareHeaders(headers);

  // Set Accept
  headers.set('Accept', 'application/json, multipart/mixed')

  return headers
}

export const gqlAPI = createApi({
  baseQuery: graphqlRequestBaseQuery({ client, prepareHeaders: prepareGqlHeaders }),
  endpoints: () => ({})
})