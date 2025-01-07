import React, { useMemo, useState } from "react";
import { AnnotationCampaign } from "@/service/campaign";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { archiveOutline, helpBuoyOutline } from "ionicons/icons";
import { FadedText } from "@/components/ui";
import styles from "./Detail.module.scss";
import { createPortal } from "react-dom";
import { AudioMetadataModal, ProgressModal, SpectrogramConfigurationsModal } from "./modals";
import { useGetCurrentUserQuery } from "@/service/user";
import { useRetrieveLabelSetQuery } from "@/service/campaign/label-set";
import { useRetrieveConfidenceSetQuery } from "@/service/campaign/confidence-set";
import { Progress } from "@/components/ui/Progress.tsx";

export const DetailPageSide: React.FC<{ campaign: AnnotationCampaign }> = ({ campaign }) => {

  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: labelSet, isLoading: isLoadingLabelSet } = useRetrieveLabelSetQuery(campaign.label_set);
  const {
    data: confidenceSet,
    isLoading: isLoadingConfidenceSet
  } = useRetrieveConfidenceSetQuery(campaign.confidence_indicator_set ?? -1, { skip: !campaign.confidence_indicator_set });

  const [ isSpectrogramModalOpen, setIsSpectrogramModalOpen ] = useState<boolean>(false);
  const [ isAudioModalOpen, setIsAudioModalOpen ] = useState<boolean>(false);
  const [ isProgressModalOpen, setIsProgressModalOpen ] = useState<boolean>(false);

  const isOwner = useMemo(() => {
    return currentUser?.is_staff || currentUser?.is_superuser || campaign.owner === currentUser?.username
  }, [ currentUser, campaign.owner ]);

  function openInstructions() {
    if (!campaign.instructions_url) return;
    window.open(campaign.instructions_url, "_blank", "noopener, noreferrer")
  }

  function toggleSpectrogramModal() {
    setIsSpectrogramModalOpen(isOpen => !isOpen);
  }

  function toggleAudioModal() {
    setIsAudioModalOpen(isOpen => !isOpen);
  }

  function toggleProgressModal() {
    setIsProgressModalOpen(isOpen => !isOpen);
  }

  return <div className={ styles.side }>
    { campaign.instructions_url && <IonButton color="warning" fill="outline" onClick={ openInstructions }>
        <IonIcon icon={ helpBuoyOutline } slot="start"/> Instructions
    </IonButton> }

    <div className={ styles.bloc }>
      { campaign.deadline && <div><FadedText>Deadline</FadedText><p>{ campaign.deadline }</p></div> }

      <div><FadedText>Annotation mode</FadedText><p>{ campaign.usage } annotations</p></div>
    </div>

    <div className={ styles.bloc }>
      <div>
        <FadedText>Dataset{ campaign.datasets.length > 1 ? 's' : '' }</FadedText>
        <p>{ campaign.datasets.join(', ') }</p>
      </div>

      <IonButton fill='outline' color='medium' onClick={ toggleSpectrogramModal }>
        Spectrogram configuration{ campaign.spectro_configs.length > 1 ? 's' : '' }
      </IonButton>
      { isSpectrogramModalOpen && createPortal(
        <SpectrogramConfigurationsModal campaign={ campaign }
                                        isOwner={ isOwner }
                                        onClose={ toggleSpectrogramModal }/>,
        document.body) }

      <IonButton fill='outline' color='medium' onClick={ toggleAudioModal }>
        Audio metadata
      </IonButton>
      { isAudioModalOpen && createPortal(
        <AudioMetadataModal campaign={ campaign }
                            isOwner={ isOwner }
                            onClose={ toggleAudioModal }/>,
        document.body) }
    </div>

    <div className={ styles.bloc }>
      <div>
        <FadedText>Label set</FadedText>
        { isLoadingLabelSet && <IonSpinner/> }
        { labelSet && <p>{ labelSet.name }</p> }
      </div>
      { campaign.labels_with_acoustic_features.length > 0 && (
        <div><FadedText>Detailed labels</FadedText><p>{ campaign.labels_with_acoustic_features.join(', ') }</p></div>
      ) }

      <div>
        <FadedText>Confidence indicator set</FadedText>
        { isLoadingConfidenceSet && <IonSpinner/> }
        { !confidenceSet && <p>No confidence</p> }
        { confidenceSet && <p>{ confidenceSet.name }</p> }
      </div>
    </div>

    <div className={ styles.bloc }>
      <Progress label='My progress' color='primary'
                value={ campaign.my_progress } total={ campaign.my_total }/>

      <Progress label='Global progress'
                value={ campaign.progress } total={ campaign.total }/>

      <IonButton fill='outline' color='medium' onClick={ toggleProgressModal }>
        Detailed progression
      </IonButton>
      { isProgressModalOpen && createPortal(
        <ProgressModal campaign={ campaign }
                       isOwner={ isOwner }
                       onClose={ toggleProgressModal }/>,
        document.body) }
    </div>

    { isOwner && (
      <div className={ [styles.bloc, styles.last].join(' ') }>
        <IonButton color='medium' fill='outline'>
          <IonIcon icon={ archiveOutline } slot='start'/>
          Archive
        </IonButton>
      </div>
    ) }

  </div>
}