import React, { Fragment, useMemo } from "react";

import styles from './styles.module.scss'
import { FadedText } from "@/components/ui";
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
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useGetLabelSetForCurrentCampaign } from "@/service/api/label-set.ts";
import { useGetConfidenceSetForCurrentCampaign } from "@/service/api/confidence-set.ts";

export const AnnotationCampaignDetailInfo: React.FC = () => {
  const { campaign, hasAdminAccess } = useRetrieveCurrentCampaign()
  const { labelSet, isLoading: isLoadingLabelSet } = useGetLabelSetForCurrentCampaign();
  const { confidenceSet, isLoading: isLoadingConfidenceSet } = useGetConfidenceSetForCurrentCampaign();
  const audioFilename = useMemo(() => campaign?.name.replaceAll(' ', '_') + '_audio_metadata.csv', [ campaign?.name ])
  const spectrogramFilename = useMemo(() => campaign?.name.replaceAll(' ', '_') + '_spectrogram_configuration.csv', [ campaign?.name ])

  if (!campaign) return <Fragment/>
  return <div className={ styles.info }>

    { campaign.desc && <div><FadedText>Description</FadedText><p>{ campaign.desc }</p></div> }

    {/* GLOBAL */ }
    <AnnotationCampaignArchiveButton/>
    { campaign.archive && <FadedText>
        Archived
        on { new Date(campaign.archive.date).toLocaleDateString() } by { campaign.archive?.by_user.display_name }
    </FadedText> }
    <AnnotationCampaignInstructionsButton/>
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
    { campaign?.phases.length > 0 && <Fragment>
        <div className={ styles.bloc }>
          { (isLoadingLabelSet || isLoadingConfidenceSet) && <IonSpinner/> }
          { !isLoadingLabelSet && <div>
              <FadedText>Label set</FadedText>
            { !labelSet && <p>No label set</p> }{ labelSet && <p>{ labelSet.name }</p> }
          </div> }
          { labelSet && <LabelSetModalButton/> }
          { !isLoadingConfidenceSet && <div>
              <FadedText>Confidence indicator set</FadedText>
            { !confidenceSet && <p>No confidence</p> }{ confidenceSet && <p>{ confidenceSet.name }</p> }
          </div> }
            <div><FadedText>Annotation types</FadedText><p>Weak,
                box{ campaign.allow_point_annotation ? ', point' : '' }</p>
            </div>
        </div>
    </Fragment> }
  </div>
}