import { AppState } from '@/service/app';
import { AnnotationCampaign, WriteAnnotationCampaign } from './type.ts';

export const selectCurrentCampaign = (state: AppState): AnnotationCampaign | undefined => {
  return state.campaign.currentCampaign;
}

export const selectDraftCampaign = (state: AppState): Partial<WriteAnnotationCampaign> => {
  return state.campaign.draftCampaign;
}
