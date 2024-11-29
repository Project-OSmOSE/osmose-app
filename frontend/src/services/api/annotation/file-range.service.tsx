import { OldAPIService } from "../api-service.util.tsx";
import { DatasetFile } from "../data/file.service.ts";

/**
 * Read
 */
export interface AnnotationFileRange {
  id: number;
  first_file_index: number;
  last_file_index: number;
  files_count: number; // read only
  annotator: number; // pk
  annotation_campaign: number; // pk - read only

  finished_tasks_count: number; // read only
}

export type AnnotationFileRangeWithFiles = AnnotationFileRange & {
  files: Array<DatasetFile & {
    is_submitted: boolean; // read only
    results_count: number; // read only
  }>; // read only
}

export type WriteAnnotationFileRange =
  Omit<AnnotationFileRange, "id" | "files_count" | "annotation_campaign" | "finished_tasks_count">
  & { id?: number; }

class AnnotationFileRangeAPIService extends OldAPIService<AnnotationFileRange, WriteAnnotationFileRange> {

  listForCampaign(campaignID: string | number): Promise<Array<AnnotationFileRange>> {
    return this.list(undefined, {
      annotation_campaign: campaignID,
    })
  }

  listForCampaignCurrentUser(campaignID: string | number): Promise<Array<AnnotationFileRangeWithFiles>> {
    return this.list(undefined, {
      annotation_campaign: campaignID,
      for_current_user: true,
      with_files: true
    }) as Promise<Array<AnnotationFileRangeWithFiles>>
  }

  updateForCampaign(campaignID: string | number, data: Array<WriteAnnotationFileRange>): Promise<Array<AnnotationFileRange>> {
    return super.create(data as any, `${ this.URI }/campaign/${ campaignID }/`) as Promise<any>
  }

  create(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useAnnotationFileRangeAPI = () => {
  return new AnnotationFileRangeAPIService('/api/annotation-file-range');
}
