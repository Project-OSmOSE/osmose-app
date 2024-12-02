import { AppState } from '@/slices/app.ts';
import { AnnotationCampaign, CampaignErrors, WriteAnnotationCampaign } from './type.ts';

export const selectCurrentCampaign = (state: AppState): AnnotationCampaign | undefined => {
  return state.campaign.currentCampaign;
}

export const selectDraftCampaign = (state: AppState): Partial<WriteAnnotationCampaign> => {
  return state.campaign.draftCampaign;
}

export const selectCampaignSubmissionErrors = (state: AppState): CampaignErrors => {
  return state.campaign.submissionErrors;
}