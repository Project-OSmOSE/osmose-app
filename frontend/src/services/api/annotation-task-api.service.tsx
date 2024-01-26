import { put, SuperAgentRequest } from "superagent";
import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";
import { AnnotationComment } from "../../interface/annotation-comment.interface.tsx";
import { AnnotationMode, AnnotationTaskStatus } from "../../enum/annotation.enum.tsx";

export type List = Array<ListItem>
export type ListItem = {
  id: number;
  status: AnnotationTaskStatus;
  filename: string;
  dataset_name: string;
  start: Date;
  end: Date;
}

export interface Retrieve {
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
  prevAnnotations: Array<RetrieveAnnotation>;
  annotationScope: AnnotationMode;
  prevAndNextAnnotation: {
    prev: number;
    next: number;
  };
  taskComment: Array<RetrieveComment>;
  confidenceIndicatorSet: {
    id: number;
    name: string;
    desc: string;
    confidenceIndicators: Array<RetrieveConfidenceIndicator>;
  }
}

export interface RetrieveAnnotation {
  id: number;
  annotation: string;
  startTime: number;
  endTime: number;
  startFrequency: number;
  endFrequency: number;
  confidenceIndicator: string;
  result_comments: Array<RetrieveComment>;
}

export interface RetrieveConfidenceIndicator {
  id: number;
  label: string;
  level: number;
  isDefault: boolean;
}

export interface RetrieveComment {
  id: number;
  comment: string;
  annotation_task: number;
  annotation_result: number | null;
}

export type AnnotationTaskDto = {
  id?: number,
  annotation: string,
  startTime: number | null,
  endTime: number | null,
  startFrequency: number | null,
  endFrequency: number | null,
  confidenceIndicator?: string,
  result_comments: Array<AnnotationComment>,
};

interface AddAnnotation {
  annotation: AnnotationTaskDto,
  task_start_time: number,
  task_end_time: number,
}

interface Update {
  annotations: AnnotationTaskDto[],
  task_start_time: number,
  task_end_time: number,
}
export interface UpdateResult {
  next_task: number;
  campaign_id: number;
}

export class AnnotationTaskAPIService extends APIService<List, Retrieve, never> {
  private addAnnotationRequest?: SuperAgentRequest;
  private updateRequest?: SuperAgentRequest;

  list(campaignID: string): Promise<List> {
    return super.list(`${ this.URI }/campaign/${ campaignID }`).then(r => r.map((d: any) => ({
      ...d,
      start: new Date(d.start),
      end: new Date(d.end),
    })));
  }

  retrieve(id: string): Promise<Retrieve> {
    return super.retrieve(id).then(r => ({
      ...r,
      boundaries: {
        ...r.boundaries,
        startTime: new Date(r.boundaries.startTime),
        endTime: new Date(r.boundaries.endTime),
      }
    }))
  }

  public addAnnotation(taskID: string | number,
                       data: AddAnnotation): Promise<number> {
    this.addAnnotationRequest = put(`${ this.URI }/one-result/${ taskID }/`)
      .set("Authorization", this.auth.bearer)
      .send(data);
    return this.addAnnotationRequest.then(r => r.body.id).catch(this.auth.catch401.bind(this.auth))
  }

  public update(taskID: number,
                data: Update): Promise<UpdateResult> {
    this.addAnnotationRequest = put(`${ this.URI }/${ taskID }/`)
      .set("Authorization", this.auth.bearer)
      .send(data);
    return this.addAnnotationRequest.then(r => r.body).catch(this.auth.catch401.bind(this.auth))
  }

  abort() {
    super.abort();
    this.addAnnotationRequest?.abort();
    this.updateRequest?.abort();
  }

  create(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useAnnotationTaskAPI = () => {
  const auth = useAuthService();
  return new AnnotationTaskAPIService('/api/annotation-task', auth);
}