import { AnnotationResult } from "@/services/api";

export type ResultType = 'presence' | 'point' | 'box';

export function getResultType(result: AnnotationResult): ResultType {
  if (result.start_time !== null && result.start_frequency !== null) {
    if (result.end_time !== null && result.end_frequency !== null) return 'box';
    return 'point';
  }
  return 'presence';
}
