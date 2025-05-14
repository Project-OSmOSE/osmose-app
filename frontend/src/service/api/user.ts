import { API } from "./index.ts";
import { User } from "@/service/types";
import { createListenerMiddleware, createSelector } from "@reduxjs/toolkit";
import { AppState } from "@/service/app.ts";
import { ID } from "@/service/type.ts";

export function extendUser(user: Omit<User, 'display_name' | 'display_name_with_expertise'>): User {
  const display_name = (user.first_name && user.last_name) ? `${ user.first_name } ${ user.last_name }` : user.username;
  const display_name_with_expertise = user.expertise_level ? `${ display_name } (${ user.expertise_level })` : display_name;
  return {
    ...user,
    display_name,
    display_name_with_expertise
  }
}

export const UserAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({
      query: () => 'user/self/',
      transformResponse: extendUser,
      providesTags: [ { type: 'User', id: 'self' } ]
    }),
    retrieveUser: builder.query<User, ID>({
      query: (id) => `user/${ id }/`,
      transformResponse: extendUser,
      providesTags: user => user ? [ { type: 'User' as const, id: user.id } ] : []
    }),
    updateUserPassword: builder.mutation<void, { oldPassword: string, newPassword: string }>({
      query: ({ oldPassword, newPassword }) => ({
        url: 'user/update-password/',
        method: 'POST',
        body: {
          old_password: oldPassword,
          new_password: newPassword,
        }
      })
    }),
    patchUser: builder.mutation<User, Pick<User, 'email'>>({
      query: (data) => ({
        url: 'user/self/',
        method: 'PATCH',
        body: data
      }),
      transformResponse: extendUser,
      invalidatesTags: user => [
        'User',
        { type: 'User', id: 'self' },
        ...(user ? [ { type: 'User' as const, id: user.id } ] : [])
      ]
    }),
    listUser: builder.query<Array<User>, void>({
      query: () => `user/`,
      transformResponse: (users: Array<Omit<User, 'display_name' | 'display_name_with_expertise'>>): Array<User> => {
        return [ ...users ].map(extendUser)
      },
      providesTags: (users) => {
        const tagsForUsers = []
        for (const user of users ?? []) {
          tagsForUsers.push({ type: 'User' as const, id: user.id })
        }
        return [ 'User', ...tagsForUsers ];
      }
    }),
  })
})


const createGetCurrentUserSelector = createSelector(
  () => undefined,
  () => UserAPI.endpoints.getCurrentUser.select()
)
export const selectCurrentUser = createSelector(
  (state: AppState) => state,
  () => createGetCurrentUserSelector(undefined),
  (state, selectCurrentUser) => selectCurrentUser(state).data
)

export const getUserOnLoginMiddleware = createListenerMiddleware()
getUserOnLoginMiddleware.startListening({
  predicate: (action: any) => {
    if (!action.meta?.arg) return false;
    return action.meta.arg.endpointName === 'login' && action.meta.requestStatus === 'fulfilled';
  },
  effect: (_, api) => {
    api.dispatch(UserAPI.endpoints.getCurrentUser.initiate())
  }
})
