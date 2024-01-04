import { SuperAgentRequest, get } from "superagent";
import { ConfidenceIndicatorSet } from "./ApiService.data.tsx";
import { ApiServiceParent } from "./ApiService.parent.tsx";

export class ConfidenceSetApiService extends ApiServiceParent {
  public static shared: ConfidenceSetApiService = new ConfidenceSetApiService();
  private URI = '/api/confidence-indicator';

  private listRequest: SuperAgentRequest = get(this.URI);

  public async list(): Promise<Array<ConfidenceIndicatorSet>> { // TODO: check type
    const response = await this.doRequest(this.listRequest)
    return response.body;
  }

  public abortRequests(): void {
    this.listRequest.abort();
  }
}