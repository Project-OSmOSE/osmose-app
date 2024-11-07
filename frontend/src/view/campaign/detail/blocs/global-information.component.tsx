import React, { Fragment, useEffect, useState } from 'react';
import { IonButton, IonIcon, useIonAlert } from "@ionic/react";
import { archiveOutline, calendarClear, crop, documents, people, pricetag } from "ionicons/icons";
import './blocs.css';
import {
  AnnotationCampaign,
  useAnnotationCampaignAPI,
  ConfidenceIndicatorSet,
  useConfidenceSetAPI,
  LabelSet,
  useLabelSetAPI
} from "@/services/api";

interface Props {
  campaign: AnnotationCampaign,
  isEditionAllowed: boolean,
  annotatorsStatus: Map<string, { total: number, progress: number }>,
  setCampaign: (campaign: AnnotationCampaign) => void,
  setError: (e: any) => void,
}

export const DetailCampaignGlobalInformation: React.FC<Props> = ({
                                                                   campaign,
                                                                   isEditionAllowed,
                                                                   annotatorsStatus,
                                                                   setCampaign,
                                                                   setError
                                                                 }) => {
  // State
  const [ labelSet, setLabelSet ] = useState<LabelSet | undefined>(undefined);
  const [ confidenceSet, setConfidenceSet ] = useState<ConfidenceIndicatorSet | undefined>(undefined);

  // Service
  const [ presentAlert ] = useIonAlert();
  const campaignService = useAnnotationCampaignAPI();
  const labelSetService = useLabelSetAPI();
  const confidenceSetService = useConfidenceSetAPI();

  useEffect(() => {
    let isCancelled = false;

    labelSetService.retrieve(campaign.label_set).then(setLabelSet).catch(e => {
      if (isCancelled) return;
      setError(e);
    })

    return () => {
      isCancelled = true;
      labelSetService.abort();
    }
  }, [ campaign.label_set ])

  useEffect(() => {
    if (!campaign.confidence_indicator_set) {
      setConfidenceSet(undefined);
      return;
    }
    let isCancelled = false;

    confidenceSetService.retrieve(campaign.confidence_indicator_set).then(setConfidenceSet).catch(e => {
      if (isCancelled) return;
      setError(e);
    })

    return () => {
      isCancelled = true;
      labelSetService.abort();
    }
  }, [ campaign.confidence_indicator_set ])

  const archive = async () => {
    if (!campaign) return;
    if ([ ...annotatorsStatus.values() ].filter(s => s.progress < s.total).length > 0) {
      // If annotators haven't finished yet, ask for confirmation
      return await presentAlert({
        header: 'Archive',
        message: 'There is still unfinished annotations.\nAre you sure you want to archive this campaign?',
        cssClass: 'danger-confirm-alert',
        buttons: [
          'Cancel',
          {
            text: 'Archive',
            cssClass: 'ion-color-danger',
            handler: update
          }
        ]
      });
    } else update()
  }

  const update = async () => {
    const updatedCampaign = await campaignService.archive(campaign.id);
    setCampaign(updatedCampaign)
  }

  return (
    <div id="campaign-detail-global-info" className="bloc">
      <h5>Global information</h5>

      <div className="item">
        <IonIcon className="icon" icon={ pricetag }/>
        <p className="label">Label set:</p>
        <p>{ labelSet?.name }</p>
      </div>

      <div className="item">
        { confidenceSet && <Fragment>
            <i className="icon fa fa-handshake"></i>
            <p className="label">Confidence indicator set:</p>
            <p>{ confidenceSet?.name }</p>
        </Fragment> }
      </div>

      <div className="item">
        <IonIcon className="icon" icon={ documents }/>
        <p className="label">Dataset:</p>
        <p>{ campaign.datasets.join(', ') }</p>
      </div>

      <div className="item">
        <IonIcon className="icon" icon={ people }/>
        <p className="label">Annotators:</p>
        <p>{ [ ...new Set(annotatorsStatus.keys()) ].length }</p>
      </div>

      <div className="item">
        <IonIcon className="icon" icon={ crop }/>
        <p className="label">Mode:</p>
        <p>{ campaign.usage }</p>
      </div>

      <div className="item">
        { campaign.deadline && <Fragment>
            <IonIcon className="icon" icon={ calendarClear }/>
            <p className="label">Deadline:</p>
            <p>{ new Date(campaign.deadline).toLocaleDateString() }</p>
        </Fragment> }
      </div>

      { campaign.desc && <div className="description">
          <p className="label">Description:</p>
          <p>{ campaign.desc }</p>
      </div> }

      { isEditionAllowed && <div className="buttons">
          <IonButton color={ "medium" }
                     onClick={ archive }>
              <IonIcon icon={ archiveOutline }/>
              Archive
          </IonButton>
      </div> }
    </div>
  )
}
