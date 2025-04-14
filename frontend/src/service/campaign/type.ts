import { User } from '@/service/user';
import { Colormap } from '@/services/utils/color';

export type AnnotationCampaignUsage = 'Create' | 'Check';

export type Phase = 'Annotation' | 'Verification';

export type AnnotationCampaignPhase = {
  phase: Phase;
  created_at: string; // Date
  created_by: User;
  ended_at: string | null; // Date
  ended_by: User | null;
}

export type AnnotationCampaignArchive = {
  id: number;
  date: string; // Date
  by_user: User
}

export type BaseAnnotationCampaign = {
  name: string;
  desc: string | null;
  instructions_url: string | null;
  deadline: string | null; // Date
  datasets: Array<string>; // name
  spectro_configs: Array<number>; //pk
  labels_with_acoustic_features: Array<string>;
  allow_point_annotation: boolean;
  allow_image_tuning: boolean;
  allow_colormap_tuning: boolean;
  colormap_default: Colormap | null;
  colormap_inverted_default: boolean | null;
}

/**
 * Read interface
 */
export type AnnotationCampaign = BaseAnnotationCampaign & {
  id: number;
  created_at: string; // Date
  label_set: number; // pk
  labels_with_acoustic_features: Array<string>; // Labels
  usage: AnnotationCampaignUsage;
  owner: User;
  confidence_indicator_set: number | null; // pk
  archive: AnnotationCampaignArchive | null; // read_only

  files_count: number; // read_only
  annotations_count: number; // read_only
  user_progress: number; // read_only
  user_total: number; // read_only
  global_progress: number; // read_only
  global_total: number; // read_only
}

/**
 * Write interface for 'Create annotations' usage
 */
export type WriteCreateAnnotationCampaign = BaseAnnotationCampaign & {
  usage: 'Create';
  label_set: number; // pk
  confidence_indicator_set: number | null; // pk
}

/**
 * Write interface for 'Check annotations' usage
 */
export type WriteCheckAnnotationCampaign = BaseAnnotationCampaign & {
  usage: 'Check';
}
export type WriteAnnotationCampaign = WriteCheckAnnotationCampaign | WriteCreateAnnotationCampaign
