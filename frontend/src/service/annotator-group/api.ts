import { createApi } from '@reduxjs/toolkit/query/react';
import { getAuthenticatedBaseQuery } from '@/service/auth/function.ts';
import { AnnotatorGroup } from './type.ts';
import { ID } from "@/service/type.ts";

export const AnnotatorGroupAPI = createApi({
  reducerPath: 'annotatorGroupAPI',
  baseQuery: getAuthenticatedBaseQuery('/api/annotator-group/'),
  endpoints: (builder) => ({
    list: builder.query<Array<AnnotatorGroup>, void>({ query: () => '', }),
    get: builder.query<Array<AnnotatorGroup>, ID>({ query: (id) => `${ id }/`, }),
  })
})
