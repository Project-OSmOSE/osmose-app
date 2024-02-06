import { get, SuperAgentRequest } from "superagent";
import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";

export type List = Array<ListItem>

export interface ListItem {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

class UserAPIService extends APIService<List, never, never> {
  private isStaffRequest?: SuperAgentRequest;

  public isStaff(): Promise<boolean> {
    this.isStaffRequest?.abort();
    this.isStaffRequest = get(`${ this.URI }/is_staff`).set("Authorization", this.auth.bearer);
    return this.isStaffRequest.then(r => r.body.is_staff).catch(this.auth.catch401.bind(this.auth))
  }

  public abort() {
    super.abort();
    this.isStaffRequest?.abort();
  }

  retrieve(): Promise<never> {
    throw 'Unimplemented';
  }

  create(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useUsersAPI = () => {
  const auth = useAuthService();
  return new UserAPIService('/api/user', auth);
}
