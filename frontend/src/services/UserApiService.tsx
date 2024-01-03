import { SuperAgentRequest, get } from 'superagent';
import { User } from "./ApiService.data.tsx";
import { ApiServiceParent } from "./ApiService.parent.tsx";

export class UserApiService extends ApiServiceParent {
  public static shared: UserApiService = new UserApiService();
  private URI = '/api/user';

  public listRequest: SuperAgentRequest = get(this.URI);
  public isStaffRequest: SuperAgentRequest = get(`${ this.URI }/is_staff`);

  public async list(): Promise<Array<User>> {
    const response = await this.doRequest(this.listRequest);
    return response.body
  }

  public async isStaff(): Promise<boolean> {
    const response = await this.doRequest(this.listRequest);
    return response.body.is_staff;
  }

  public abortRequests() {
    this.listRequest.abort();
    this.isStaffRequest.abort();
  }
}