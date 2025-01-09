import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { User } from './type.ts';

export const UserAPI = createApi({
  reducerPath: 'userApi',
  baseQuery: getAuthenticatedBaseQuery('/api/user/'),
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({ query: () => 'self/', }),
    updatePassword: builder.mutation<void, {
      oldPassword: string,
      newPassword: string,
    }>({ query: ({oldPassword, newPassword}) => ({
        url: 'update-password/',
        method: 'POST',
        body: {
          old_password: oldPassword,
          new_password: newPassword,
        }
      }), }),
    list: builder.query<Array<User>, void>({ query: () => '', }),
  })
})

export const {
  useGetCurrentUserQuery,
  useListQuery: useListUsersQuery,
  useUpdatePasswordMutation
} = UserAPI;