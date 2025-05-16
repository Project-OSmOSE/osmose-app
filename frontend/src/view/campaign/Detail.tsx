import React, { Fragment, useCallback, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { useToast } from "@/service/ui";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { FadedText, Link, WarningText } from "@/components/ui";
import { getErrorMessage } from "@/service/function.ts";
import { mailOutline } from "ionicons/icons";
import styles from "./styles.module.scss";
import { CreateAnnotationPhaseButton, CreateVerificationPhaseButton } from "@/components/AnnotationCampaign/Phase";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useListPhasesForCurrentCampaign, useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";
import { Deactivatable } from "@/components/ui/Deactivatable.tsx";

export const AnnotationCampaignDetail: React.FC = () => {
  const {
    campaign,
    isLoading: isLoadingCampaign,
    error: errorLoadingCampaign,
    hasAdminAccess
  } = useRetrieveCurrentCampaign();
  const { phases, isFetching: isFetchingPhases } = useListPhasesForCurrentCampaign()
  const { phase } = useRetrieveCurrentPhase()

  const toast = useToast();

  const annotationPhase = useMemo(() => phases?.find(p => p.phase === 'Annotation'), [ phases ])
  const verificationPhase = useMemo(() => phases?.find(p => p.phase === 'Verification'), [ phases ])

  const copyOwnerMail = useCallback(async () => {
    if (!campaign) return;
    await navigator.clipboard.writeText(campaign.owner.email)
    toast.presentSuccess(`Successfully copy ${ campaign.owner.display_name } email address into the clipboard`)
  }, [ campaign?.owner.email ])

  if (isLoadingCampaign) return <IonSpinner/>
  if (errorLoadingCampaign) return <WarningText>{ getErrorMessage(errorLoadingCampaign) }</WarningText>
  if (!campaign) return <Fragment/>

  return <Fragment>

    <div className={ styles.header }>
      <h2>{ campaign.name }</h2>
      <FadedText>
        Created on { new Date(campaign.created_at).toLocaleDateString() } by { campaign.owner.display_name }
        { campaign.owner.email && <Fragment>
            &nbsp;
            <IonButton fill='clear' color='medium' size='small'
                       onClick={ copyOwnerMail } data-tooltip={ campaign.owner.email }>
                <IonIcon icon={ mailOutline } slot='icon-only'/>
            </IonButton>
        </Fragment> }
      </FadedText>
    </div>

    <div className={ styles.tabs }>
      <Link appPath={ `/annotation-campaign/${ campaign.id }` }
            className={ !phase ? styles.active : undefined }>
        Information
      </Link>

      {/* Annotation phase */ }
      <Deactivatable disabled={ isFetchingPhases } loading={ isFetchingPhases }>
        { annotationPhase && <Link appPath={ `/annotation-campaign/${ campaign.id }/phase/${ annotationPhase.id }` }
                                   className={ phase?.id === annotationPhase.id ? styles.active : undefined }>
            Annotation
        </Link> }
        { !annotationPhase && hasAdminAccess && <CreateAnnotationPhaseButton/> }
      </Deactivatable>

      {/* Verification phase */ }
      <Deactivatable disabled={ isFetchingPhases } loading={ isFetchingPhases }>
        { verificationPhase && <Link appPath={ `/annotation-campaign/${ campaign.id }/phase/${ verificationPhase.id }` }
                                     className={ phase?.id === verificationPhase.id ? styles.active : undefined }>
            Verification
        </Link> }
        { !verificationPhase && hasAdminAccess && <CreateVerificationPhaseButton/> }
      </Deactivatable>
    </div>

    <Outlet/>
  </Fragment>
}
