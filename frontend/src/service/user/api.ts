import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { User } from './type.ts';

export const UserAPI = createApi({
  reducerPath: 'userApi',
  baseQuery: getAuthenticatedBaseQuery('/api/user/'),
  tagTypes: [ 'User' ],
  endpoints: (builder) => ({
    getCurrent: builder.query<User, void>({
      query: () => 'self/',
      providesTags: [ { type: 'User', id: 'CURRENT' } ]
    }),
    updatePassword: builder.mutation<void, {
      oldPassword: string,
      newPassword: string,
    }>({
      query: ({ oldPassword, newPassword }) => ({
        url: 'update-password/',
        method: 'POST',
        body: {
          old_password: oldPassword,
          new_password: newPassword,
        }
      }),
    }),
    patch: builder.mutation<User, Omit<User, 'id' | 'expertise_level' | 'first_name' | 'last_name' | 'is_staff' | 'is_superuser' | 'username'>>(
      {
        query: (data) => ({
          url: 'self/',
          method: 'PATCH',
          body: data
        }),
        invalidatesTags: [ { type: 'User', id: 'CURRENT' } ]
      }),
    list: builder.query<Array<User>, void>({
      query: () => '',
      providesTags: [ { type: 'User' } ]
    }),
  })
})
