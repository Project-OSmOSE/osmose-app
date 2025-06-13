import { API } from "@/service/api";

export type Source = {
  id: number;
  english_name: string;
  parent: number | null; //pk parent
}

export type SourceTree = {
  id: number;
  english_name: string;
  children: SourceTree[];
}

function getTreeChildren(all: Source[], id: number | null): SourceTree[] {
  return all.filter(source => source.parent === id).map(source => ({
    ...source,
    children: getTreeChildren(all, source.id)
  }))
}

export type Post<T extends { id: number }> = Omit<T, 'id'> & { id?: number }
export type Patch<T extends { id: number }> = Pick<T, 'id'> & Partial<T>
export type Delete<T extends { id: number }> = Pick<T, 'id'>

export const OntologySourceAPI = API.injectEndpoints({
  endpoints: (builder) => ({

    listOntologySource: builder.query<Source[], void>({
      query: () => `ontology/source/`,
      providesTags: [ 'OntologySource' ]
    }),

    getTreeOntologySource: builder.query<SourceTree[], void>({
      query: () => `ontology/source/`,
      providesTags: [ 'OntologySourceTree' ],
      transformResponse(sources: Source[]): SourceTree[] {
        return getTreeChildren(sources, null)
      }
    }),

    postOntologySource: builder.mutation<Source, Post<Source>>({
      query: (body) => {
        if (body.parent === -1) body.parent = null;
        console.debug('POST', body.english_name, body.parent)
        return {
          url: `ontology/source/`,
          method: 'POST',
          body
        }
      },
      invalidatesTags: [ 'OntologySource', 'OntologySourceTree' ] // : made at flow page exit
    }),

    patchOntologySource: builder.mutation<Source, Patch<Source>>({
      query: (body) => {
        if (body.parent === -1) body.parent = null;
        console.debug('PATCH', body.english_name, body.parent)
        return {
          url: `ontology/source/${ body.id }/`,
          method: 'PATCH',
          body
        }
      },
      invalidatesTags: [ 'OntologySource', 'OntologySourceTree' ] // : made at flow page exit
    }),

    deleteOntologySource: builder.mutation<void, Delete<Source>>({
      query: (body) => {
        console.debug('DELETE', body)
        return {
          url: `ontology/source/${ body.id }/`,
          method: 'DELETE',
        }
      },
      invalidatesTags: [ 'OntologySource', 'OntologySourceTree' ] // : made at flow page exit
    }),

  })
})
