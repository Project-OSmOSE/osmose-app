import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareHeadersWithToken } from '@/service/auth/function.ts';
import { User } from './type.ts';

export const UserAPI = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/user/',
    prepareHeaders: prepareHeadersWithToken,
  }),

  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({ query: () => 'self/', }),
    list: builder.query<Array<User>, void>({ query: () => '', }),
  })
})

export const {
  useGetCurrentUserQuery,
  useListQuery: useListUsersQuery,
} = UserAPI;