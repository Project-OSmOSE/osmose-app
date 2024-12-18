import { DetectorConfiguration } from '@/service/campaign/detector';
import { AnnotationComment, WriteAnnotationComment } from '@/service/campaign/comment';

export interface AnnotationResultValidations {
  id: number;
  annotator: number; // pk - read only
  result: number; // pk - read only
  is_valid: boolean;
}

export interface AnnotationResultBounds {
  start_time: number | null; // null for presence
  end_time: number | null; // null for presence or point
  start_frequency: number | null; // null for presence
  end_frequency: number | null; // null for presence or point
}

export const SignalTrends = [ "Flat", "Ascending", "Descending", "Modulated" ];
export type SignalTrend = typeof SignalTrends[number];

export interface AcousticFeatures {
  start_frequency: number | null;
  end_frequency: number | null;
  min_frequency: number | null;
  max_frequency: number | null;
  median_frequency: number | null;
  beginning_sweep_slope: number | null;
  end_sweep_slope: number | null;
  steps_count: number | null;
  relative_peaks_count: number | null;
  harmonics_count: number | null;
  level_peak_frequency: number | null;
  duration: number | null;
  has_harmonics: boolean | null;
  trend: SignalTrend | null;
}

export interface AnnotationResult extends AnnotationResultBounds {
  id: number;
  label: string;
  confidence_indicator: string | null;
  annotation_campaign: number; // pk - read only
  annotator: number; // pk - read only
  dataset_file: number; // pk - read only
  detector_configuration: DetectorConfiguration & { detector: string } | null;
  comments: Array<AnnotationComment>;
  validations: Array<AnnotationResultValidations>;
  acoustic_features: AcousticFeatures | null;
}

export type WriteAnnotationResult =
  Omit<AnnotationResult, "id" | "comments" | "validations" | "annotation_campaign" | "dataset_file" | "annotator">
  & {
  id: number | null;
  comments: Array<WriteAnnotationComment>;
  validations: Array<Omit<AnnotationResultValidations, "id" | "annotator" | "result"> & { id: number | null }>;
};

export interface ImportAnnotationResult {
  is_box: boolean;
  dataset: string;
  detector: string;
  detector_config: string;
  start_datetime: string; // datetime
  end_datetime: string; // datetime
  min_frequency: number;
  max_frequency: number;
  label: string;
  confidence_indicator: string | null;
}