import { get, SuperAgentRequest } from "superagent";
import { useEffect, useMemo } from "react";
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
  const service = useMemo(() => new UserAPIService('/api/user', catch401), [catch401]);

  useEffect(() => {
    service.auth = context;
  }, [context, service])
  return service;
}
