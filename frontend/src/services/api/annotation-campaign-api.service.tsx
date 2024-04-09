import { post, SuperAgentRequest } from "superagent";
import { AnnotationTaskStatus, Usage } from "@/types/annotations.ts";
import { AnnotationCampaignArchive, AnnotationCampaignArchiveDTO } from "@/types/campaign.ts";
import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";
import { LabelSet } from "@/types/label.ts";


export type List = Array<ListItem>
export type ListItem = {
  id: number;
  name: string;
  deadline?: Date;
  datasets_name: string;
  is_mine: boolean;
  is_archived: boolean;
  my_progress: number;
  my_total: number;
  progress: number;
  total: number;
}
export type Retrieve = {
  campaign: RetrieveCampaign;
  tasks: Array<{
    status: AnnotationTaskStatus;
    annotator_id: number;
    count: number;
  }>;
  is_campaign_owner: boolean;
}
export type RetrieveCampaign = {
  id: number;
  name: string;
  desc: string;
  archive?: AnnotationCampaignArchive;
  instructions_url: string;
  deadline?: Date;
  label_set: LabelSet;
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
  datasets_name: Array<string>;
  dataset_files_count: number;
  usage: Usage;
  created_at: Date;
}

export type Create = {
  name: string;
  desc?: string;
  instructions_url?: string;
  deadline?: string;
  datasets: Array<number>;
  spectro_configs: Array<number>;
  annotation_scope: number;
  annotators: Array<number>;
  annotation_goal: number;
} & ({
  usage: Usage.create;
  label_set: number;
  confidence_indicator_set?: number;
} | {
  usage: Usage.check;
  label_set_labels: Array<string>;
  confidence_set_indicators: Array<[string, number]>,
  detectors: Array<{
    detectorId?: number;
    detectorName: string;
    configurationId?: number;
    configuration: string
  }>;
  results: Array<CreateResultItem>;
})
export type CreateResultItem = {
  is_box: boolean
  confidence?: string;
  label: string;
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
  label_set: LabelSet;
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

class AnnotationCampaignAPIService extends APIService<List, Retrieve, CreateResult> {
  private addAnnotatorsRequest?: SuperAgentRequest;

  list(): Promise<List> {
    return super.list().then(r => r.map((d: any) => ({
      ...d,
      deadline: d.deadline ? new Date(d.deadline) : d.deadline,
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
        archive: r.campaign.archive ? new AnnotationCampaignArchive(r.campaign.archive as unknown as AnnotationCampaignArchiveDTO) : undefined,
        deadline: r.campaign.deadline ? new Date(r.campaign.deadline) : r.campaign.deadline,
        created_at: new Date(r.campaign.created_at)
      },
      tasks: r.tasks,
      is_campaign_owner: r.is_campaign_owner
    }));
  }

  public downloadResults(campaign: RetrieveCampaign): Promise<void> {
    const filename = campaign.name.replace(' ', '_') + '_results.csv';
    const url = `${ this.URI }/${ campaign.id }/report`;
    return this.download(url, filename);
  }

  public downloadStatus(campaign: RetrieveCampaign): Promise<void> {
    const filename = campaign.name.replace(' ', '_') + '_task_status.csv';
    const url = `${ this.URI }/${ campaign.id }/report_status`;
    return this.download(url, filename);
  }

  public addAnnotators(campaignId: number, data: AddAnnotators) {
    this.addAnnotatorsRequest = post(`${ this.URI }/${ campaignId }/add_annotators/`)
      .set("Authorization", this.auth.bearer)
      .send(data);
    return this.addAnnotatorsRequest.then(r => r.body).catch(this.auth.catch401.bind(this.auth))
  }

  public archive(campaignId: number) {
    this.addAnnotatorsRequest = post(`${ this.URI }/${ campaignId }/archive/`)
      .set("Authorization", this.auth.bearer);
    return this.addAnnotatorsRequest.catch(this.auth.catch401.bind(this.auth))
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
