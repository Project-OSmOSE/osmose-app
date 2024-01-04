import { SuperAgentRequest, get } from "superagent";
import { AnnotationMode, AnnotationTask, TaskStatus } from "./ApiService.data.tsx";
import { ApiServiceParent } from "./ApiService.parent.tsx";
import { AnnotationDto } from "../../AudioAnnotator/AudioAnnotator.tsx";

export interface AnnotationTaskRetrieve {
  id: number;
  campaignId: number;
  annotationTags: string[];
  boundaries: {
    startTime: Date;
    endTime: Date;
    startFrequency: number;
    endFrequency: number;
  },
  audioUrl: string;
  audioRate: number;
  spectroUrls: Array<{
    nfft: number;
    winsize: number;
    overlap: number;
    urls: string[];
  }>;
  prevAnnotations: Array<{
    id: number;
    annotation: string;
    startTime: number;
    endTime: number;
    startFrequency: number;
    endFrequency: number;
    confidenceIndicator: string;
    result_comments: Array<AnnotationTaskRetrieveComment>;
  }>;
  annotationScope: AnnotationMode;
  prevAndNextAnnotation: {
    prev: number;
    next: number;
  };
  taskComment: Array<AnnotationTaskRetrieveComment>;
  confidenceIndicatorSet: {
    id: number;
    name: string;
    desc: string;
    confidenceIndicators: Array<{
      id: number;
      label: string;
      level: number;
      isDefault: boolean;
    }>;
  }
}

interface AnnotationTaskRetrieveComment {
  id: number;
  comment: string;
  annotation_task: number;
  annotation_result: number | null;
}

export class AnnotationTasksApiService extends ApiServiceParent {
  public static shared: AnnotationTasksApiService = new AnnotationTasksApiService();
  private URI = '/api/annotation-task';

  private listForCampaignRequest?: SuperAgentRequest;
  private retrieveRequest?: SuperAgentRequest;
  private updateRequest?: SuperAgentRequest;
  private addAnnotationRequest?: SuperAgentRequest;

  public async listForCampaign(campaignID: string): Promise<Array<AnnotationTask>> { // TODO: check type
    this.listForCampaignRequest = get(`${ this.URI }/campaign/${ campaignID }`);
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

  public async retrieve(taskID: number): Promise<AnnotationTaskRetrieve> {
    this.retrieveRequest = get(`${ this.URI }/${ taskID }`);
    const response = await this.doRequest(this.retrieveRequest);
    const task = response.body;
    task.boundaries.startTime = new Date(task.boundaries.startTime);
    task.boundaries.endTime = new Date(task.boundaries.endTime);
    return task;
  }

  public async update(taskID: number,
                             annotations: AnnotationDto[],
                             taskStartTime: number,
                             taskEndTime: number): Promise<{
    next_task: number;
    campaign_id: number;
  }> {
    this.updateRequest = get(`${ this.URI }/${ taskID }`);
    const response = await this.doRequest(this.updateRequest.send({
      annotations,
      task_start_time: taskStartTime,
      task_end_time: taskEndTime,
    }));
    return response.body;
  }

  public async addAnnotation(taskID: number,
                             annotation: AnnotationDto,
                             taskStartTime: number,
                             taskEndTime: number): Promise<number> {
    this.addAnnotationRequest = get(`${ this.URI }/one-result/${ taskID }`);
    const response = await this.doRequest(this.addAnnotationRequest.send({
      annotation,
      task_start_time: taskStartTime,
      task_end_time: taskEndTime,
    }));
    return response.body.id;
  }

  public abortRequests(): void {
    this.listForCampaignRequest?.abort()
    this.retrieveRequest?.abort()
    this.updateRequest?.abort()
    this.addAnnotationRequest?.abort()
  }
}