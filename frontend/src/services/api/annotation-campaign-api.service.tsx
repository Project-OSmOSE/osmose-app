import { post, SuperAgentRequest } from "superagent";
import { useAuthService } from "../auth";
import { AnnotationTaskStatus, Usage } from "../../enum/annotation.enum.tsx";
import { APIService } from "./api-service.util.tsx";
import { Detector } from "../../view/annotation-campaign-update/import-annotations-modal/csv-import.tsx";


export type List = Array<{
  id: number;
  name: string;
  desc: string;
  instructions_url: string;
  start?: Date;
  end?: Date;
  annotation_set_name: string;
  confidence_indicator_set_name: string;
  user_tasks_count: number;
  complete_tasks_count: number;
  user_complete_tasks_count: number;
  files_count: number;
  mode: AnnotationCampaignMode;
  created_at: Date;
}>
export type AnnotationCampaignMode = 'Create' | 'Check';
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
    confidence_indicators: Array<{
      id: number;
      label: string;
      level: number;
      isDefault: boolean;
    }>
  };
  datasets: Array<number>;
  dataset_files_count: number;
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
  usage: Usage.create;
  annotators: Array<number>;
  annotation_goal: number;
  instructions_url?: string;
} | {
  name: string;
  desc?: string;
  start?: string;
  end?: string;
  datasets: Array<number>;
  detectors: Array<Detector>;
  spectro_configs: Array<number>;
  annotation_set_labels: Array<string>;
  confidence_set_indicators: Array<[string, number]>,
  results: Array<CreateResultItem>;
  annotation_scope: number;
  usage: Usage.check;
  annotators: Array<number>;
  annotation_goal: number;
  instructions_url?: string;
}
export type CreateResultItem = {
  is_box: boolean
  confidence?: string;
  tag: string;
  min_time: number;
  max_time: number;
  min_frequency: number;
  max_frequency: number;
  detector: string;
  detector_config: string;
  dataset: string;
  dataset_file: string;
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
    confidence_indicators: Array<{
      id: number;
      label: string;
      level: number;
      isDefault: boolean;
    }>;
  };
  instructions_url?: string;
}

export type AddAnnotators = {
  annotators: Array<number>,
  annotation_goal?: number
}

class AnnotationCampaignAPIService extends APIService<List, Retrieve, CreateResult>{
  private addAnnotatorsRequest?: SuperAgentRequest;

  list(): Promise<List> {
    return super.list().then(r => r.map((d: any) => ({
      ...d,
      start: d.start ? new Date(d.start) : d.start,
      end: d.end ? new Date(d.end) : d.end,
      created_at: new Date(d.created_at),
    })));
  }

  create(data: Create): Promise<CreateResult> {
    return super.create(data);
  }

  retrieve(id: string): Promise<Retrieve> {
    return super.retrieve(id).then(r => ({
      campaign: {
        ...r.campaign,
        start: r.campaign.start ? new Date(r.campaign.start) : r.campaign.start,
        end: r.campaign.end ? new Date(r.campaign.end) : r.campaign.end,
        created_at: new Date(r.campaign.created_at)
      },
      tasks: r.tasks
    }));
  }

  public downloadResults(campaign: RetrieveCampaign): Promise<void> {
    const filename = campaign.name.replace(' ', '_') + '_results.csv';
    const url= `${ this.URI }/${ campaign.id }/report`;
    return this.download(url, filename);
  }

  public downloadStatus(campaign: RetrieveCampaign): Promise<void> {
    const filename = campaign.name.replace(' ', '_') + '_task_status.csv';
    const url = `${ this.URI }/${ campaign.id }/report_status`;
    return this.download(url, filename);
  }

  public addAnnotators(campaignId: number, data: AddAnnotators) {
    this.addAnnotatorsRequest = post(`${this.URI}/${campaignId}/add_annotators/`)
      .set("Authorization", this.auth.bearer)
      .send(data);
    return this.addAnnotatorsRequest.then(r => r.body).catch(this.auth.catch401.bind(this.auth))
  }

  abort() {
    super.abort();
    this.addAnnotatorsRequest?.abort();
  }
}

export const useAnnotationCampaignAPI = () => {
  const auth = useAuthService();
  return new AnnotationCampaignAPIService('/api/annotation-campaign', auth);
}
