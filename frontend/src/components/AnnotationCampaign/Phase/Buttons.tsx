import React, { Fragment, useCallback, useMemo } from "react";
import { Button, Link, TooltipOverlay } from "@/components/ui";
import { IonIcon } from "@ionic/react";
import { cloudDownloadOutline, peopleOutline, playOutline } from "ionicons/icons";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useListPhasesForCurrentCampaign, useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";
import { PaginatedAnnotationFiles } from "@/service/api/annotation-file-range.ts";
import { useOpenAnnotator } from "@/service/annotator/hooks.ts";

export const ResumeButton: React.FC<{
  files?: PaginatedAnnotationFiles,
  disabled?: boolean
}> = ({ files, disabled = false }) => {
  const { isEditable } = useRetrieveCurrentPhase()
  const openAnnotator = useOpenAnnotator()

  const tooltip: string = useMemo(() => {
    if (files && files.count > 0 && !files.resume) return 'Cannot resume if filters are activated'
    if (disabled) return 'No files to annotate'
    return 'Resume annotation'
  }, [ files, disabled ])

  const resume = useCallback(() => {
    if (!files?.resume) return;
    openAnnotator(files.resume)
  }, [ files ])

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
  const { campaignID, hasAdminAccess } = useRetrieveCurrentCampaign()
  const { verificationPhase } = useListPhasesForCurrentCampaign()
  const { phaseID, phase, isEditable } = useRetrieveCurrentPhase()

  const path = useMemo(() => {
    return `/annotation-campaign/${ campaignID }/phase/${ phaseID }/import-annotations`
  }, [ campaignID, phaseID ])

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
  const { campaignID, hasAdminAccess } = useRetrieveCurrentCampaign()
  const { phaseID, isEditable } = useRetrieveCurrentPhase()

  const path = useMemo(() => {
    return `/annotation-campaign/${ campaignID }/phase/${ phaseID }/edit-annotators`
  }, [ campaignID, phaseID ])

  if (!hasAdminAccess) return <Fragment/>
  if (!isEditable) return <Fragment/>
  return <TooltipOverlay tooltipContent={ <p>Manage annotators</p> } anchor='right'>
    <Link appPath={ path } fill='outline' color='medium' aria-label='Manage'>
      <IonIcon icon={ peopleOutline } slot='icon-only'/>
    </Link>
  </TooltipOverlay>
}