import { User } from '@/service/user';
import { Colormap } from '@/services/utils/color';
import { AnnotationCampaignPhase } from "@/service/campaign/phase";

export type AnnotationCampaignUsage = 'Create' | 'Check';
export type Phase = 'Annotation' | 'Verification';

export type AnnotationCampaignArchive = {
  id: number;
  date: string; // Date
  by_user: User
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
export type OldAnnotationCampaign = BaseAnnotationCampaign & {
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
  my_progress: number; // read_only
  my_total: number; // read_only
  progress: number; // read_only
  total: number; // read_only
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
