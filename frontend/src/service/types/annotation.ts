import { DetectorConfiguration } from './detector';
import { DatasetFile } from "@/service/types/data.ts";

export interface AnnotationComment {
  id: number;
  annotation_result: number | null; // pk
  annotation_campaign: number; // pk
  author: number; // pk
  dataset_file: number; // pk
  comment: string;
}

export interface AnnotationResultValidations {
  id: number;
  annotator: number; // pk - read only
  result: number; // pk - read only
  is_valid: boolean;
}

export const SignalTrends = [ "Flat", "Ascending", "Descending", "Modulated" ];
export type SignalTrend = typeof SignalTrends[number];

export interface AcousticFeatures {
  start_frequency: number | null;
  end_frequency: number | null;

  relative_max_frequency_count: number | null;
  relative_min_frequency_count: number | null;

  has_harmonics: boolean | null;
  trend: SignalTrend | null;
  steps_count: number | null;
}

export type AnnotationResultType = 'Weak' | 'Point' | 'Box';

interface BaseAnnotationResult {
  id: number;
  label: string;
  confidence_indicator: string | null;
  annotation_campaign_phase: number; // pk - read only
  annotator: number | null; // pk - read only
  dataset_file: number; // pk - read only
  detector_configuration: DetectorConfiguration & { detector: string } | null;
  comments: Array<AnnotationComment>;
  validations: Array<AnnotationResultValidations>;
  acoustic_features: AcousticFeatures | null;
  updated_to: AnnotationResult[];
}

export type WeakBounds = {
  type: 'Weak',
  start_time: null;
  end_time: null;
  start_frequency: null;
  end_frequency: null;
}
export type PointBounds = {
  type: 'Point',
  start_time: number;
  end_time: null;
  start_frequency: number;
  end_frequency: null;
}
export type BoxBounds = {
  type: 'Box',
  start_time: number;
  end_time: number;
  start_frequency: number;
  end_frequency: number;
}

export type AnnotationResultBounds = WeakBounds | PointBounds | BoxBounds

export type AnnotationResult = BaseAnnotationResult & AnnotationResultBounds
export type WeakResult = BaseAnnotationResult & WeakBounds
export type PointResult = BaseAnnotationResult & PointBounds
export type BoxResult = BaseAnnotationResult & BoxBounds

export type AnnotatorData = {
  is_submitted: boolean;
  is_assigned: boolean; // Is the user allowed to edit this file
  campaignID: number;
  userID: number
  file: DatasetFile;
  results: Array<AnnotationResult>;
  task_comments: Array<AnnotationComment>;
  previous_file_id: number | null;
  next_file_id: number | null;

  current_task_index: number;
  total_tasks: number;
  current_task_index_in_filter: number;
  total_tasks_in_filter: number;
}