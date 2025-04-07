import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareHeadersWithToken } from "@/service/auth";
import { encodeQueryParams } from "@/service/function.ts";
import { Paginated } from "@/service/type.ts";

type Row = (string | number | null)[]

const DEFAULT_PAGE_SIZE = 20;

export const SqlAPI = createApi({
  reducerPath: 'sqlApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/sql',
    prepareHeaders: prepareHeadersWithToken,
  }),
  endpoints: (builder) => ({
    schema: builder.query<{ [key in string]: string[] }, void>({ query: () => '/schema/' }),
    post: builder.mutation<Paginated<Row> & { columns: string[] }, { query: string, page: number, page_size?: number }>({
      query: ({ query, page, page_size = DEFAULT_PAGE_SIZE }) => ({
        url: `/post/${ encodeQueryParams({ page, page_size }) }`,
        method: 'POST',
        body: { query },
      }),
      transformResponse(baseQueryReturnValue: Omit<Paginated<Row> & { columns: string[] }, 'pageCount'>, _, arg): Paginated<Row> & { columns: string[] } {
        return {
          ...baseQueryReturnValue,
          pageCount: Math.ceil(baseQueryReturnValue.count / (arg.page_size ?? DEFAULT_PAGE_SIZE)),
        }
      }
    }),
  }),
})
