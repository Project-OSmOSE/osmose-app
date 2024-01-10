import { APIService } from "../requests.tsx";
import { get, SuperAgentRequest } from "superagent";
import { useAuth, useAuthDispatch } from "../auth.tsx";
import { useEffect } from "react";

export type List = Array<ListItem>
export interface ListItem {
  id: number;
  username: string;
  email: string;
}

export const useUsersAPI = () => {
  const auth = useAuth();
  const authDispatch = useAuthDispatch();

  useEffect(() => {
    service.setAuth(auth)
  }, [auth])

  const service = new class UserAPIService extends APIService<List, never, never>{
    URI = '/api/user';

    private isStaffRequest?: SuperAgentRequest;

    public isStaff(): Promise<boolean> {
      this.isStaffRequest?.abort();
      this.isStaffRequest = get(`${ this.URI }/is_staff`).set("Authorization", this.auth.bearer!);
      return this.isStaffRequest.then(r => r.body.is_staff).catch(this.catch401)
    }

    public abort() {
      super.abort();
      this.isStaffRequest?.abort();
    }

  }(auth, authDispatch!);

  return service;
}
