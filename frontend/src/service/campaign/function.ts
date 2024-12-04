import { AppState } from '@/service/app';
import { AnnotationCampaign, CampaignErrors, WriteAnnotationCampaign } from './type.ts';

export const selectCurrentCampaign = (state: AppState): AnnotationCampaign | undefined => {
  return state.campaign.currentCampaign;
}

export const selectDraftCampaign = (state: AppState): Partial<WriteAnnotationCampaign> => {
  return state.campaign.draftCampaign;
}

export const selectDraftFileRange = (state: AppState) => {
  return state.campaign.draftFileRanges;
}

export const selectCampaignSubmissionErrors = (state: AppState): CampaignErrors => {
  return state.campaign.submissionErrors;
}