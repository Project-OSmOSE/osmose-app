import { Response } from "../requests.tsx";
import { get, post } from "superagent";
import * as Dataset from "./dataset.tsx";

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
  const response = new Promise<List>((resolve, reject) => {
    request.then(r => r.body.map((d: any) => ({
      ...d,
      start: d.start ? new Date(d.start) : d.start,
      end: d.end ? new Date(d.end) : d.end,
      created_at: new Date(d.created_at),
    }))).then(resolve).catch(reject);
  });
  return { request, response }
}

export function create(data: Create, bearer: string): Response<CreateResult> {
  const request = post(`${ URI }/`)
    .set("Authorization", bearer)
    .send(data);
  const response = new Promise<CreateResult>((resolve, reject) => {
    request.then(r => r.body).then(resolve).catch(reject);
  });
  return { request, response }
}