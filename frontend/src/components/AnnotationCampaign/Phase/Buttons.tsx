import React, { Fragment, useCallback, useMemo } from "react";
import { Button, Link, TooltipOverlay } from "@/components/ui";
import { IonIcon } from "@ionic/react";
import { cloudDownloadOutline, peopleOutline, playOutline } from "ionicons/icons";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useListPhasesForCurrentCampaign, useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";
import { PaginatedAnnotationFiles } from "@/service/api/annotation-file-range.ts";
import { useNavigate } from "react-router-dom";

export const ResumeButton: React.FC<{
  files?: PaginatedAnnotationFiles,
  disabled?: boolean
}> = ({ files, disabled = false }) => {
  const { campaign } = useRetrieveCurrentCampaign()
  const { phase, isEditable } = useRetrieveCurrentPhase()
  const navigate = useNavigate()

  const tooltip: string = useMemo(() => {
    if (files && files.count > 0 && !files.resume) return 'Cannot resume if filters are activated'
    if (disabled) return 'No files to annotate'
    return 'Resume annotation'
  }, [ files, disabled ])

  const resume = useCallback(() => {
    if (!campaign || !phase || !files) return;
    navigate(`/annotation-campaign/${ campaign.id }/phase/${ phase.id }/file/${ files.resume }`);
  }, [ campaign, phase, files ])

  if (!isEditable) return <Fragment/>
  return <TooltipOverlay tooltipContent={ <p>{ tooltip }</p> } anchor='right'>
    <Button color="primary" fill='outline' aria-label='Resume'
            disabled={ !(files && files.count > 0) || !files?.resume || disabled }
            style={ { pointerEvents: 'unset' } }
            onClick={ resume }>
      <IonIcon icon={ playOutline } slot="icon-only"/>
    </Button>
  </TooltipOverlay>
}

export const ImportAnnotationsButton: React.FC = () => {
  const { campaign, hasAdminAccess  } = useRetrieveCurrentCampaign()
  const { verificationPhase } = useListPhasesForCurrentCampaign()
  const { phase, isEditable } = useRetrieveCurrentPhase()

  const path = useMemo(() => {
    return `/annotation-campaign/${ campaign?.id }/phase/${ phase?.id }/import-annotations`
  }, [ campaign, phase ])

  if (phase?.phase !== 'Annotation') return <Fragment/>
  if (!verificationPhase) return <Fragment/>
  if (!hasAdminAccess) return <Fragment/>
  if (!isEditable) return <Fragment/>
  return <TooltipOverlay tooltipContent={ <p>Import annotations for verification</p> } anchor='right'>
    <Link appPath={ path } fill='outline' color='medium' aria-label='Import'>
      <IonIcon icon={ cloudDownloadOutline } slot='icon-only'/>
    </Link>
  </TooltipOverlay>
}

export const ManageAnnotatorsButton: React.FC = () => {
  const { campaign, hasAdminAccess } = useRetrieveCurrentCampaign()
  const { phase, isEditable } = useRetrieveCurrentPhase()

  const path = useMemo(() => {
    return `/annotation-campaign/${ campaign?.id }/phase/${ phase?.id }/edit-annotators`
  }, [ campaign, phase ])

  if (!hasAdminAccess) return <Fragment/>
  if (!isEditable) return <Fragment/>
  return <TooltipOverlay tooltipContent={ <p>Manage annotators</p> } anchor='right'>
    <Link appPath={ path } fill='outline' color='medium' aria-label='Manage'>
      <IonIcon icon={ peopleOutline } slot='icon-only'/>
    </Link>
  </TooltipOverlay>
}