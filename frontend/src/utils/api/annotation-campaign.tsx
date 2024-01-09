import { download, Response } from "../requests.tsx";
import { get, post } from "superagent";
import { AnnotationTaskStatus } from "./annotation-task.tsx";

const URI = '/api/annotation-campaign';

export enum AnnotationMode {
  boxes = 1,
  wholeFile = 2
}

export enum AnnotationMethod {
  notSelected = -1,
  random = 0,
  sequential = 1
}

export type List = Array<{
  id: number;
  name: string;
  desc: string;
  instructions_url: string;
  start?: Date;
  end?: Date;
  annotation_set: {
    id: number;
    name: string;
    desc: string;
  };
  confidence_indicator_set?: {
    id: number;
    name: string;
    desc: string;
  };
  tasks_count: number;
  user_tasks_count: number;
  complete_tasks_count: number;
  user_complete_tasks_count: number;
  files_count: number;
  created_at: Date;
}>

export type Retrieve = {
  campaign: RetrieveCampaign;
  tasks: Array<{
    status: AnnotationTaskStatus;
    annotator_id: number;
    count: number;
  }>;
}
export type RetrieveCampaign = {
  id: number;
  name: string;
  desc: string;
  instructions_url: string;
  start?: Date;
  end?: Date;
  annotation_set: {
    id: number;
    name: string;
    desc: string;
    tags: Array<string>
  };
  confidence_indicator_set?: {
    id: number;
    name: string;
    desc: string;
    confidenceIndicators: Array<{
      id: number;
      label: string;
      level: number;
      isDefault: boolean;
    }>
  };
  datasets: Array<number>;
  created_at: Date;
}

export type Create = {
  name: string;
  desc?: string;
  start?: string;
  end?: string;
  datasets: Array<number>;
  spectro_configs: Array<number>;
  annotation_set_id?: number;
  confidence_indicator_set_id?: number;
  annotation_scope: number;
  annotators: Array<number>;
  annotation_goal: number;
  annotation_method: number;
  instructions_url?: string;
}

export type CreateResult = {
  id: number;
  name: string;
  desc?: string;
  start?: string;
  end?: string;
  datasets: Array<number>;
  annotation_set: {
    id: number;
    name: string;
    desc?: string;
    tags: Array<string>
  };
  created_at: string;
  confidence_indicator_set?: {
    id: number;
    name: string;
    desc: string;
    confidenceIndicators: Array<{
      id: number;
      label: string;
      level: number;
      isDefault: boolean;
    }>;
  };
  instructions_url?: string;
}

export function list(bearer: string): Response<List> {
  const request = get(URI).set("Authorization", bearer);
  return {
    request,
    response: request.then(r => r.body.map((d: any) => ({
      ...d,
      start: d.start ? new Date(d.start) : d.start,
      end: d.end ? new Date(d.end) : d.end,
      created_at: new Date(d.created_at),
    })))
  }
}

export function retrieve(id: string, bearer: string): Response<Retrieve> {
  const request = get(`${ URI }/${ id }`).set("Authorization", bearer);
  return {
    request,
    response: request.then(r => {
      return {
        campaign: {
          ...r.body.campaign,
          start: r.body.campaign.start ? new Date(r.body.campaign.start) : r.body.campaign.start,
          end: r.body.campaign.end ? new Date(r.body.campaign.end) : r.body.campaign.end,
          created_at: new Date(r.body.campaign.created_at)
        },
        tasks: r.body.tasks
      }
    })
  }
}

export function create(data: Create, bearer: string): Response<CreateResult> {
  const request = post(`${ URI }/`)
    .set("Authorization", bearer)
    .send(data);
  return {
    request,
    response: request.then(r => r.body)
  }
}

export function downloadResults(campaign: RetrieveCampaign, bearer: string): Response<void> {
  const filename = campaign.name.replace(' ', '_') + '_results.csv';
  const request = post(`${ URI }/${ campaign.id }/report`)
    .set("Authorization", bearer);
  let objectURL: string;
  return {
    request: {
      abort: () => {
        URL.revokeObjectURL(objectURL);
        request?.abort();
      }
    },
    response: download(request, filename).then(url => {
      objectURL = url
    })
  }
}

export function downloadStatus(campaign: RetrieveCampaign, bearer: string): Response<void> {
  const filename = campaign.name.replace(' ', '_') + '_task_status.csv';
  const request = post(`${ URI }/${ campaign.id }/report_status`)
    .set("Authorization", bearer);
  let objectURL: string;
  return {
    request: {
      abort: () => {
        URL.revokeObjectURL(objectURL);
        request?.abort();
      }
    },
    response: download(request, filename).then(url => {
      objectURL = url
    })
  }
}