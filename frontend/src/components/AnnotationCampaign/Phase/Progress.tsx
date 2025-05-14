import React, { Fragment } from "react";
import { AnnotationCampaignPhase } from "@/service/types";
import { Progress } from "@/components/ui";

export const PhaseGlobalProgress: React.FC<{
  phase: AnnotationCampaignPhase,
  className?: string
}> = ({ phase, className }) => {
  return <Progress label='Global progress'
                   className={ className }
                   value={ phase.global_progress }
                   total={ phase.global_total }/>
}

export const PhaseUserProgress: React.FC<{
  phase: AnnotationCampaignPhase,
  className?: string
}> = ({ phase, className }) => {
  if (phase.user_total === 0) return <Fragment/>
  return <Progress label='My progress'
                   className={ className }
                   color='primary'
                   value={ phase.user_progress }
                   total={ phase.user_total }/>
}
