import { API } from "./index.ts";
import { Paginated } from "@/service/type.ts";

type Row = (string | number | null)[]
const DEFAULT_PAGE_SIZE = 20;

export const SQLAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    sqlSchema: builder.query<{ [key in string]: string[] }, void>({
      query: () => 'sql/schema/',
      providesTags: [ { type: 'SQL', id: 'schema' } ]
    }),
    postSQL: builder.mutation<Paginated<Row> & { columns: string[] }, {
      query: string,
      page: number,
      page_size?: number
    }>({
      query: ({ query, page, page_size = DEFAULT_PAGE_SIZE }) => ({
        url: `sql/post/`,
        params: { page, page_size },
        method: 'POST',
        body: { query },
      }),
      transformResponse(baseQueryReturnValue: Omit<Paginated<Row> & {
        columns: string[]
      }, 'pageCount'>, _, arg): Paginated<Row> & { columns: string[] } {
        return {
          ...baseQueryReturnValue,
          pageCount: Math.ceil(baseQueryReturnValue.count / (arg.page_size ?? DEFAULT_PAGE_SIZE)),
        }
      }
    }),
  })
})
