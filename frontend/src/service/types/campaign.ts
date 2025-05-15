import { User } from "./user.ts";
import { Colormap } from "@/services/utils/color.ts";
import { DatasetFile } from "./data.ts";

export type AnnotationCampaignUsage = 'Create' | 'Check';
export type Phase = 'Annotation' | 'Verification';

export type AnnotationCampaignArchive = {
  id: number;
  date: string; // Date
  by_user: User
}

export type AnnotationCampaignPhase = {
  id: number;
  phase: Phase;
  /** Date */
  created_at: string;
  /** Display name */
  created_by: string;
  /** Date */
  ended_at: string;
  /** Display name */
  ended_by: string;
  global_progress: number;
  global_total: number;
  user_progress: number;
  user_total: number;
  has_annotations: boolean;
  annotation_campaign: number; // pk
}

export type AnnotationCampaign = {
  id: number;
  name: string;
  desc: string | null;
  /** URL */
  instructions_url: string | null;
  /** Date */
  deadline: string | null;

  owner: User;
  /** Date */
  created_at: string;
  archive: AnnotationCampaignArchive | null;
  phases: AnnotationCampaignPhase[];

  datasets: string[]
  files_count: number;

  /** ID */
  label_set: number | null;
  labels_with_acoustic_features: string[]
  /** ID */
  confidence_indicator_set: number | null;

  allow_point_annotation: boolean;
  allow_image_tuning: boolean;
  allow_colormap_tuning: boolean;
  colormap_default: Colormap | null;
  colormap_inverted_default: boolean | null;
}

export interface LabelSet {
  id: number;
  name: string;
  desc?: string;
  labels: Array<string>;
}

export interface ConfidenceIndicator {
  id: number;
  label: string;
  level: number;
  is_default: boolean;
}

export interface ConfidenceIndicatorSet {
  id: number;
  name: string;
  desc: string;
  confidence_indicators: Array<ConfidenceIndicator>
}

export interface AnnotationFileRange {
  id: number;
  first_file_index: number;
  last_file_index: number;
  files_count: number; // read only
  annotator: number; // pk
  annotation_campaign_phase: number; // pk - read only

  finished_tasks_count: number; // read only
}

export type AnnotationFile = DatasetFile & {
  is_submitted: boolean; // read only
  results_count: number; // read only
  validated_results_count: number; // read only
}

