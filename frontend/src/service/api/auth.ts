import { API, API_TAGS } from "./index.ts";
import { Token } from "@/service/types";
import { createListenerMiddleware } from "@reduxjs/toolkit";

type LoginResponse = { access: Token, refresh: Token }

export const AuthAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.query<LoginResponse, { username: string, password: string }>({
      query: (credentials) => ({
        url: 'token/',
        method: 'POST',
        body: credentials
      }),
      transformResponse: (response: LoginResponse) => {
        document.cookie = `token=${ response.access };max-age=28000;path=/`;
        return response;
      },
    }),
    logout: builder.mutation<undefined, void>({
      queryFn: async () => {
        document.cookie = 'token=;max-age=0;path=/';
        return {
          data: undefined
        }
      },
      invalidatesTags: API_TAGS,
    })
  })
})


export const logoutOn401Listener = createListenerMiddleware()
logoutOn401Listener.startListening({
  predicate: (action: any) => {
    if (!action.meta?.baseQueryMeta?.response) return false;
    return action.meta.requestStatus === 'rejected' && action.meta.baseQueryMeta.response.status === 401
  },
  effect: (_, api) => {
    api.dispatch(AuthAPI.endpoints.logout.initiate())
  }
})
