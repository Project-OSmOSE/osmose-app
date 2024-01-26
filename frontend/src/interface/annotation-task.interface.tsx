import { AnnotationMode } from "../enum";
import { ConfidenceIndicatorSet } from "./confidence-indicator.interface.tsx";
import { SpectroUrlsParams } from "./spectrogram.interface.tsx";

export interface AnnotationTask {
  id: number;
  instructions_url?: string;
  campaignId: number;
  audioUrl: string;
  audioRate: number;
  duration: number;
  prevAndNextAnnotation: {
    prev: number;
    next: number;
  };
  confidenceIndicatorSet?: ConfidenceIndicatorSet;
  boundaries: AnnotationTaskBoundaries;
  annotationTags: Array<string>;
  annotationScope: AnnotationMode;
  spectroUrls: Array<SpectroUrlsParams>,
  // TODO
}

export interface AnnotationTaskBoundaries {
  startTime: Date,
  endTime: Date,
  startFrequency: number,
  endFrequency: number,
}