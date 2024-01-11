import { get, SuperAgentRequest } from "superagent";
import { useEffect } from "react";
import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";

export type List = Array<ListItem>

export interface ListItem {
  id: number;
  username: string;
  email: string;
}

class UserAPIService extends APIService<List, never, never> {
  private isStaffRequest?: SuperAgentRequest;

  public isStaff(): Promise<boolean> {
    this.isStaffRequest?.abort();
    this.isStaffRequest = get(`${ this.URI }/is_staff`).set("Authorization", this.auth!.bearer!);
    return this.isStaffRequest.then(r => r.body.is_staff).catch(this.catch401)
  }

  public abort() {
    super.abort();
    this.isStaffRequest?.abort();
  }

}

export const useUsersAPI = () => {
  const { context, catch401 } = useAuthService();

  useEffect(() => {
    service.auth = context;
  }, [context])

  const service = new UserAPIService('/api/user', catch401);

  return service;
}
