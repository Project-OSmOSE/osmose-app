import { API } from "@/service/api/index.ts";
import { UserGroup } from "@/service/types";

export const UserGroupAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    list: builder.query<Array<UserGroup>, void>({
      query: () => 'annotator-group/',
      providesTags: groups => groups ? [ ...groups.map(({ id }) => ({
        type: 'UserGroup' as const,
        id
      })), 'UserGroup' ] : [ 'UserGroup' ]
    }),
  })
})