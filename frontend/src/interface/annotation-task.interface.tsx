import { AnnotationMode } from "../enum";

export interface AnnotationTask {
  id: string;
  instructions_url?: string;
  campaignId: string;
  audioUrl: string;
  duration: number;
  prevAndNextAnnotation: {
    prev: string;
    next: string;
  };
  confidenceIndicatorSet?: any;
  boundaries: AnnotationTaskBoundaries;
  annotationTags: Array<string>;
  annotationScope: AnnotationMode;
  // TODO
}

export interface AnnotationTaskBoundaries {
  startTime: Date,
  endTime: Date,
  startFrequency: number,
  endFrequency: number,
}