import styles from "../Detail.module.scss";
import React, { Fragment, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { CampaignAPI } from "@/service/campaign";
import { IonButton } from "@ionic/react";
import { createPortal } from "react-dom";
import { ProgressModal } from "@/view/campaign/detail/bloc/modal";
import { Progress } from "@/components/ui/Progress.tsx";

export const Progression: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>();
  const { data: campaign } = CampaignAPI.useRetrieveQuery(campaignID);
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false);

  const toggleModal = useCallback(() => setIsModalOpen(prev => !prev), [])

  if (!campaign) return <Fragment/>
  return <div className={ styles.bloc }>

    {/* Current user */ }
    { campaign.user_total > 0 && <Progress label='My progress' color='primary'
                                         value={ campaign.my_progress } total={ campaign.user_total }/> }

    {/* Total */ }
    <Progress label='Global progress'
              value={ campaign.progress } total={ campaign.total }/>

    <IonButton fill='outline' color='medium' className='ion-text-wrap' onClick={ toggleModal }>
      Detailed progression
    </IonButton>
    { isModalOpen && createPortal(<ProgressModal onClose={ toggleModal }/>, document.body) }

  </div>
}