import React, { Fragment, useCallback } from "react";
import { AnnotationCampaign, CampaignAPI, useHasAdminAccessToCampaign } from "@/service/campaign";
import { IonButton, IonIcon } from "@ionic/react";
import { archiveOutline, helpBuoyOutline } from "ionicons/icons";
import { useAlert } from "@/service/ui";
import { Link } from "@/components/ui";
import { createPortal } from "react-dom";
import { useModal } from "@/service/ui/modal.ts";
import { AcquisitionModal } from "./modals/AcquisitionModal.tsx";

export const AnnotationCampaignArchiveButton: React.FC<{
  campaign: AnnotationCampaign;
}> = ({ campaign }) => {
  const [ archiveCampaign ] = CampaignAPI.useArchiveMutation()
  const hasAdminAccess = useHasAdminAccessToCampaign(campaign)
  const alert = useAlert();

  const archive = useCallback(async () => {
    if (!campaign) return;
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

  if (!hasAdminAccess || campaign.archive) return <Fragment/>
  return <IonButton color='medium' fill='outline' onClick={ archive }>
    <IonIcon icon={ archiveOutline } slot='start'/>
    Archive
  </IonButton>
}

export const AnnotationCampaignInstructionsButton: React.FC<{
  campaign: AnnotationCampaign;
}> = ({ campaign }) => {
  if (!campaign.instructions_url) return <Fragment/>
  return <Link color='warning' fill='outline' href={ campaign.instructions_url }>
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
