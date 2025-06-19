import React, { Fragment, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { useToast } from "@/service/ui";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { FadedText, Link, WarningText } from "@/components/ui";
import { getErrorMessage } from "@/service/function.ts";
import { mailOutline } from "ionicons/icons";
import styles from "./styles.module.scss";
import { CampaignPhaseTab } from "@/components/AnnotationCampaign/Phase";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";

export const AnnotationCampaignDetail: React.FC = () => {
  const {
    campaignID,
    campaign,
    isLoading: isLoadingCampaign,
    error: errorLoadingCampaign,
  } = useRetrieveCurrentCampaign();
  const { phase } = useRetrieveCurrentPhase()

  const toast = useToast();

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
      <Link appPath={ `/annotation-campaign/${ campaignID }` }
            className={ !phase ? styles.active : undefined }>
        Information
      </Link>

      <CampaignPhaseTab phase='Annotation'/>
      <CampaignPhaseTab phase='Verification'/>
    </div>

    <Outlet/>
  </Fragment>
}
