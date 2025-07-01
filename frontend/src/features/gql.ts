import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlBaseQuery } from "../../../../metadatax-ts/src";

export const gqlAPI = createApi({
  baseQuery: graphqlBaseQuery({
    baseUrl: `${ window.location.origin }/api/graphql`,
  }),
    endpoints: () => ({})
})