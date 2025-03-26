import styles from "../Detail.module.scss";
import React, { Fragment, useCallback } from "react";
import { useParams } from "react-router-dom";
import { CampaignAPI, useHasAdminAccessToCampaign } from "@/service/campaign";
import { FadedText } from "@/components/ui";
import { IonButton, IonIcon } from "@ionic/react";
import { archiveOutline, helpBuoyOutline } from "ionicons/icons";
import { getDisplayName } from "@/service/user";
import { useAlert } from "@/service/ui";

export const Global: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>();
  const { data: campaign } = CampaignAPI.useRetrieveQuery(campaignID);
  const { hasAdminAccess } = useHasAdminAccessToCampaign(campaign)
  const [ archiveCampaign ] = CampaignAPI.useArchiveMutation()
  const alert = useAlert();

  const archive = useCallback(async () => {
    if (!campaign) return;
    if (campaign.progress < campaign.total) {
      // If annotators haven't finished yet, ask for confirmation
      return alert.showAlert({
        type: 'Warning',
        message: 'There is still unfinished annotations.\nAre you sure you want to archive this campaign?',
        action: {
          label: 'Archive',
          callback: () => archiveCampaign(campaign.id)
        }
      });
    } else archiveCampaign(campaign.id)
  }, [ campaign ]);

  const openInstructions = useCallback(() => {
    if (!campaign?.instructions_url) return;
    window.open(campaign?.instructions_url, "_blank", "noopener, noreferrer")
  }, [ campaign ]);

  if (!campaign) return <Fragment/>
  return <div className={ styles.bloc }>

    {/* Archive */ }
    { hasAdminAccess && !campaign.archive && <IonButton color='medium' fill='outline' onClick={ archive }>
        <IonIcon icon={ archiveOutline } slot='start'/>
        Archive
    </IonButton> }
    { campaign?.archive && <FadedText>
        Archived
        on { new Date(campaign.archive.date).toLocaleDateString() } by { getDisplayName(campaign.archive?.by_user) }
    </FadedText> }

    {/* Instructions */ }
    { campaign?.instructions_url &&
        <IonButton color="warning" fill="outline" onClick={ openInstructions }>
            <IonIcon icon={ helpBuoyOutline } slot="start"/> Instructions
        </IonButton> }

    {/* Deadline */ }
    { campaign?.deadline && <div>
        <FadedText>Deadline</FadedText>
        <p>{ new Date(campaign.deadline).toLocaleDateString() }</p>
    </div> }

    {/* Mode */ }
    <div>
      <FadedText>Annotation mode</FadedText>
      <p>{ campaign?.usage } annotations</p>
    </div>

  </div>
}