import { API } from "@/service/api/index.ts";
import { Collaborator } from "@/service/types";

export const CollaboratorAPI = API.injectEndpoints({
  endpoints: builder => ({
    listCollaborator: builder.query<Array<Collaborator>, void>({
      query: () => 'collaborators/on_aplose_home',
      providesTags: [ 'Collaborator' ]
    }),
  })
})