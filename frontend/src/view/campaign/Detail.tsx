import React, { Fragment, useCallback, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { CampaignAPI, useHasAdminAccessToCampaign } from "@/service/campaign";
import { useToast } from "@/service/ui";
import { getDisplayName } from "@/service/user";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { FadedText, Link, WarningText } from "@/components/ui";
import { getErrorMessage } from "@/service/function.ts";
import { mailOutline } from "ionicons/icons";
import styles from "./styles.module.scss";
import { CreateAnnotationPhaseButton, CreateVerificationPhaseButton } from "@/components/AnnotationCampaign/Phase";

export const AnnotationCampaignDetail: React.FC = () => {
  const {
    data: campaign,
    isLoading: isLoadingCampaign,
    error: errorLoadingCampaign,
    currentPhase
  } = CampaignAPI.useRetrieveQuery();
  const hasAdminAccess = useHasAdminAccessToCampaign(campaign)

  const toast = useToast();

  const annotationPhase = useMemo(() => campaign?.phases.find(p => p.phase === 'Annotation'), [ campaign ])
  const verificationPhase = useMemo(() => campaign?.phases.find(p => p.phase === 'Verification'), [ campaign ])

  const copyOwnerMail = useCallback(async () => {
    if (!campaign) return;
    await navigator.clipboard.writeText(campaign.owner.email)
    toast.presentSuccess(`Successfully copy ${ getDisplayName(campaign.owner) } email address into the clipboard`)
  }, [ campaign?.owner.email ])

  if (isLoadingCampaign) return <IonSpinner/>
  if (errorLoadingCampaign) return <WarningText>{ getErrorMessage(errorLoadingCampaign) }</WarningText>
  if (!campaign) return <Fragment/>

  return <Fragment>

    <div className={ styles.header }>
      <h2>{ campaign.name }</h2>
      <FadedText>
        Created on { new Date(campaign.created_at).toLocaleDateString() } by { getDisplayName(campaign.owner) }
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
            className={ !currentPhase ? styles.active : undefined }>
        Information
      </Link>

      {/* Annotation phase */ }
      { annotationPhase && <Link appPath={ `/annotation-campaign/${ campaign.id }/phase/${ annotationPhase.id }` }
                                 className={ currentPhase?.id === annotationPhase.id ? styles.active : undefined }>
          Annotation
      </Link> }
      { !annotationPhase && hasAdminAccess && <CreateAnnotationPhaseButton/> }

      {/* Verification phase */ }
      { verificationPhase && <Link appPath={ `/annotation-campaign/${ campaign.id }/phase/${ verificationPhase.id }` }
                                   className={ currentPhase?.id === verificationPhase.id ? styles.active : undefined }>
          Verification
      </Link> }
      { !verificationPhase && hasAdminAccess && <CreateVerificationPhaseButton/> }
    </div>

    <Outlet/>
  </Fragment>
}
