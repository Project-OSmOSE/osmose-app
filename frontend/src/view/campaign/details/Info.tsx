import React, { Fragment, useMemo } from "react";
import { useHasAdminAccessToCampaign } from "@/service/campaign";
import styles from './styles.module.scss'
import { FadedText } from "@/components/ui";
import { getDisplayName } from "@/service/user";
import {
  AnnotationCampaignAcquisitionModalButton,
  AnnotationCampaignArchiveButton,
  AnnotationCampaignInstructionsButton,
} from "@/components/AnnotationCampaign";
import { pluralize } from "@/service/function.ts";
import { AudioMetadataModalButton } from "@/components/Dataset/AudioMetadata";
import { SpectrogramMetadataModalButton } from "@/components/Dataset/SpectrogramMetadata";
import { IonSpinner } from "@ionic/react";
import { LabelSetModalButton } from "@/components/AnnotationCampaign/Label/Modal.tsx";
import { LabelSetAPI } from "@/service/campaign/label-set";
import { ConfidenceSetAPI } from "@/service/campaign/confidence-set";
import { usePageCampaign } from "@/service/routing";

export const AnnotationCampaignDetailInfo: React.FC = () => {
  const campaign = usePageCampaign()
  const {
    data: labelSet,
    isLoading: isLoadingLabelSet
  } = LabelSetAPI.useRetrieveQuery(campaign!.label_set, { skip: !campaign });
  const {
    data: confidenceSet,
    isLoading: isLoadingConfidenceSet
  } = ConfidenceSetAPI.useRetrieveQuery(campaign?.confidence_indicator_set ?? -1, { skip: !campaign?.confidence_indicator_set });
  const audioFilename = useMemo(() => campaign?.name.replaceAll(' ', '_') + '_audio_metadata.csv', [ campaign?.name ])
  const spectrogramFilename = useMemo(() => campaign?.name.replaceAll(' ', '_') + '_spectrogram_configuration.csv', [ campaign?.name ])
  const hasAdminAccess = useHasAdminAccessToCampaign(campaign)

  if (!campaign) return <Fragment/>
  return <div className={ styles.info }>

    { campaign.desc && <div><FadedText>Description</FadedText><p>{ campaign.desc }</p></div> }

    {/* GLOBAL */ }
    <AnnotationCampaignArchiveButton campaign={ campaign }/>
    { campaign.archive && <FadedText>
        Archived
        on { new Date(campaign.archive.date).toLocaleDateString() } by { getDisplayName(campaign.archive?.by_user) }
    </FadedText> }
    <AnnotationCampaignInstructionsButton campaign={ campaign }/>
    { campaign.deadline && <div>
        <FadedText>Deadline</FadedText>
        <p>{ new Date(campaign.deadline).toLocaleDateString() }</p>
    </div> }

    {/* DATA */ }
    <div className={ styles.bloc }>
      <div>
        <FadedText>Dataset{ pluralize(campaign.datasets) }</FadedText>
        <p>{ campaign.datasets.join(', ') }</p>
      </div>

      <AnnotationCampaignAcquisitionModalButton/>

      <SpectrogramMetadataModalButton canDownload={ hasAdminAccess }
                                      filename={ spectrogramFilename }
                                      campaignID={ campaign.id }/>

      <AudioMetadataModalButton canDownload={ hasAdminAccess }
                                filename={ audioFilename }
                                campaignID={ campaign.id }/>
    </div>

    {/* ANNOTATION */ }
    <div className={ styles.bloc }>
      { (isLoadingLabelSet || isLoadingConfidenceSet) && <IonSpinner/> }
      { labelSet && <Fragment>
          <div><FadedText>Label set</FadedText><p>{ labelSet.name }</p></div>
          <LabelSetModalButton/>
      </Fragment> }
      { !isLoadingConfidenceSet && <div>
          <FadedText>Confidence indicator set</FadedText>
        { !confidenceSet && <p>No confidence</p> }{ confidenceSet && <p>{ confidenceSet.name }</p> }
      </div> }
      <div><FadedText>Annotation types</FadedText><p>Weak, box{ campaign.allow_point_annotation ? ', point' : '' }</p>
      </div>
    </div>
  </div>
}