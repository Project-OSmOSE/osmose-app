import { DatasetFile } from "@/services/api";

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