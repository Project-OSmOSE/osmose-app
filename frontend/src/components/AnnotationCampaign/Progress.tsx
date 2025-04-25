import React, { Fragment, useMemo } from "react";
import { AnnotationCampaign } from "@/service/campaign";
import { Progress } from "@/components/ui";
import { useCampaignState } from "./hook.ts";
import { AnnotationCampaignPhase } from "@/service/campaign/phase";

export const CampaignGlobalProgress: React.FC<{ campaign: AnnotationCampaign, className?: string }> = ({
                                                                                                         campaign,
                                                                                                         className
                                                                                                       }) => {

  const total = useMemo(() => {
    return campaign.phases.reduce((previousValue: number, p: AnnotationCampaignPhase) => previousValue + p.global_total, 0);
  }, [ campaign.phases ]);

  const progress = useMemo(() => {
    return campaign.phases.reduce((previousValue: number, p: AnnotationCampaignPhase) => previousValue + p.global_progress, 0);
  }, [ campaign.phases ]);

  if (total === 0) return <Fragment/>
  return <Progress label='Global progress'
                   className={ className }
                   value={ progress }
                   total={ total }/>
}

export const CampaignUserProgress: React.FC<{ campaign: AnnotationCampaign, className?: string }> = ({
                                                                                                       campaign,
                                                                                                       className
                                                                                                     }) => {
  const { color } = useCampaignState(campaign);

  const total = useMemo(() => {
    return campaign.phases.reduce((previousValue: number, p: AnnotationCampaignPhase) => previousValue + p.user_total, 0);
  }, [ campaign.phases ]);

  const progress = useMemo(() => {
    return campaign.phases.reduce((previousValue: number, p: AnnotationCampaignPhase) => previousValue + p.user_progress, 0);
  }, [ campaign.phases ]);

  if (total === 0) return <Fragment/>
  return <Progress label='My progress'
                   className={ className }
                   color={ color }
                   value={ progress }
                   total={ total }/>
}
