import { SuperAgentRequest, get } from "superagent";
import { AnnotationCampaign } from "./ApiService.data.tsx";
import { AuthService } from "./AuthService.tsx";

export class AnnotationCampaignsApiService {
  public static shared: AnnotationCampaignsApiService = new AnnotationCampaignsApiService();
  private URI = '/api/annotation-campaign';

  private listRequest: SuperAgentRequest = get(this.URI);

  public async list(): Promise<Array<AnnotationCampaign>> { // TODO: check type
    try {
      const response = await this.listRequest.set("Authorization", AuthService.shared.bearer);
      return response.body;
    } catch (e) {
      this.handleError(e);
      throw e;
    }
  }

  public abortList(): void {
    this.listRequest.abort();
  }

  private handleError(error: any) {
    if (error?.status === 401) AuthService.shared.logout();
  }
}