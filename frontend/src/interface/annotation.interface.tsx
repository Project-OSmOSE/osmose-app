import { AnnotationComment } from "./annotation-comment.interface.tsx";
import { AnnotationType } from "../enum/annotation.enum.tsx";


export type Annotation = {
  id?: number,
  newId?: number, // Used only in front side - used for new annotations not saved yet
  confidenceIndicator?: string,
  annotation: string,
  startTime: number,
  endTime: number,
  type: AnnotationType,
  startFrequency: number,
  endFrequency: number,
  result_comments: Array<AnnotationComment>,
};
