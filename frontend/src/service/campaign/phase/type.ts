import { Phase } from "@/service/campaign";

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
}