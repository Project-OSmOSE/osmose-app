import { AnnotationComment } from "./annotation-comment.interface.tsx";
import { AnnotationType } from "../enum/annotation.enum.tsx";


export type Annotation = {
  id?: number,
  confidenceIndicator?: string,
  annotation: string,
  startTime: number,
  endTime: number,
  type: AnnotationType,
  startFrequency: number,
  endFrequency: number,
  result_comments: Array<AnnotationComment>,
};

export type AnnotationTaskDto = {
  id?: number,
  annotation: string,
  startTime: number | null,
  endTime: number | null,
  startFrequency: number | null,
  endFrequency: number | null,
  confidenceIndicator?: string,
  result_comments: Array<AnnotationComment>,
};