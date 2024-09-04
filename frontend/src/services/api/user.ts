import { get, SuperAgentRequest } from "superagent";
import { useAuthService } from "../auth";

import { APIService } from "./api-service.util.tsx";
import { User } from '@/types/user';

class UserAPIService extends APIService<any, never, never> {
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

  async list(): Promise<Array<User>> {
    return await super.list()
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
