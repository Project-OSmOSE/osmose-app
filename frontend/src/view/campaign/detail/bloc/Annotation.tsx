import styles from "../Detail.module.scss";
import React, { Fragment, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { CampaignAPI } from "@/service/campaign";
import { FadedText } from "@/components/ui";
import { IonButton, IonSpinner } from "@ionic/react";
import { createPortal } from "react-dom";
import { LabelSetAPI } from "@/service/campaign/label-set";
import { ConfidenceSetAPI } from "@/service/campaign/confidence-set";
import { LabelSetModal } from "@/view/campaign/detail/bloc/modal";

export const Annotation: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>();
  const { data: campaign } = CampaignAPI.useRetrieveQuery(campaignID);
  const {
    data: labelSet,
    isLoading: isLoadingLabelSet
  } = LabelSetAPI.useRetrieveQuery(campaign!.label_set, { skip: !campaign });
  const {
    data: confidenceSet,
    isLoading: isLoadingConfidenceSet
  } = ConfidenceSetAPI.useRetrieveQuery(campaign?.confidence_indicator_set ?? -1, { skip: !campaign?.confidence_indicator_set });

  const [ isLabelModalOpen, setIsLabelModalOpen ] = useState<boolean>(false);

  const toggleLabelModal = useCallback(() => setIsLabelModalOpen(prev => !prev), [])

  if (!campaign) return <Fragment/>
  return <div className={ styles.bloc }>

    { (isLoadingLabelSet || isLoadingConfidenceSet) && <IonSpinner/> }

    {/* Label set*/ }
    { labelSet && <Fragment>
        <div>
            <FadedText>Label set</FadedText>
            <p>{ labelSet.name }</p>
        </div>

        <IonButton fill='outline' color='medium' className='ion-text-wrap' onClick={ toggleLabelModal }>
            Detailed label set
        </IonButton>
      { isLabelModalOpen && createPortal(
        <LabelSetModal onClose={ toggleLabelModal }/>, document.body) }
    </Fragment> }

    {/* Confidence*/ }
    { !isLoadingConfidenceSet && <div>
        <FadedText>Confidence indicator set</FadedText>
      { !confidenceSet && <p>No confidence</p> }
      { confidenceSet && <p>{ confidenceSet.name }</p> }
    </div> }

    {/* Annotation type */}
    <div>
      <FadedText>Annotation types</FadedText>
      <p>Weak, box{ campaign.allow_point_annotation ? ', point' : '' }</p>
    </div>
  </div>
}