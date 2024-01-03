import { SuperAgentRequest, get } from "superagent";
import { AnnotationCampaign, AnnotationTask } from "./ApiService.data.tsx";
import { ApiServiceParent } from "./ApiService.parent.tsx";

export class AnnotationCampaignsApiService extends ApiServiceParent {
  public static shared: AnnotationCampaignsApiService = new AnnotationCampaignsApiService();
  private URI = '/api/annotation-campaign';

  private listRequest: SuperAgentRequest = get(this.URI);
  private retrieveRequest?: SuperAgentRequest;
  private downloadReportRequest?: SuperAgentRequest;
  private downloadReportStatusRequest?: SuperAgentRequest;

  public async list(): Promise<Array<AnnotationCampaign>> { // TODO: check type
    const response = await this.doRequest(this.listRequest);
    return response.body
  }

  public async retrieve(id: string): Promise<{ campaign: AnnotationCampaign, tasks: Array<AnnotationTask> }> {
    this.retrieveRequest?.abort();
    this.retrieveRequest = get(`${ this.URI }/${id}`)
    const response = await this.doRequest(this.listRequest);
    return response.body;
  }

  public async downloadResult(campaign: AnnotationCampaign): Promise<any> {
    this.downloadReportRequest?.abort();
    const filename = campaign.name.replace(' ', '_') + '_results.csv';
    this.downloadReportRequest = get(`${ this.URI }/${campaign.id}/report`)
    await this.downloadRequest(this.downloadReportRequest, filename);
  }

  public async downloadResultStatus(campaign: AnnotationCampaign): Promise<any> {
    this.downloadReportStatusRequest?.abort();
    const filename = campaign.name.replace(' ', '_') + '_task_status.csv';
    this.downloadReportStatusRequest = get(`${ this.URI }/${campaign.id}/report_status`)
    await this.downloadRequest(this.downloadReportStatusRequest, filename);
  }

  public abortRequests(): void {
    this.listRequest.abort()
    this.retrieveRequest?.abort();
    this.downloadReportRequest?.abort();
    this.downloadReportStatusRequest?.abort();
    if (this.currentRequestedUrl) URL.revokeObjectURL(this.currentRequestedUrl);
  }
}