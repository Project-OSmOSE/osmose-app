import React, { Fragment, useMemo } from "react";

import styles from './styles.module.scss'
import { FadedText } from "@/components/ui";
import {
  AnnotationCampaignAcquisitionModalButton,
  AnnotationCampaignArchiveButton,
  AnnotationCampaignInstructionsButton,
} from "@/components/AnnotationCampaign";
import { dateToString, pluralize } from "@/service/function.ts";
import { AudioMetadataModalButton } from "@/components/Dataset/AudioMetadata";
import { SpectrogramMetadataModalButton } from "@/components/Dataset/SpectrogramMetadata";
import { IonSpinner } from "@ionic/react";
import { LabelSetModalButton } from "@/components/AnnotationCampaign/Label/Modal.tsx";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useGetLabelSetForCurrentCampaign } from "@/service/api/label-set.ts";
import { useGetConfidenceSetForCurrentCampaign } from "@/service/api/confidence-set.ts";
import { useListSpectrogramForCurrentCampaign } from "@/service/api/spectrogram-configuration.ts";
import { useListPhasesForCurrentCampaign } from "@/service/api/campaign-phase.ts";
import { PhaseGlobalProgress } from "@/components/AnnotationCampaign/Phase";

export const AnnotationCampaignDetailInfo: React.FC = () => {
  const { campaign, hasAdminAccess } = useRetrieveCurrentCampaign()
  const { phases } = useListPhasesForCurrentCampaign()
  const { labelSet, isLoading: isLoadingLabelSet } = useGetLabelSetForCurrentCampaign();
  const { confidenceSet, isLoading: isLoadingConfidenceSet } = useGetConfidenceSetForCurrentCampaign();
  const audioFilename = useMemo(() => campaign?.name.replaceAll(' ', '_') + '_audio_metadata.csv', [ campaign?.name ])
  const spectrogramFilename = useMemo(() => campaign?.name.replaceAll(' ', '_') + '_spectrogram_configuration.csv', [ campaign?.name ])
  const { configurations } = useListSpectrogramForCurrentCampaign()

  if (!campaign) return <Fragment/>
  return <div className={ styles.info }>

    { campaign.desc && <div><FadedText>Description</FadedText><p>{ campaign.desc }</p></div> }

    {/* GLOBAL */ }
    <AnnotationCampaignArchiveButton/>
    { campaign.archive && <FadedText>
        Archived
        on { dateToString(campaign.archive.date) } by { campaign.archive?.by_user.display_name }
    </FadedText> }
    <AnnotationCampaignInstructionsButton/>
    { campaign.deadline && <div>
        <FadedText>Deadline</FadedText>
        <p>{ dateToString(campaign.deadline) }</p>
    </div> }

    {/* DATA */ }
    <div className={ styles.bloc }>
      <div>
        <FadedText>Dataset{ pluralize(campaign.datasets) }</FadedText>
        <p>{ campaign.datasets.join(', ') }</p>
      </div>
      <AnnotationCampaignAcquisitionModalButton/>
    </div>
    <div className={ styles.bloc }>
      { configurations && <div>
          <FadedText>Spectrogram configuration{ pluralize(configurations) }</FadedText>
          <p>{ configurations.map(c => c.name).join(', ') }</p>
      </div> }
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
          { !isLoadingLabelSet && <Fragment>
              <div>
                  <FadedText>Label set</FadedText>
                { labelSet ? <p>{ labelSet.name }</p> : <p>No label set</p> }
              </div>
            { labelSet && <div>
                <FadedText>Label{ pluralize(labelSet.labels) }</FadedText>
                <p>{ labelSet.labels.join(', ') }</p>
            </div> }
              <div>
                  <FadedText>
                      Label{ pluralize(campaign.labels_with_acoustic_features) } with acoustic features
                  </FadedText>
                { campaign.labels_with_acoustic_features.length > 0 ?
                  <p>{ campaign.labels_with_acoustic_features.join(', ') }</p>
                  : <p>No labels with features</p> }
              </div>
          </Fragment> }
          { labelSet && <LabelSetModalButton/> }
        </div>

        <div className={ styles.bloc }>
          { !isLoadingConfidenceSet && <Fragment>
              <div>
                  <FadedText>Confidence indicator set</FadedText>
                { !confidenceSet && <p>No confidence</p> }{ confidenceSet && <p>{ confidenceSet.name }</p> }
              </div>
            { confidenceSet && <div>
                <FadedText>Indicator{ pluralize(confidenceSet.confidence_indicators) }</FadedText>
                <p>{ confidenceSet.confidence_indicators.map(i => i.label).join(', ') }</p>
            </div> }
          </Fragment> }
        </div>
        <div className={ styles.bloc }>
            <div><FadedText>Annotation types</FadedText><p>Weak,
                box{ campaign.allow_point_annotation ? ', point' : '' }</p>
            </div>
        </div>
    </Fragment> }

    {/* PROGRESS */ }
    { phases && phases.map(p => <div key={ p.id } className={ styles.bloc }>
      <FadedText>{ p.phase } progress</FadedText>
      <PhaseGlobalProgress phase={ p } withoutLabel className={ styles.progress }/>
    </div>) }
  </div>
}