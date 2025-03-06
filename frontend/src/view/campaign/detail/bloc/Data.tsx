import styles from "../Detail.module.scss";
import React, { Fragment, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { CampaignAPI } from "@/service/campaign";
import { FadedText } from "@/components/ui";
import { pluralize } from "@/service/function.ts";
import { IonButton } from "@ionic/react";
import { createPortal } from "react-dom";
import { AcquisitionModal, AudioModal, SpectrogramModal } from "./modal";

export const Data: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>();
  const { data: campaign } = CampaignAPI.useRetrieveQuery(campaignID);
  const [ isAcquisitionModalOpen, setIsAcquisitionModalOpen ] = useState<boolean>(false);
  const [ isSpectrogramModalOpen, setIsSpectrogramModalOpen ] = useState<boolean>(false);
  const [ isAudioModalOpen, setIsAudioModalOpen ] = useState<boolean>(false);

  const toggleAcquisitionModal = useCallback(() => setIsAcquisitionModalOpen(prev => !prev), [])
  const toggleSpectrogramModal = useCallback(() => setIsSpectrogramModalOpen(prev => !prev), [])
  const toggleAudioModal = useCallback(() => setIsAudioModalOpen(prev => !prev), [])

  if (!campaign) return <Fragment/>
  return <div className={ styles.bloc }>
    <div>
      <FadedText>Dataset{ pluralize(campaign.datasets) }</FadedText>
      <p>{ campaign.datasets.join(', ') }</p>
    </div>

    <IonButton fill='outline' color='medium' className='ion-text-wrap' onClick={ toggleAcquisitionModal }>
      Acquisition information
    </IonButton>
    { isAcquisitionModalOpen && createPortal(<AcquisitionModal onClose={ toggleAcquisitionModal }/>, document.body) }

    <IonButton fill='outline' color='medium' className='ion-text-wrap' onClick={ toggleSpectrogramModal }>
      Spectrogram configuration{ campaign && campaign.spectro_configs.length > 1 ? 's' : '' }
    </IonButton>
    { isSpectrogramModalOpen && createPortal(<SpectrogramModal onClose={ toggleSpectrogramModal }/>, document.body) }

    <IonButton fill='outline' color='medium' className='ion-text-wrap' onClick={ toggleAudioModal }>
      Audio metadata
    </IonButton>
    { campaign && isAudioModalOpen && createPortal(<AudioModal onClose={ toggleAudioModal }/>, document.body) }
  </div>
}