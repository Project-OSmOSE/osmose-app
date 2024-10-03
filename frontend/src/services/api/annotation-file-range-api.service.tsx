import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";
import { User } from "@/types/user.ts";
import { AnnotationTaskStatus } from "@/types/annotations.ts";

export type AnnotationFileRange = {
  id: number;
  annotator: User;
  annotation_campaign: BasicCampaign;
  first_file_index: number;
  last_file_index: number;
}

export type BasicCampaign = {
  id: number;
  name: string,
  desc: string,
  instructions_url: string,
  deadline: null | string,
  annotation_scope: number, // Enum
  usage: number, // Enum
  label_set: number, // ID
  owner: number, // ID
  confidence_indicator_set: null | number, // ID
  archive: null | number, // ID
  datasets: Array<number>
}

export type AnnotationTask = {
  id: number;
  status: AnnotationTaskStatus;
  dataset_file: DatasetFile;
  results_count: number;
}

export type DatasetFile = {
  id: number;
  filename: string;
  filepath: string;
  size: number;
  start: string; // Date
  end: string; // Date
  dataset: number; // ID
  dataset_name: string;
}

class AnnotationFileRangeAPIService extends APIService<Array<AnnotationFileRange>, AnnotationFileRange, never> {

  public listForCampaign(campaignID: number): Promise<Array<AnnotationFileRange>> {
    return this.list(undefined, { annotation_campaign: campaignID })
  }

  public listForCampaignWithFinishedCount(campaignID: number): Promise<Array<AnnotationFileRange & {
    finished_count: number
  }>> {
    return this.list(undefined, { annotation_campaign: campaignID, with_finish_count: true }) as any
  }

  public listForCampaignWithTasks(campaignID: number): Promise<Array<AnnotationFileRange & {
    tasks: Array<AnnotationTask>
  }>> {
    return this.list(undefined, {
      annotation_campaign: campaignID,
      for_current_user: true,
      with_tasks: true
    }) as any
  }

}

export const useAnnotationFileRangeAPI = () => {
  const auth = useAuthService();
  return new AnnotationFileRangeAPIService('/api/annotation-file-range', auth);
}
