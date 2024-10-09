import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";
import { AnnotationTaskStatus } from "@/types/annotations.ts";

export type AnnotationFileRange = {
  id: number;
  annotator: number;
  annotation_campaign: number;
  first_file_index: number;
  last_file_index: number;
  finished_tasks_count: number;
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
  datasets: Array<number>,
  files_count: number,
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
  is_submitted: boolean;
  results_count: number;
}

class AnnotationFileRangeAPIService extends APIService<Array<AnnotationFileRange>, AnnotationFileRange, never> {

  public listForCampaign(campaignID: number): Promise<Array<AnnotationFileRange>> {
    return this.list(undefined, { annotation_campaign: campaignID })
  }

  public listForCampaignWithFiles(campaignID: number): Promise<Array<AnnotationFileRange & {
    files: Array<DatasetFile>;
  }>> {
    return this.list(undefined, {
      annotation_campaign: campaignID,
      for_current_user: true,
      with_files: true
    }) as any
  }

  public send(data: Array<AnnotationFileRange>, max_files: number): Promise<never> {
    return super.create(data.map(range => ({
      ...range,
      id: range.id < 0 ? undefined : range.id,
      first_file_index: range.first_file_index < 0 ? 0 : range.first_file_index,
      last_file_index: range.last_file_index < 0 ? max_files : range.last_file_index
    })), `${ this.URI }/many/`);
  }
}

export const useAnnotationFileRangeAPI = () => {
  const auth = useAuthService();
  return new AnnotationFileRangeAPIService('/api/annotation-file-range', auth);
}
