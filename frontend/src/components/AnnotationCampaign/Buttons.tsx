import React, { Fragment, useCallback } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { archiveOutline, helpBuoyOutline } from "ionicons/icons";
import { useAlert } from "@/service/ui";
import { Link } from "@/components/ui";
import { createPortal } from "react-dom";
import { useModal } from "@/service/ui/modal.ts";
import { AcquisitionModal } from "./modals/AcquisitionModal.tsx";
import { CampaignAPI, useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";

export const AnnotationCampaignArchiveButton: React.FC = () => {
  const [ archiveCampaign ] = CampaignAPI.endpoints.archiveCampaign.useMutation()
  const { campaign, hasAdminAccess } = useRetrieveCurrentCampaign()
  const alert = useAlert();

  const archive = useCallback(async () => {
    if (!campaign) return;
    if (campaign.phases.length === 0) {
      return alert.showAlert({
        type: 'Warning',
        message: 'The campaign is empty.\nAre you sure you want to archive this campaign?',
        actions: [ {
          label: 'Archive',
          callback: () => archiveCampaign(campaign.id)
        } ]
      })
    }
    const progress = campaign.phases.reduce((previousValue, p) => previousValue + p.global_progress, 0);
    const total = campaign.phases.reduce((previousValue, p) => previousValue + p.global_total, 0);
    if (progress < total) {
      // If annotators haven't finished yet, ask for confirmation
      return alert.showAlert({
        type: 'Warning',
        message: 'There is still unfinished annotations.\nAre you sure you want to archive this campaign?',
        actions: [ {
          label: 'Archive',
          callback: () => archiveCampaign(campaign.id)
        } ]
      });
    } else archiveCampaign(campaign.id)
  }, [ campaign ]);

  if (!hasAdminAccess || !campaign || campaign.archive) return <Fragment/>
  return <IonButton color='medium' fill='outline' onClick={ archive }>
    <IonIcon icon={ archiveOutline } slot='start'/>
    Archive
  </IonButton>
}

export const AnnotationCampaignInstructionsButton: React.FC = () => {
  const { campaign } = useRetrieveCurrentCampaign()
  if (!campaign?.instructions_url) return <Fragment/>
  return <Link color='warning' fill='outline' href={ campaign?.instructions_url }>
    <IonIcon icon={ helpBuoyOutline } slot="start"/>
    Instructions
  </Link>
}

export const AnnotationCampaignAcquisitionModalButton: React.FC = () => {
  const modal = useModal()
  return <Fragment>
    <IonButton fill='outline' color='medium' className='ion-text-wrap' onClick={ modal.toggle }>
      Acquisition information
    </IonButton>
    { modal.isOpen && createPortal(<AcquisitionModal onClose={ modal.toggle }/>, document.body) }
  </Fragment>
}
