import { SuperAgentRequest, get } from "superagent";
import { AnnotationTask, TaskStatus } from "./ApiService.data.tsx";
import { ApiServiceParent } from "./ApiService.parent.tsx";

export class AnnotationTasksApiService extends ApiServiceParent {
  public static shared: AnnotationTasksApiService = new AnnotationTasksApiService();
  private URI = '/api/annotation-task';

  private listForCampaignRequest?: SuperAgentRequest;

  public async list(campaignID: string): Promise<Array<AnnotationTask>> { // TODO: check type
    this.listForCampaignRequest = get(`${this.URI}/campaign/${campaignID}`);
    const response = await this.doRequest(this.listForCampaignRequest);
    return response.body.forEach((task: any) => {
      switch (task.status) {
        case 0:
          task.status = TaskStatus.created;
          break;
        case 1:
          task.status = TaskStatus.started;
          break;
        case 2:
          task.status = TaskStatus.finished;
          break;
      }
    })
  }

  public abortRequests(): void {
    this.listForCampaignRequest?.abort()
  }
}