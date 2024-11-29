import { AppState } from '@/slices/app.ts';
import { AnnotationCampaign } from './type.ts';

export const selectCurrentCampaign = (state: AppState): AnnotationCampaign | undefined => {
  return state.campaign.currentCampaign;
}