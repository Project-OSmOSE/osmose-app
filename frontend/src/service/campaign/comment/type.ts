export interface AnnotationComment {
  id: number;
  annotation_result: number | null; // pk
  annotation_campaign: number; // pk
  author: number; // pk
  dataset_file: number; // pk
  comment: string;
}
