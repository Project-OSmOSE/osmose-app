import { AnnotationResult, DatasetFile } from "@/services/api";

export type ResultType = 'presence' | 'point' | 'box';

export function getResultType(result: AnnotationResult): ResultType {
  if (result.start_time !== null && result.start_frequency !== null) {
    if (result.end_time !== null && result.end_frequency !== null) return 'box';
    return 'point';
  }
  return 'presence';
}

export function getFileDuration(file?: DatasetFile): number {
  if (!file) return 0;
  const start = new Date(file.start).getTime() / 1000;
  const end = new Date(file.end).getTime() / 1000;
  return end - start;
}