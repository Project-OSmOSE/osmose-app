export interface AnnotationComment {
  id: number;
  annotation_result: number | null; // pk
  annotation_campaign: number; // pk
  author: number; // pk
  dataset_file: number; // pk
  comment: string;
}

export type WriteAnnotationComment =
  Omit<AnnotationComment, "id" | "annotation_result" | "annotation_campaign" | "author" | "dataset_file">
  & { id?: number; }
