import React, { Fragment, useMemo } from "react";
import { AnnotationCampaign, AnnotationCampaignPhase } from '@/service/types';
import { Progress } from "@/components/ui";
import { useCampaignState } from "./hook.ts";

export const CampaignGlobalProgress: React.FC<{
  phases: AnnotationCampaignPhase[],
  className?: string
}> = ({
        phases,
        className
      }) => {

  const total = useMemo(() => {
    return phases.reduce((previousValue: number, p: AnnotationCampaignPhase) => previousValue + p.global_total, 0);
  }, [ phases ]);

  const progress = useMemo(() => {
    return phases.reduce((previousValue: number, p: AnnotationCampaignPhase) => previousValue + p.global_progress, 0);
  }, [ phases ]);

  if (total === 0) return <Fragment/>
  return <Progress label='Global progress'
                   className={ className }
                   value={ progress }
                   total={ total }/>
}

export const CampaignUserProgress: React.FC<{
  campaign: AnnotationCampaign,
  phases: AnnotationCampaignPhase[],
  className?: string
}> = ({
        campaign,
        phases,
        className
      }) => {
  const { color } = useCampaignState(campaign);

  const total = useMemo(() => {
    return phases.reduce((previousValue: number, p: AnnotationCampaignPhase) => previousValue + p.user_total, 0);
  }, [ phases ]);

  const progress = useMemo(() => {
    return phases.reduce((previousValue: number, p: AnnotationCampaignPhase) => previousValue + p.user_progress, 0);
  }, [ phases ]);

  if (total === 0) return <Fragment/>
  return <Progress label='My progress'
                   className={ className }
                   color={ color }
                   value={ progress }
                   total={ total }/>
}
