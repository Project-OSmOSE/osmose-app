import { DatasetFile } from '@/service/dataset';

export interface AnnotationFileRange {
  id: number;
  first_file_index: number;
  last_file_index: number;
  files_count: number; // read only
  annotator: number; // pk
  annotation_campaign_phase: number; // pk - read only

  finished_tasks_count: number; // read only
}

export type AnnotationFile = DatasetFile & {
  is_submitted: boolean; // read only
  results_count: number; // read only
  validated_results_count: number; // read only
}

export type WriteAnnotationFileRange =
  Omit<AnnotationFileRange, "id" | "first_file_index" | "last_file_index" | "files_count" | "annotation_campaign_phase" | "finished_tasks_count">
  & Partial<Pick<AnnotationFileRange, "id" | "first_file_index" | "last_file_index">>

export type PostAnnotationFileRange =
  WriteAnnotationFileRange & Pick<AnnotationFileRange, "id">
