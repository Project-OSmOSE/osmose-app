export interface AnnotationComment {
  id: number;
  annotation_result: number | null; // pk
  annotation_campaign_phase: number; // pk
  author: number; // pk
  dataset_file: number; // pk
  comment: string;
}

export type WriteAnnotationComment =
  Omit<AnnotationComment, "id" | "annotation_result" | "annotation_campaign_phase" | "author" | "dataset_file">
  & { id?: number; }
