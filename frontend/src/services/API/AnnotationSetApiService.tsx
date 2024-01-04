import { SuperAgentRequest, get } from "superagent";
import { AnnotationSet } from "./ApiService.data.tsx";
import { ApiServiceParent } from "./ApiService.parent.tsx";

export class AnnotationSetApiService extends ApiServiceParent {
  public static shared: AnnotationSetApiService = new AnnotationSetApiService();
  private URI = '/api/annotation-set';

  private listRequest: SuperAgentRequest = get(this.URI);

  public async list(): Promise<Array<AnnotationSet>> { // TODO: check type
    const response = await this.doRequest(this.listRequest)
    return response.body;
  }

  public abortRequests(): void {
    this.listRequest.abort();
  }
}