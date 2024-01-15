import { AnnotationMode } from "../enum";
import { AnnotationComment } from "./annotation-comment.interface.tsx";

export interface AnnotationTag {
  id: string;
  annotation: string;
  confidenceIndicator?: string;
  type: AnnotationMode;
  startTime: number;
  endTime: number;
  startFrequency: number;
  endFrequency: number;
  result_comments: Array<AnnotationComment>;
  // TODO
}